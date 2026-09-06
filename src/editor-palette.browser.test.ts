/**
 * Renaming a named colour, in a real browser.
 *
 * The rename handler is DOM-shaped — it reads an `<input>` and, when it decides
 * not to change the config, has to put that input back itself, because Lit will
 * not re-render a field whose bound value did not change. That last part is
 * only observable with a real element, so it lives here rather than in the node
 * suite (issue #265).
 */
import { afterEach, describe, expect, it } from "vitest";
import "./editor";
import type { FloorplanCardEditor } from "./editor";
import type { FloorplanCardConfig } from "./types";

function config(): FloorplanCardConfig {
  return {
    type: "custom:easy-floorplan-card",
    width: 1000,
    height: 600,
    palette: [{ name: "Warm", color: "#ff8800" }],
    floors: [
      {
        id: "f1",
        name: "Floor 1",
        walls: [],
        openings: [],
        items: [],
        texts: [],
        furniture: [],
        trackers: [],
        areas: [{ id: "living", name: "Living", points: [], color: "var(--fp-color-warm)" }],
      },
    ],
  } as unknown as FloorplanCardConfig;
}

async function mountEditor() {
  const host = document.createElement("div");
  host.style.width = "900px";
  document.body.appendChild(host);
  const ed = document.createElement("easy-floorplan-card-editor") as FloorplanCardEditor;
  ed.hass = { states: {}, entities: {} } as unknown as FloorplanCardEditor["hass"];
  ed.setConfig(config());
  host.appendChild(ed);
  await ed.updateComplete;

  const emitted: FloorplanCardConfig[] = [];
  ed.addEventListener("config-changed", (ev) => {
    emitted.push((ev as CustomEvent<{ config: FloorplanCardConfig }>).detail.config);
  });
  return { ed, host, emitted };
}

/**
 * The palette fields sit behind two collapses — the Project section, then the
 * "Named colors" group inside it — and neither is open on mount.
 */
async function openNamedColors(ed: FloorplanCardEditor): Promise<void> {
  const root = () => ed.shadowRoot!;
  if (root().querySelector("input.palette-name")) return;

  const project = root().querySelector<HTMLButtonElement>("button.section-toggle");
  if (!project) throw new Error("Project section toggle not found — did the panel change?");
  if (project.getAttribute("aria-expanded") !== "true") {
    project.click();
    await ed.updateComplete;
  }

  const group = [...root().querySelectorAll<HTMLButtonElement>("button.cfg-group-title")]
    .find((b) => b.textContent?.trim().startsWith("Named colors"));
  if (!group) throw new Error("'Named colors' group not found — did the Project panel change?");
  group.click();
  await ed.updateComplete;
}

function nameInput(ed: FloorplanCardEditor): HTMLInputElement {
  const found = ed.shadowRoot?.querySelector<HTMLInputElement>("input.palette-name");
  if (!found) throw new Error("palette name input not found — did the Project panel change?");
  return found;
}

async function rename(ed: FloorplanCardEditor, to: string) {
  await openNamedColors(ed);
  const input = nameInput(ed);
  input.value = to;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  await ed.updateComplete;
  return input;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("renaming a named colour", () => {
  it("stores the name trimmed, so the panel and the dropdowns agree", async () => {
    const t = await mountEditor();
    await rename(t.ed, "  Warm white  ");

    const last = t.emitted[t.emitted.length - 1];
    expect(last.palette?.[0].name).toBe("Warm white");
    // And the reference moved with it rather than being left behind.
    expect(last.floors?.[0].areas?.[0].color).toBe("var(--fp-color-warm-white)");
  });

  it("puts the field back when only whitespace changed", async () => {
    // `paletteSlug` trims, so this is the same colour and the config does not
    // change — which means Lit has no reason to re-render the input. Left
    // alone it would keep showing the spaces while the config holds none.
    const t = await mountEditor();
    const before = t.emitted.length;
    const input = await rename(t.ed, "   Warm   ");

    expect(input.value).toBe("Warm");
    expect(t.emitted.length).toBe(before);
  });

  it("still refuses a rename that would collide, whitespace or not", async () => {
    const t = await mountEditor();
    t.ed.setConfig({
      ...config(),
      palette: [
        { name: "Warm", color: "#ff8800" },
        { name: "Alert", color: "#e53935" },
      ],
    } as unknown as FloorplanCardConfig);
    await t.ed.updateComplete;
    await openNamedColors(t.ed);

    const input = nameInput(t.ed);
    input.value = "  Alert  ";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await t.ed.updateComplete;

    // Refused and put back, rather than two names reducing to one property.
    expect(input.value).toBe("Warm");
  });
});
