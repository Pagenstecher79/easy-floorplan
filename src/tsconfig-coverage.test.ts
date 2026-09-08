/**
 * Every source file in the repo is type-checked by something (issue #246).
 *
 * `tsconfig.json` covers `src`; `tsconfig.node.json` covers the build and test
 * configuration and the docker scripts. Between them they should leave nothing
 * out — but nothing enforces that, and the failure is silent by construction:
 * a file no project includes simply is not checked, and `npm run typecheck`
 * stays green however wrong it is. That is exactly how the duplicate `test:`
 * key in `vite.config.ts` survived a merge.
 *
 * So this walks the repo and asserts the two `include` lists actually reach
 * every file. Adding a `playwright.config.ts` or a second docker script that
 * nobody checks fails here, at the point it is added, rather than the next
 * time a merge quietly drops half of one.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

/** Directories that hold no first-party source. */
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".github", "docs", "furniture"]);

/** Extensions TypeScript can check. */
const CHECKABLE = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (CHECKABLE.some((ext) => name.endsWith(ext))) out.push(relative(ROOT, full));
  }
  return out;
}

/**
 * A tsconfig's `include` list. Read with a comment-stripping pass rather than
 * `JSON.parse` alone, because both configs are commented — the explanation of
 * *why* `tsconfig.node.json` is separate belongs in the file, and jsonc is what
 * TypeScript actually accepts.
 */
function includesOf(file: string): string[] {
  const raw = readFileSync(join(ROOT, file), "utf8");
  const stripped = raw.replace(/^\s*\/\/.*$/gm, "");
  return JSON.parse(stripped).include as string[];
}

/** Does one `include` entry cover this path? Handles the two forms we use. */
function covers(pattern: string, file: string): boolean {
  if (pattern === file) return true;
  // A bare directory ("src") covers everything under it.
  if (!pattern.includes("*")) return file.startsWith(`${pattern}/`);
  // Otherwise a glob; only `*` and `**` appear in these configs.
  const re = new RegExp(
    "^" +
      pattern
        .split("**")
        .map((part) => part.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*"))
        .join(".*") +
      "$"
  );
  return re.test(file);
}

describe("nothing escapes the type-check", () => {
  const files = walk(ROOT);
  const patterns = [...includesOf("tsconfig.json"), ...includesOf("tsconfig.node.json")];

  it("finds the files it is supposed to be checking", () => {
    // Guards the walk itself: a broken skip list that found nothing would make
    // every assertion below vacuously true.
    expect(files).toContain("vite.config.ts");
    expect(files).toContain("docker/prepare.mjs");
    expect(files.some((f) => f.startsWith("src/"))).toBe(true);
  });

  it("covers every checkable file with one of the two projects", () => {
    const uncovered = files.filter((f) => !patterns.some((p) => covers(p, f)));
    expect(uncovered).toEqual([]);
  });

  it("still knows how to spot one that is not covered", () => {
    // The test above passes when `covers` is broken *open* too, so prove it
    // can still say no.
    expect(patterns.some((p) => covers(p, "playwright.config.ts"))).toBe(false);
  });

  it("runs both projects from `npm run typecheck`", () => {
    // Covering a file in a config that no script invokes checks nothing.
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    expect(pkg.scripts.typecheck).toContain("tsconfig.node.json");
  });
});
