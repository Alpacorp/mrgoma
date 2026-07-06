# Spec — Defer & idle the home 3D tire selector (JS / INP)

> Feature: `005-home-3d-defer` · Status: Draft · Created: 2026-07-06
> Roadmap: P1.5 + P1.6 · Branch: `feat/005-home-3d-defer`

## Why — problem & value

The baseline ([001-perf-baseline](../001-perf-baseline/baseline.md)) found the
**worst interactivity metric anywhere** on the **Home page, desktop**:

- **TBT 19,760 ms** 🔴 (the lab proxy for INP) and **main-thread work 32.4 s**
  (≈ 29.6 s "Other").
- The cause is **confirmed**: the **three.js 3D tire size selector**
  (`TirePreview3D`, in the hero `SearchBySize`) mounts eagerly on **desktop**
  (≥768 px). On **mobile** it doesn't drive the same cost (mobile TBT was 0), so
  this is a desktop-load problem.

This blocks the main thread while the page loads, so the hero feels janky and the
page is slow to respond to the first clicks/taps — directly against the mission's
**"perceived and real speed"** and **INP < 200 ms** targets.

**Brand constraint (hard):** the **3D tire animation must not be removed** — per
brand spec. So we do **not** drop it; we **optimize around it**: load its JS and
start its work **only when it makes sense** (after the page is interactive / when
visible), and make sure it **isn't burning the main thread when it's off-screen or
the tab is hidden**. There's already a `useCanvasActive` hook in the 3D folder, so
some "run only when active" plumbing exists to build on.

This is roadmap **P1.5** (JS/bundle: heavy three.js loads deferred) **+ P1.6**
(INP/interactivity: the 3D canvas only runs when active) — the biggest remaining
interactivity lever in Track 1.

## User stories

- As a **visitor landing on the home page (desktop)**, I want the page to respond
  to my clicks and typing immediately, so it feels fast even though there's a rich
  3D animation.
- As a **visitor**, I still want to see and interact with the 3D tire animation, so
  the experience stays as "alive" as the brand intends.
- As the **team**, we want the home 3D selector to stop blocking the main thread on
  load, so the desktop TBT/INP meets target — closing the last big interactivity gap
  the baseline found.

## Scope

- **In:**
  - The **home 3D tire size selector** (`TirePreview3D` and its mobile variant in
    `SearchBySize`).
  - **Defer** loading/initializing the heavy three.js work so it does **not block**
    the page becoming interactive on first load.
  - Ensure the 3D **render loop runs only when the canvas is actually active /
    visible** — paused when scrolled off-screen or when the browser tab is hidden
    (not a continuous rAF burning CPU).
  - Ensure **three.js (and related non-critical JS) is code-split / loaded
    deferred**, not in the critical hydration path.
  - Apply the **pause-when-inactive** fix to the detail `TreadWearExplorer` **too, if
    it shares the same hook** (low-cost, covers both 3D canvases).
- **Out:**
  - **Removing or replacing** the 3D animation (brand constraint) — it must remain
    visible and interactive once loaded.
  - A dedicated rework of the detail `TreadWearExplorer` **beyond** reusing the shared
    active-gating hook (its lab cost is minor: TBT 80/180 ms).
  - Unrelated JS/bundle trimming (polyfills, other chunks) — a later P1.5 pass if
    needed.
  - The hero **video** and other media (separate concerns / brand-protected).

## Functional requirements

- **FR1:** The home 3D selector must **not block the main thread during initial
  load** — its heavy init/render is deferred until the page is interactive, mounting
  on **idle** (`requestIdleCallback`, with a timeout fallback) rather than during
  hydration.
- **FR2:** The 3D **render loop pauses when the canvas is not active** — off-screen
  (scrolled away) or the tab is hidden — and resumes when it's visible/active again.
- **FR3:** **three.js and related non-critical JS load deferred** (dynamic import /
  separate chunk), not in the first blocking bundle.
- **FR4:** The **3D tire animation still works**: it appears in the hero, renders
  correctly, and stays interactive (rotate / size selection) once loaded — no visual
  or functional change to the animation itself.
- **FR5:** The **size-search UX** (the primary hero action) keeps working before,
  during and after the 3D loads — search is never blocked by the 3D.
- **FR6:** **Mobile** behavior is preserved (the mobile variant stays at least as
  light as today — no regression).

## Acceptance criteria (testable)

- [ ] **AC1:** Post-deploy PSI on the Home URL shows **desktop TBT materially reduced**
  from the **19,760 ms** baseline (and main-thread work down), moving toward the
  INP < 200 ms goal.
- [ ] **AC2:** When the 3D canvas is **off-screen or the tab is hidden**, it is **not**
  running its animation loop (verifiable: no continuous rAF / CPU for the canvas in
  DevTools Performance while scrolled away or backgrounded).
- [ ] **AC3:** The **three.js chunk loads deferred** — it is a separate chunk not in
  the initial blocking bundle (verifiable in the build output / Network waterfall:
  the 3D JS loads after the page is interactive).
- [ ] **AC4:** The **3D tire animation still renders and is interactive** after load
  (rotate / size selection), and the **size search works** throughout — verified
  manually and by existing tests.
- [ ] **AC5:** **No new CLS** from deferring the mount — while the 3D loads, an
  **animated skeleton** occupies the 3D area (same dimensions), so nothing jumps when
  the canvas swaps in (CLS stays < 0.1).
- [ ] **AC6:** Definition of Done green (`tsc` + `lint` + `test` + `build`), with
  tests/manual checks for the deferral/active-gating behavior.

## Non-functional / constraints

- **Brand:** the 3D animation stays — optimize around it, never remove it.
- **Reuse before creating:** build on the existing `useCanvasActive` hook and the
  current `TirePreview3D` / mobile split rather than new machinery.
- **Accessibility:** respect `prefers-reduced-motion` where relevant; don't trap
  focus or block interaction while the 3D loads.
- **Mobile-first:** verify desktop (where the cost is) but don't regress mobile.

## Decisions (from /clarify)

- **Trigger = idle-mount after interactive.** Defer the 3D mount with
  `requestIdleCallback` (with a timeout fallback for Safari / long-idle) so it appears
  almost immediately but never blocks the first click/typing. Chosen over
  on-interaction (would hide the 3D until the user acts) and a fixed delay (less
  deterministic).
- **Placeholder = animated skeleton.** While the 3D JS/model loads, an animated
  skeleton occupies the exact 3D area (reserves space → no CLS), then the canvas
  swaps in.
- **Detail 3D = included if it shares the hook.** Apply the same pause-when-inactive
  gating to the detail `TreadWearExplorer` when it reuses the shared hook (low cost,
  covers both canvases); no dedicated rework beyond that.
- **Verification = you re-run PSI post-deploy; lab TBT is the AC1 proxy.** Locally we
  confirm in DevTools/build that the three.js chunk is deferred and the render loop is
  paused when off-screen/hidden; the authoritative AC1 "after" is your production PSI
  run, using **lab TBT** as the proxy (field INP needs CrUX, which lags).

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
