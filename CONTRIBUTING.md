# Contributing

## Everyday commands

```bash
npm install
npm run build         # bundles to dist/easy-floorplan-card.js
npm run watch         # rebuild on change
npm run typecheck     # tsc --noEmit
npm test              # node suite (jsdom where a test file asks for it)
npm run test:browser  # editor gesture tests, in headless Chromium
npm run ha            # a real Home Assistant in Docker — see docker/README.md
```

Releases are built and attached automatically by GitHub Actions when a GitHub
release is published.

The rest of this file covers the one thing that is easy to get wrong: which test
suite a change needs.

## Two test suites

| | runs in | command | when |
| --- | --- | --- | --- |
| node suite | node, jsdom where a file asks for it | `npm test` | always — it is what CI's `build` job runs |
| browser suite | headless Chromium via Playwright | `npm run test:browser` | anything on a gesture path (below) |

The node suite covers the pure modules: geometry, config migration, rendering
decisions, the frame coalescer with an injected scheduler. A file that needs a
document opts into jsdom with a `// @vitest-environment jsdom` docblock, the way
`src/replay-history/history-replay.test.ts` does. The suite runs in a couple of
seconds and has no browser to download, which is why `npm test` stays on it.

The browser suite (`src/**/*.browser.test.ts`, config in
`vitest.browser.config.ts`) covers the editor's gesture wiring — the code that
runs on `pointerdown`/`pointermove`/`pointerup`, what it queues for the next
frame, and what happens to an in-flight drag on teardown. It runs in real
Chromium because that code maps pointer positions through the SVG's live
`getScreenCTM()` and depends on the canvas actually being able to scroll. A DOM
shim cannot stand in: jsdom has no `getScreenCTM`, and happy-dom's always
returns the identity matrix from a canvas with zero layout — so a regression
test for a CTM bug would run, pass, and prove nothing (issue #233 has the
measurements). CI runs this suite in its own `browser-tests` job.

### Running it locally

Once, to fetch the browser (about 150 MB):

```bash
npx playwright install chromium
```

Then:

```bash
npm run test:browser
```

It takes a few seconds. `@vitest/browser` peer-depends on one exact `vitest`
version, which is why both are pinned without a caret in `package.json` — bump
them together, or the install breaks on the peer.

### When a change needs it

Run the browser suite — and add a `*.browser.test.ts` case if the change fixes
a bug — when you touch any of these in `src/editor.ts`:

- the pointer handlers (`_onCanvasDown`/`Move`/`Up`, `_onOverlayDown`/`Move`/`Up`,
  `_onPointerCancel`), pointer capture, or `_gesturePointer`;
- `_toVirtual`, or anything else that reads `getScreenCTM()`, `getBBox()`, or
  layout;
- what a drag queues through `_dragMoves`, where it is settled or cancelled, or
  `_applyDrag` / `_flushDrag` / `_cancelGesture`;
- `disconnectedCallback`, which can land mid-gesture (HA's dialog reparents the
  editor).

The tests dispatch synthetic `PointerEvent`s from the page rather than driving
a real mouse. The bugs this suite guards against depend on *when* an event's
coordinates are resolved, not on where the event came from, and dispatching
from the page is what lets a test scroll the canvas between a move and the
frame that applies it. If a change needs real input — pointer capture semantics
across elements, say — that is a reason to reach for a Playwright script, not
to skip the check.

## Commit messages

`Topic: a declarative sentence` — see `git log`.
