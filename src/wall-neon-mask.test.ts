import { describe, it, expect } from "vitest";
/**
 * Read as source text rather than imported, for the same reason as
 * card-styles.test.ts: importing either module drags in Lit's element
 * machinery for a question the source itself answers.
 */
import cardSourceRaw from "./floorplan-card.ts?raw";
import editorSourceRaw from "./editor.ts?raw";

const cardSource = cardSourceRaw as string;
const editorSource = editorSourceRaw as string;

/**
 * Issue #203 — "Neon Glow Ignores Wall Openings".
 *
 * CSS applies `filter` before `mask`. A skin filter set on the wall element
 * itself is therefore computed from the *uncut* wall, and the doorway mask
 * then removes the wall body but not the halo around it. The cut clears
 * `WALL_THICKNESS + 4` (12 units, so ±6 from the centreline); a
 * `drop-shadow` of blur 4 reaches roughly ±8.5. The ~2.5 units of halo on
 * each side that the mask never touches run straight through every opening.
 *
 * Measured on a Tron render before the fix: 35.6 peak luminance inside an
 * opening against a 7.8 background — 4.6x — falling to exactly 7.8 once the
 * filter moved outside the mask.
 *
 * The invariant is structural, so it is guarded structurally: the filter
 * belongs to a group that *wraps* the masked group, never to the wall.
 */
describe("the wall neon sits outside the doorway mask (#203)", () => {
  const blockAfter = (source: string, selector: string): string | undefined => {
    const at = source.indexOf(selector);
    if (at === -1) return undefined;
    return source.slice(at, source.indexOf("}", at));
  };

  it("the card's .wall declares no filter of its own", () => {
    const block = blockAfter(cardSource, "\n    .wall {");
    expect(block, ".wall rule not found").toBeDefined();
    expect(block).not.toMatch(/(^|[;\s])filter\s*:/);
  });

  it("the editor's line.wall declares no filter of its own", () => {
    const block = blockAfter(editorSource, "line.wall {");
    expect(block, "line.wall rule not found").toBeDefined();
    expect(block).not.toMatch(/(^|[;\s])filter\s*:/);
  });

  for (const [name, source] of [
    ["card", cardSource],
    ["editor", editorSource],
  ] as const) {
    it(`${name}: .fp-wall-neon is what carries the skin filter`, () => {
      const block = blockAfter(source, ".fp-wall-neon {");
      expect(block, ".fp-wall-neon rule not found").toBeDefined();
      expect(block).toMatch(/filter\s*:\s*var\(--fp-skin-wall-filter/);
    });
  }

  it("the card nests the mask INSIDE the neon group, not the other way round", () => {
    const open = cardSource.indexOf(`<g class="fp-wall-neon">`);
    expect(open, "neon group not found in the card template").toBeGreaterThan(-1);
    const wallLine = cardSource.indexOf("class=\"wall fp-wall\"", open);
    expect(wallLine).toBeGreaterThan(open);
    // between the neon group opening and the wall itself there must be a mask
    expect(cardSource.slice(open, wallLine)).toMatch(/mask=\$\{`url\(#\$\{this\._wallMaskId\}\)`\}/);
  });

  it("every masked wall in the editor is wrapped by the neon group", () => {
    // each editor wall <line class="wall ..."> carrying the doorway mask must
    // have the neon group opened immediately before it
    const masked = [...editorSource.matchAll(/<line[^>]*class="wall[^"]*"[^>]*mask=/g)];
    expect(masked.length, "no masked wall lines found in the editor").toBeGreaterThan(0);
    for (const m of masked) {
      const before = editorSource.slice(Math.max(0, m.index! - 120), m.index!);
      expect(before, `unwrapped masked wall near index ${m.index}`).toMatch(
        /<g class="fp-wall-neon">\s*$/,
      );
    }
  });

  it("says why, so the next person does not move it back onto the wall", () => {
    for (const source of [cardSource, editorSource]) {
      const at = source.indexOf(".fp-wall-neon {");
      const nearby = source.slice(Math.max(0, at - 900), at);
      expect(nearby).toMatch(/filter before mask/i);
      expect(nearby).toMatch(/#203/);
    }
  });
});
