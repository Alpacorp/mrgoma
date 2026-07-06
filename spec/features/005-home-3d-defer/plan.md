# Plan — Defer & idle the home 3D tire selector

> Feature: `005-home-3d-defer` · Based on: [spec.md](./spec.md) · Created: 2026-07-06

## Technical approach

**Most of P1.5/P1.6 is already implemented** — the plan is a small, targeted
addition, not a rewrite:

- **P1.5 (code-split):** `TireScene` (three.js) is already loaded via
  `next/dynamic(() => import('./TireScene'), { ssr: false, loading: <Skeleton/> })`
  in both `TirePreview3D` (home) and `TreadWearExplorer` (detail) — three.js never
  ships in the main/server bundle. The mobile variant loads it **only on tap** (modal).
- **P1.6 (pause when inactive):** `TireScene` **and** the detail `TreadScene` already
  use `useCanvasActive` → `frameloop='never'` when off-screen or the tab is hidden
  (IntersectionObserver + `visibilitychange`). The render loop already freezes when
  not visible.

**The remaining lever** is *when* the heavy canvas mounts. `TirePreview3D`'s
`useEffect` runs on mount and **synchronously enables `<TireScene>`**, so on desktop
the three.js chunk fetch + Canvas/Environment/shadow-map init fire **right after
hydration**, competing with the page becoming interactive → the desktop **TBT
19,760 ms**. Same shape on the detail (`TreadWearExplorer` mounts `TreadScene` on
render, below the fold).

**Fix:** gate the canvas mount behind a small **`useIdleReady`** hook
(`requestIdleCallback` + a `setTimeout` fallback for Safari / never-idle pages) so the
3D mounts **once the page is interactive/idle**, not during hydration. Keep showing the
**existing animated `<Skeleton>`** meanwhile — it already fills the area (`w-full
h-full`), so there's no CLS on the swap. Apply the same hook to the detail
`TreadWearExplorer` (reuse), deferring its below-the-fold init off the critical path.

## Reuse first

- **`next/dynamic`** code-split of `TireScene` / `TreadScene` — already in place; no change.
- **`useCanvasActive`** (`TirePreview3D/useCanvasActive.ts`) — already gates both scenes'
  `frameloop`; no change (this is AC2, already met).
- The existing **`<Skeleton>`** (spinner, `w-full h-full`) in `TirePreview3D` and the
  `SceneSkeleton` in `TreadWearExplorer` — reuse as the idle placeholder (AC5).
- The existing **desktop + WebGL + `prefers-reduced-motion`** detection — unchanged;
  the idle gate is layered on top.

## Files to add / change

**New (one small primitive):**
- `src/app/ui/components/TirePreview3D/useIdleReady.ts` — returns `false` then `true`
  once the browser is idle after mount: `requestIdleCallback(cb, { timeout })` with a
  `setTimeout` fallback when `requestIdleCallback` is absent (Safari); SSR-safe;
  cleans up on unmount. (Placed next to `useCanvasActive` since both gate the 3D.)

**Change:**
- `src/app/ui/components/TirePreview3D/TirePreview3D.tsx` — gate the `<TireScene>`
  mount behind `useIdleReady`: keep `enabled === null` → `<Skeleton/>`, `!enabled` →
  `<TireDisplay/>`; when `enabled` but **not idle-ready** → `<Skeleton/>` (reserves
  space); when `enabled && idleReady` → `<TireScene/>`. No visual change once mounted.
- `src/app/ui/components/TreadWearExplorer/TreadWearExplorer.tsx` — same gate: mount
  `<TreadScene>` only once `useIdleReady` is true; show `SceneSkeleton` until then;
  keep the `Fallback2D` for no-WebGL. (Shared-hook reuse per the /clarify decision.)

**No change (confirmed):**
- `TirePreview3DMobile.tsx` — three.js already loads only on tap; leave as-is (FR6).
- `TireScene.tsx` / `TreadScene.tsx` / `useCanvasActive.ts` — active-gating already correct.

## Data & flow

Client-only, no data/API/route changes. On the home hero (desktop): hydrate → show
`<Skeleton>` → `useIdleReady` fires on idle (or after the timeout) → `<TireScene>`
mounts → three.js chunk loads → canvas renders (and `useCanvasActive` keeps it running
only while visible). The **size search is fully independent** and works throughout —
it never waits on the 3D. Detail: same, but the 3D is below the fold so it idles in
after hydration without ever blocking above-the-fold content.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 | Idle-mount moves the three.js load + Canvas init off the post-hydration critical window | Post-deploy PSI (Home, desktop): TBT materially below the 19,760 ms baseline |
| AC2 | Already met — `useCanvasActive` sets `frameloop='never'` off-screen/hidden (both scenes) | DevTools Performance: no rAF/CPU for the canvas when scrolled away or tab hidden |
| AC3 | Already met — `next/dynamic` code-splits three.js; idle-mount defers the fetch further | Build output shows a separate three.js chunk; Network: it loads after interactive |
| AC4 | Mount is deferred, not removed; visuals/interaction unchanged once mounted | Manual: 3D renders + rotates after idle; size search works before/during/after |
| AC5 | Existing `<Skeleton>`/`SceneSkeleton` fill the reserved area until the canvas swaps in | Manual + PSI: no layout shift on swap; CLS < 0.1 |
| AC6 | DoD | `tsc` + `lint` + `test` + `build`; a unit test for `useIdleReady` (rIC + fallback) |

## Tradeoffs / alternatives

- **Idle-mount (`requestIdleCallback`) vs on-interaction vs fixed delay.** Chose rIC
  per `/clarify`: the 3D appears almost immediately (once idle) without blocking the
  first input, and no arbitrary timer. Needs a `setTimeout` fallback because Safari
  only shipped `requestIdleCallback` recently and a busy page may never idle.
- **`content-visibility: auto` for the offscreen pause** — considered (the guide's
  approach) but **rejected**: `useCanvasActive`'s IntersectionObserver already covers
  AC2 with broader support, and `content-visibility` is only Baseline 2025-09
  (Safari 26), at the edge of our Baseline-2025 target. No need to churn working code.
- **Not degrading the 3D** (dpr / shadow maps / env resolution) — the brand keeps the
  rich look; we *defer* the cost, we don't downgrade quality.

## Risks

- **`requestIdleCallback` never fires** (page stays busy) → the `setTimeout` fallback
  (e.g. ~2 s) guarantees the 3D still mounts. Must test the fallback path.
- **Smaller-than-expected TBT win:** the 19,760 ms baseline (2026-06-30) may predate
  the current `dynamic`/`useCanvasActive` code, so current main may already be better;
  idle-mount is incremental. The PSI "after" is the source of truth — set expectations.
- **Don't break the existing fallbacks:** the desktop/WebGL/`reduced-motion` branches
  and the `<TireDisplay>` fallback must still work with the idle gate layered on.
- **Perceived delay** on slow machines (Skeleton shows a bit longer) — acceptable per
  the brand's "alive but not blocking" intent; the skeleton reserves space and spins.

## Out of scope

- Removing/replacing or visually degrading the 3D animation (brand).
- A `content-visibility` rewrite of the active-gating (already handled).
- The mobile 3D (already tap-on-demand) and other unrelated bundle trimming (later P1.5).
- Fonts (P1.3), structural CLS (P1.4), data/routes (P1.7, done).

---

_The concrete steps live in [tasks.md](./tasks.md)._
