/**
 * The badge colour of a device that is *off* (issue #228).
 *
 * In a real browser because the whole feature is a painted colour: the class,
 * the custom property and the CSS rule have to line up, and a node test of the
 * helper that picks the colour would pass with any of the three missing.
 *
 * The domain cases are the reason this is a first-class option rather than a
 * `stateColor` rule. `state: "off"` is right for a switch and silently wrong
 * for a lock, a cover or a vacuum, which say `locked`, `closed` and `docked`.
 */
import { afterEach, describe, expect, it } from "vitest";
import "./floorplan-card";
import type { FloorplanCard } from "./floorplan-card";
import type { FloorItem, FloorplanCardConfig } from "./types";

const OFF_RED = "rgb(198, 40, 40)";
const ON_GREEN = "rgb(46, 125, 50)";

function config(item: Partial<FloorItem>): FloorplanCardConfig {
  return {
    type: "custom:easy-floorplan-card",
    width: 1000,
    height: 600,
    floors: [
      {
        id: "f1",
        name: "Floor 1",
        walls: [],
        openings: [],
        items: [{ id: "s1", x: 500, y: 300, ...item } as FloorItem],
        texts: [],
        furniture: [],
        trackers: [],
        areas: [],
      },
    ],
  } as FloorplanCardConfig;
}

/** One entity per domain, each in that domain's own word for "off". */
const states: Record<string, { entity_id: string; state: string; attributes: object }> = {
  "switch.a": { entity_id: "switch.a", state: "off", attributes: {} },
  "switch.on": { entity_id: "switch.on", state: "on", attributes: {} },
  "lock.a": { entity_id: "lock.a", state: "locked", attributes: {} },
  "cover.a": { entity_id: "cover.a", state: "closed", attributes: {} },
  "vacuum.a": { entity_id: "vacuum.a", state: "docked", attributes: {} },
  "sensor.a": { entity_id: "sensor.a", state: "21.5", attributes: {} },
};

const hass = {
  states,
  entities: {},
  formatEntityState: (st: { state: string }) => st.state,
} as unknown as FloorplanCard["hass"];

async function mount(item: Partial<FloorItem>) {
  const host = document.createElement("div");
  host.style.width = "900px";
  host.style.height = "540px";
  document.body.appendChild(host);

  const card = document.createElement("easy-floorplan-card") as FloorplanCard;
  card.setConfig(config(item));
  card.hass = hass;
  host.appendChild(card);
  await card.updateComplete;

  const root = card.shadowRoot!;
  const badge = root.querySelector(".badge") as HTMLElement;
  return {
    background: () => getComputedStyle(badge).backgroundColor,
    ink: () => getComputedStyle(badge).color,
    classes: () => (root.querySelector(".fp-item") as HTMLElement).className,
  };
}

describe("a device can say what colour it is when off", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("paints the badge while the device is off", async () => {
    const t = await mount({ entity: "switch.a", inactiveColor: "#c62828" });
    expect(t.background()).toBe(OFF_RED);
  });

  it("does not paint it while the device is on", async () => {
    const t = await mount({
      entity: "switch.on",
      inactiveColor: "#c62828",
      activeColor: "#2e7d32",
    });
    expect(t.background()).toBe(ON_GREEN);
  });

  it("means off for every domain, not just the ones that say 'off'", async () => {
    // The reason this is not a `stateColor` rule. Each of these is inactive in
    // its own vocabulary, and a rule written as `state: "off"` matches none of
    // them.
    for (const entity of ["lock.a", "cover.a", "vacuum.a"]) {
      const t = await mount({ entity, inactiveColor: "#c62828" });
      expect(t.background(), `${entity} should read as inactive`).toBe(OFF_RED);
      document.body.innerHTML = "";
    }
  });

  it("yields to a state rule, which is the more specific statement", async () => {
    const t = await mount({
      entity: "switch.a",
      inactiveColor: "#c62828",
      stateColor: [{ state: "off", color: "#2e7d32" }],
    });
    expect(t.background()).toBe(ON_GREEN);
  });

  it("picks ink that can be read on it", async () => {
    // #c62828 is dark, so the icon must go light — the same contrast pass the
    // active colour gets. Before this, an off badge was always the theme's
    // pale card background and never needed one.
    const t = await mount({ entity: "switch.a", inactiveColor: "#c62828" });
    expect(t.ink()).toBe("rgb(255, 255, 255)");

    document.body.innerHTML = "";
    const pale = await mount({ entity: "switch.a", inactiveColor: "#ffffff" });
    expect(pale.ink()).toBe("rgb(33, 33, 33)");
  });

  it("leaves a device that sets no off colour exactly as it was", async () => {
    // Every existing plan is on this path, so it has to be untouched: no
    // class, no custom property, and the neutral badge it always had.
    const t = await mount({ entity: "switch.a" });
    expect(t.classes()).not.toContain("inactive-colored");
    expect(t.background()).not.toBe(OFF_RED);
  });

  it("does not paint a sensor, which is never 'on' but is not off either", async () => {
    // entityIsActive is what decides, and a numeric sensor reads inactive —
    // so this one *does* paint. Pinned because it is the case most likely to
    // surprise, and thresholds are the right tool there.
    const t = await mount({ entity: "sensor.a", inactiveColor: "#c62828" });
    expect(t.background()).toBe(OFF_RED);
  });
});
