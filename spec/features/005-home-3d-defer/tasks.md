# Tasks — Defer & idle the home 3D tire selector

> Feature: `005-home-3d-defer` · Based on: [plan.md](./plan.md) · Created: 2026-07-06

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Order: build the shared hook (+ test) first, then gate the two canvases,
then verify what's already in place.

## The idle primitive

- [x] **T1 — `useIdleReady` hook** · returns `false`, then `true` once the browser is
  idle after mount: `requestIdleCallback(cb, { timeout })` with a `setTimeout`
  fallback when `requestIdleCallback` is absent (Safari); SSR-safe (no `window` at
  import); cleans up (`cancelIdleCallback`/`clearTimeout`) on unmount. · files:
  **new** `src/app/ui/components/TirePreview3D/useIdleReady.ts` · check: `tsc` clean;
  unit-tested in T5.

## Gate the two canvases

- [x] **T2 — Idle-gate the home 3D** · in `TirePreview3D`, mount `<TireScene>` only
  when `enabled && useIdleReady()`; keep `enabled === null` → `<Skeleton/>`, `!enabled`
  → `<TireDisplay/>`, and `enabled && !idleReady` → `<Skeleton/>` (reserves space). No
  change to the desktop/WebGL/reduced-motion logic or the mounted visuals. · files:
  `src/app/ui/components/TirePreview3D/TirePreview3D.tsx` · check: `tsc` clean; on
  desktop the Skeleton shows briefly, then the 3D swaps in with no layout jump.
- [x] **T3 — Idle-gate the detail 3D** _(reuse: extends the shared-hook decision;
  its pause-when-inactive is already covered by `useCanvasActive`)_ · in
  `TreadWearExplorer`, mount `<TreadScene>` only once `useIdleReady()` is true; show
  `SceneSkeleton` until then; keep the `Fallback2D` for no-WebGL. · files:
  `src/app/ui/components/TreadWearExplorer/TreadWearExplorer.tsx` · check: `tsc` clean;
  the tread 3D idles in after load; 2D fallback still works when WebGL is off.

## Confirm what's already in place (no code)

- [x] **T4 — Verify existing optimizations** _(no code)_ · Confirmed by reading the
  code: (a) `TireScene` (`TirePreview3D.tsx:37`) **and** `TreadScene`
  (`TreadWearExplorer.tsx:27`) load via `next/dynamic({ ssr:false })` → separate chunk;
  (b) both feed `useCanvasActive` into `frameloop` (`TireScene.tsx:39` →
  `frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}`; `TreadScene`
  imports the same hook) → paused off-screen/tab-hidden; (c) `TirePreview3DMobile`
  loads three.js **only on tap** (modal `open` state). → **AC2/AC3 already met**; this
  phase only adds idle-mount on top.

## Tests & Done

- [x] **T5 — Test `useIdleReady`** · unit test: starts `false`; becomes `true` after
  the idle callback fires; uses the `setTimeout` fallback when `requestIdleCallback`
  is undefined; cleans up on unmount. Adjust any 3D-component test if the idle gate
  changes render output. · files: **new**
  `src/app/ui/components/TirePreview3D/useIdleReady.test.ts(x)` · check: `npm test`
  green (was 113/113).
- [ ] **T6 — Manual check** _(yours: DevTools + visual)_ · Home (desktop): the hero is
  interactive immediately; the 3D idles in behind the Skeleton with **no CLS**; drag
  to rotate + size selection work; size search works before/during/after the 3D loads.
  Scroll the 3D off-screen / switch tabs → the canvas stops rendering (no rAF in
  Performance). Detail: tread 3D idles in, 2D fallback OK. Mobile: 3D still opens only
  on tap. · check: no jank on load, loop pauses when hidden, everything works.
- [~] **T-DoD — Definition of Done** _(automated gates green; manual + PSI are yours)_
  · `npx tsc --noEmit` ✓ + `npm run lint` ✓ + `npm test` ✓ (**116/116**, +3) +
  `npm run build` ✓. Manual check per **T6** and the AC1 authoritative **post-deploy
  PSI** are yours: desktop **TBT** materially below the "before". _Because the
  19,760 ms baseline (2026-06-30) likely predates the current `dynamic`/`useCanvasActive`
  code, capture a **fresh "before"** — desktop TBT on current prod/main **without** this
  change — so the win is attributable, not measured against a stale number._ Record
  before/after in `results.md`.

## Traceability

| Task       | Acceptance criteria                                      |
| ---------- | ------------------------------------------------------- |
| T1, T2     | AC1 (idle-mount home 3D → TBT down)                      |
| T4, T6     | AC2 (loop pauses off-screen/hidden — already via hook)  |
| T2, T3, T4 | AC3 (three.js deferred chunk — already, idle defers more) |
| T2, T3, T6 | AC4 (animation + search still work)                     |
| T2, T3, T6 | AC5 (skeleton reserves space → no CLS)                  |
| T5, T-DoD  | AC6 (DoD + tests)                                       |
| T3         | Detail 3D covered via the shared idle hook              |
