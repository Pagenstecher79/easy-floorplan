import type { HassEntity } from "../types";
import { cssColor } from "../css-safe";
import { SKIN_ACCENT, SKIN_ACTIVE, SKIN_INACTIVE } from "../skins";

export interface HistoryEventInput {
  timestamp: number;
  entityId: string;
  oldState: string;
  newState: string;
  attributes?: Record<string, unknown>;
  color?: string;
}

export function resolveReplayEventColor(event: Pick<HistoryEventInput, "entityId" | "newState" | "attributes" | "color">): string | undefined {
  const supplied = typeof event.color === "string" ? cssColor(event.color) : undefined;
  if (supplied) return supplied;

  const rawColor = event.attributes?.color;
  const attributeColor = typeof rawColor === "string" ? cssColor(rawColor) : undefined;
  if (attributeColor) return attributeColor;

  const state = String(event.newState ?? "").trim().toLowerCase();

  if (event.entityId.startsWith("light.")) return state === "off" ? SKIN_INACTIVE : SKIN_ACTIVE;
  if (event.entityId.startsWith("cover.")) return state === "closed" ? SKIN_INACTIVE : SKIN_ACCENT;
  if (event.entityId.startsWith("sensor.")) return state === "off" ? SKIN_INACTIVE : SKIN_ACCENT;
  if (event.entityId.startsWith("binary_sensor.")) return state === "off" ? SKIN_INACTIVE : SKIN_ACCENT;
  if (event.entityId.startsWith("fan.")) return state === "off" ? SKIN_INACTIVE : SKIN_ACTIVE;
  if (event.entityId.startsWith("media_player.")) return state === "idle" ? SKIN_INACTIVE : SKIN_ACTIVE;
  if (state === "on" || state === "open" || state === "playing" || state === "home" || state === "locked" || state === "unlocked") {
    return SKIN_ACCENT;
  }
  return SKIN_INACTIVE;
}

export interface HistoryServiceOptions {
  loader?: (start: number, end: number) => Promise<HistoryEventInput[]>;
}

export interface HistoryLoadOptions {
  /**
   * Additional cache scope (for example, watched entity ids).
   * Keeps replay windows with different filters from sharing stale results.
   */
  scopeKey?: string;
}

export class HistoryService {
  private readonly _loader: (start: number, end: number) => Promise<HistoryEventInput[]>;
  private readonly _cache = new Map<string, HistoryEventInput[]>();
  private _events: HistoryEventInput[] = [];
  private _eventsByEntity = new Map<string, HistoryEventInput[]>();
  private readonly _maxCacheEntries = 8;
  private _loadCommitId = 0;

  constructor(options: HistoryServiceOptions = {}) {
    this._loader = options.loader ?? (async () => []);
  }

  public async loadHistory(start: number, end: number, options: HistoryLoadOptions = {}): Promise<void> {
    const loadId = ++this._loadCommitId;
    const scope = options.scopeKey ?? "all";
    const key = `${start}:${end}:${scope}`;
    if (this._cache.has(key)) {
      if (loadId === this._loadCommitId) {
        const cachedEvents = this._cache.get(key)!;
        this._events = cachedEvents;
        this._eventsByEntity = this._groupEventsByEntity(cachedEvents);
      }
      return;
    }

    const events = await this._loader(start, end);
    const normalized = events
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((event) => ({
        ...event,
        attributes: event.attributes ?? {},
      }));

    if (loadId !== this._loadCommitId) return;
    this._cache.set(key, normalized);
    if (this._cache.size > this._maxCacheEntries) {
      const oldestKey = this._cache.keys().next().value as string | undefined;
      if (oldestKey) this._cache.delete(oldestKey);
    }
    this._events = normalized;
    this._eventsByEntity = this._groupEventsByEntity(normalized);
  }

  public clearCache(): void {
    this._loadCommitId += 1;
    this._cache.clear();
    this._events = [];
    this._eventsByEntity.clear();
  }

  public getStateAt(timestamp: number): Map<string, HassEntity> {
    const states = new Map<string, HassEntity>();

    for (const [entityId, events] of this._eventsByEntity.entries()) {
      const lastEventBeforeTimestamp = this._findLastEventAtOrBefore(events, timestamp);
      if (lastEventBeforeTimestamp) {
        states.set(entityId, this._toHassEntity(entityId, lastEventBeforeTimestamp.newState, lastEventBeforeTimestamp.attributes, lastEventBeforeTimestamp.timestamp));
        continue;
      }

      const firstEvent = events[0];
      if (firstEvent) {
        states.set(entityId, this._toHassEntity(entityId, firstEvent.oldState, firstEvent.attributes, 0));
      }
    }

    return states;
  }

  private _groupEventsByEntity(events: HistoryEventInput[]): Map<string, HistoryEventInput[]> {
    const grouped = new Map<string, HistoryEventInput[]>();
    for (const event of events) {
      const entityEvents = grouped.get(event.entityId) ?? [];
      entityEvents.push(event);
      grouped.set(event.entityId, entityEvents);
    }

    for (const entityEvents of grouped.values()) {
      entityEvents.sort((a, b) => a.timestamp - b.timestamp);
    }

    return grouped;
  }

  private _findLastEventAtOrBefore(events: HistoryEventInput[], timestamp: number): HistoryEventInput | undefined {
    let lo = 0;
    let hi = events.length - 1;
    let best: HistoryEventInput | undefined;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const event = events[mid];
      if (event.timestamp <= timestamp) {
        best = event;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return best;
  }

  private _toHassEntity(
    entityId: string,
    state: string,
    attributes: Record<string, unknown> | undefined,
    timestamp: number,
  ): HassEntity {
    const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now() / 1000;
    return {
      entity_id: entityId,
      state,
      attributes: attributes ?? {},
      last_changed: new Date(safeTimestamp * 1000).toISOString(),
      last_updated: new Date(safeTimestamp * 1000).toISOString(),
      context: { id: "history", parent_id: null, user_id: null },
    } as HassEntity;
  }

  public getEvents(): HistoryEventInput[] {
    return this._events.slice();
  }

  public getEventBefore(timestamp: number): HistoryEventInput | undefined {
    if (!this._events.length) return undefined;
    let lo = 0;
    let hi = this._events.length - 1;
    let best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this._events[mid].timestamp <= timestamp) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best >= 0 ? this._events[best] : undefined;
  }

  public getEventAfter(timestamp: number): HistoryEventInput | undefined {
    if (!this._events.length) return undefined;
    let lo = 0;
    let hi = this._events.length - 1;
    let best = this._events.length;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this._events[mid].timestamp >= timestamp) {
        best = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    return best < this._events.length ? this._events[best] : undefined;
  }
}
