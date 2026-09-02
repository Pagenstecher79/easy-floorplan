import type { HistoryEventInput } from "./history-service";

/**
 * Thin a history window down to what a replay can actually draw.
 *
 * A busy plan produces far more events than either the timeline or the eye can
 * use: two hours of the demo's tracker sensors alone is ~2,700 points, and the
 * timeline spends its whole frame budget building markers nobody can
 * distinguish at 4px apart.
 *
 * The thinning is deliberately asymmetric, because the two kinds of history
 * here carry very different amounts of information per event:
 *
 * - **Discrete states** — a light turning on, a door opening, a cover reaching
 *   `closed` — are kept in full. Every one is a distinct thing that happened,
 *   they are already sparse, and dropping one makes the replay wrong rather
 *   than coarse.
 * - **Numeric drift** — a temperature wandering from 20.1 to 20.2 — is kept
 *   only when it moves by at least one step of the entity's own observed
 *   range. The shape of the curve survives; the sampling noise does not.
 *
 * Local extrema are always kept, so thinning cannot flatten a spike: the
 * hottest point of the day stays the hottest point of the day.
 */
export interface DownsampleOptions {
  /**
   * How many levels a numeric entity's range is divided into. A value moving
   * less than one level since the last kept point is dropped. Lower is
   * coarser; `0` or undefined disables thinning entirely.
   */
  numericSteps?: number;
  /**
   * Never drop more than this much wall-clock time in a row, even if the value
   * is flat, so a long-idle sensor still has points to seek to.
   */
  maxGapMs?: number;
}

const DEFAULT_MAX_GAP_MS = 60_000;

function numeric(value: string): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Whether this entity's series is numeric drift rather than discrete states.
 * Judged from the events themselves rather than the entity id, because a
 * `sensor.` can be either and an `input_number.` is always the former.
 */
function isNumericSeries(events: HistoryEventInput[]): boolean {
  let seen = 0;
  for (const e of events) {
    if (numeric(e.newState) === undefined) return false;
    if (++seen >= 20) break;
  }
  return seen > 0;
}

function thinNumeric(
  events: HistoryEventInput[],
  steps: number,
  maxGapMs: number,
): HistoryEventInput[] {
  const values = events.map((e) => numeric(e.newState)!);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const deadband = (max - min) / steps;
  // A series that never moves has no shape to preserve: first and last is all
  // the information there is.
  if (!(deadband > 0)) return events.length ? [events[0], events[events.length - 1]] : [];

  const kept: HistoryEventInput[] = [events[0]];
  let lastKept = values[0];
  let lastTime = events[0].timestamp;

  for (let i = 1; i < events.length - 1; i++) {
    const v = values[i];
    // A local extremum is the one point that must not be smoothed away, or a
    // thinned spike reads as a plateau.
    const extremum =
      (v > values[i - 1] && v >= values[i + 1]) || (v < values[i - 1] && v <= values[i + 1]);
    if (
      Math.abs(v - lastKept) >= deadband ||
      (extremum && Math.abs(v - lastKept) >= deadband / 2) ||
      events[i].timestamp - lastTime >= maxGapMs
    ) {
      kept.push(events[i]);
      lastKept = v;
      lastTime = events[i].timestamp;
    }
  }
  if (events.length > 1) kept.push(events[events.length - 1]);
  return kept;
}

/** Thin one entity's series. Exported for tests. */
export function downsampleSeries(
  events: HistoryEventInput[],
  options: DownsampleOptions = {},
): HistoryEventInput[] {
  const steps = options.numericSteps ?? 0;
  if (!(steps > 0) || events.length < 3) return events;
  if (!isNumericSeries(events)) return events;
  return thinNumeric(events, steps, options.maxGapMs ?? DEFAULT_MAX_GAP_MS);
}

/**
 * Thin a whole window, per entity, preserving the original chronological order
 * of what survives.
 */
export function downsampleHistory(
  events: HistoryEventInput[],
  options: DownsampleOptions = {},
): HistoryEventInput[] {
  if (!(options.numericSteps ?? 0) || events.length === 0) return events;

  const byEntity = new Map<string, HistoryEventInput[]>();
  for (const event of events) {
    const bucket = byEntity.get(event.entityId);
    if (bucket) bucket.push(event);
    else byEntity.set(event.entityId, [event]);
  }

  const keep = new Set<HistoryEventInput>();
  for (const series of byEntity.values()) {
    for (const event of downsampleSeries(series, options)) keep.add(event);
  }
  return events.filter((event) => keep.has(event));
}
