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
 * So this asks git for the repo's files and asserts the two `include` lists
 * actually reach every one of them. Adding a `playwright.config.ts` or a
 * second docker script that nobody checks fails here, at the point it is
 * added, rather than the next time a merge quietly drops half of one.
 */
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(__dirname, "..");

/** Extensions TypeScript can check. */
const CHECKABLE = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];

/**
 * The repo's own files, from git rather than from a directory walk.
 *
 * A walk has to be told what to skip, and the list is never finished: it began
 * as node_modules and dist, and the first thing it missed was
 * `.claude/worktrees/`, where this project keeps a full checkout per branch. A
 * walk from the repo root found 226 "uncovered" files there and failed the
 * suite for everyone with a worktree open — while CI, which clones fresh,
 * stayed green. Any ignored scratch file at the root would have done the same.
 *
 * `git ls-files` already knows the answer, and it is the same answer
 * `.gitignore` gives: `--cached` for what is committed, `--others
 * --exclude-standard` for what is new but not ignored — so a `playwright.config.ts`
 * is caught the moment it is written, before it is even staged.
 */
function repoFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split("\0")
    .filter((f) => f && CHECKABLE.some((ext) => f.endsWith(ext)));
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
  const files = repoFiles();
  const patterns = [...includesOf("tsconfig.json"), ...includesOf("tsconfig.node.json")];

  it("finds the files it is supposed to be checking", () => {
    // Guards the listing itself: a `git ls-files` that came back empty would
    // make every assertion below vacuously true.
    expect(files).toContain("vite.config.ts");
    expect(files).toContain("docker/prepare.mjs");
    expect(files.some((f) => f.startsWith("src/"))).toBe(true);
  });

  it("does not reach into a nested checkout or anything else git ignores", () => {
    // The failure this replaced: `.claude/worktrees/<branch>/` holds a whole
    // second copy of the repo, and a directory walk counted every file in it.
    expect(files.filter((f) => f.startsWith(".claude/"))).toEqual([]);
    expect(files.filter((f) => f.startsWith("node_modules/"))).toEqual([]);
    expect(files.filter((f) => f.startsWith("dist/"))).toEqual([]);
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
