import { describe, expect, it } from "vitest";
import { downsampleHistory, downsampleSeries } from "./downsample";
import type { HistoryEventInput } from "./history-service";

const T0 = 1_760_000_000_000;
const ev = (i: number, newState: string, entityId = "sensor.x"): HistoryEventInput => ({
  timestamp: T0 + i * 1000,
  entityId,
  oldState: newState,
  newState,
  attributes: {},
});

describe("downsampleHistory", () => {
  it("keeps everything when no resolution is asked for", () => {
    const drift = Array.from({ length: 200 }, (_, i) => ev(i, (20 + i * 0.01).toFixed(2)));
    expect(downsampleHistory(drift)).toBe(drift);
    expect(downsampleHistory(drift, { numericSteps: 0 })).toBe(drift);
  });

  it("never drops a discrete state change", () => {
    // A light toggling is not drift — every transition is a thing that
    // happened, and losing one makes the replay wrong rather than coarse.
    const toggles = Array.from({ length: 200 }, (_, i) => ev(i, i % 2 ? "on" : "off", "light.kitchen"));
    expect(downsampleHistory(toggles, { numericSteps: 5 })).toEqual(toggles);
  });

  it("thins numeric drift", () => {
    const drift = Array.from({ length: 500 }, (_, i) => ev(i, (20 + Math.sin(i / 40) * 5).toFixed(3)));
    const out = downsampleHistory(drift, { numericSteps: 20 });
    expect(out.length).toBeLessThan(drift.length / 3);
    expect(out.length).toBeGreaterThan(10);
  });

  it("keeps the first and last point exactly", () => {
    const drift = Array.from({ length: 300 }, (_, i) => ev(i, (i * 0.1).toFixed(2)));
    const out = downsampleSeries(drift, { numericSteps: 10 });
    expect(out[0]).toBe(drift[0]);
    expect(out[out.length - 1]).toBe(drift[drift.length - 1]);
  });

  it("does not flatten a spike", () => {
    // The hottest point of the day has to stay the hottest point of the day.
    const flat = Array.from({ length: 200 }, (_, i) => ev(i, "20.0"));
    flat[120] = ev(120, "45.0");
    const out = downsampleSeries(flat, { numericSteps: 10 });
    expect(out.map((e) => e.newState)).toContain("45.0");
  });

  it("reduces a series that never moves to its endpoints", () => {
    const flat = Array.from({ length: 100 }, (_, i) => ev(i, "20.0"));
    const out = downsampleSeries(flat, { numericSteps: 10 });
    expect(out).toHaveLength(2);
    expect(out[0]).toBe(flat[0]);
    expect(out[1]).toBe(flat[99]);
  });

  it("thins each entity on its own range and keeps chronological order", () => {
    const mixed: HistoryEventInput[] = [];
    for (let i = 0; i < 200; i++) {
      mixed.push(ev(i, (20 + i * 0.05).toFixed(2), "sensor.temp"));
      mixed.push(ev(i, i % 2 ? "on" : "off", "light.kitchen"));
    }
    mixed.sort((a, b) => a.timestamp - b.timestamp);
    const out = downsampleHistory(mixed, { numericSteps: 10 });

    // The light survives intact; the sensor does not.
    expect(out.filter((e) => e.entityId === "light.kitchen")).toHaveLength(200);
    expect(out.filter((e) => e.entityId === "sensor.temp").length).toBeLessThan(60);
    for (let i = 1; i < out.length; i++) {
      expect(out[i].timestamp).toBeGreaterThanOrEqual(out[i - 1].timestamp);
    }
  });

  it("leaves a series too short to have a shape alone", () => {
    const two = [ev(0, "1.0"), ev(1, "2.0")];
    expect(downsampleSeries(two, { numericSteps: 10 })).toBe(two);
  });

  it("treats a series that is not numeric throughout as discrete", () => {
    // `unavailable` in the middle of a temperature series must not make the
    // whole thing get thinned as if it were numbers.
    const mixed = [ev(0, "20.0"), ev(1, "unavailable"), ev(2, "21.0"), ev(3, "22.0")];
    expect(downsampleSeries(mixed, { numericSteps: 2 })).toBe(mixed);
  });
});
