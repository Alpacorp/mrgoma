# Spec — Re-measure CWV & set a performance budget (close Track 1)

> Feature: `009-perf-budget` · Status: Draft · Created: 2026-07-08
> Roadmap: P1.8 · Branch: `feat/009-perf-budget`

## Why — problem & value

Track 1 (Performance / Core Web Vitals) is nearly done: P1.0–P1.7 shipped and are
merged to `main` (LCP image priority, image payload, server-render detail, fonts,
structural CLS, 3D deferral, Tailwind-v4 fixes). Two things remain to **close the
track responsibly**:

1. **Prove it worked.** The baseline (001) recorded the "before" — e.g. desktop
   **TBT 19,760 ms** 🔴, mobile **LCP 4.5 s** ⚠️, detail **CLS 0.914** 🔴. We need
   the **"after"** on the deployed site to confirm the three targets are met
   (**LCP < 2.5s · INP < 200ms · CLS < 0.1**) and to record the win honestly.
2. **Keep it from regressing.** Performance that isn't guarded silently erodes —
   one heavy import or unoptimized image and we're back to a 3 MB payload. The
   mission says **performance is a feature**; a feature needs a **budget** so a
   future PR can't quietly break it.

This phase does both: a **final re-measurement** against the baseline, and a
**performance budget** (thresholds + a lightweight guard) so regressions are
caught early. It is the P1.8 slice — the **exit gate** of Track 1.

## User stories

- As the **site owner**, I want proof the performance work hit its targets on the
  real deployed site, so I know Track 1 delivered and can move to payments.
- As a **developer opening a PR**, I want an automatic signal if my change blows
  the performance budget (e.g. ships too much JS), so I fix it before it reaches
  users instead of discovering it in the field weeks later.
- As a **maintainer**, I want the performance targets and limits written down in
  one place, so "how fast is fast enough" isn't tribal knowledge.

## Scope

- **In:**
  - **Re-measure** CWV on the three key routes (home, `/tires`, a detail page) on
    the **deployed** site via PageSpeed Insights (mobile + desktop): LCP, INP (or
    its TBT lab proxy), CLS, and the performance score. Record **before → after**
    vs the 001 baseline in a results doc and state whether each target is met.
  - **Define the performance budget** — the thresholds a change must stay within:
    the CWV field targets (from the constitution) **plus** an enforceable,
    measurable-without-deploy JS-weight proxy (shared First-Load JS + total client
    JS).
  - **Add a lightweight guard** that enforces the enforceable part automatically
    (in CI or an equivalent check), so a regression fails fast — without adding
    heavy tooling unless justified.
  - **Document the budget** in the constitution (extend the existing
    `tech-stack.md` "Performance budget" section) so it's discoverable and durable.
  - Mark Track 1 **exit criteria** met (or list what remains) in the roadmap.
- **Out:**
  - New performance *optimizations* — this phase measures and guards; it does not
    re-optimize (that was P1.1–P1.7). If re-measure reveals a **missed** target, we
    record it and open a follow-up, not fix it here.
  - Field-data (CrUX) enforcement in CI — field CWV can't be measured pre-deploy;
    CI guards the pre-deploy proxy, field targets stay a documented post-deploy
    gate.
  - Synthetic monitoring / alerting infrastructure beyond the chosen guard.

## Functional requirements

- **FR1:** The final CWV numbers (LCP, INP/TBT, CLS, score; mobile + desktop) for
  home, `/tires` and detail are recorded against the 001 baseline, each marked
  **meets / misses** the target.
- **FR2:** A written **performance budget** exists: the CWV targets **and**
  concrete **JS-weight** limits — **shared First-Load JS** (loaded by every page)
  and **total client JS** — with specific KB (gzip) numbers.
- **FR3:** The JS-weight budget is **enforced automatically in CI** — a change that
  pushes the shared First-Load JS or total client JS over its limit fails the check
  before merge; no headless-browser tooling.
- **FR4:** The budget and the measurement method are **documented** in the
  constitution so future contributors can find and follow them.
- **FR5:** The roadmap reflects Track 1's **exit criteria** status (met, or the
  precise remainder).
- **FR6:** The guard is **lightweight** — no heavy tooling (e.g. headless-browser
  CI) unless a lighter option can't do the job; it must not materially slow CI.

## Acceptance criteria (testable)

- [ ] **AC1 (after recorded):** A results doc shows before→after CWV for the three
      routes (mobile + desktop) from deployed-site PSI, each target marked
      meets/misses. (Authoritative numbers provided post-deploy by the owner.)
- [ ] **AC2 (targets confirmed):** For each route where data exists, LCP < 2.5s,
      INP < 200ms (or TBT within the agreed lab proxy) and CLS < 0.1 are shown met
      — or any miss is explicitly listed with a follow-up.
- [ ] **AC3 (budget defined):** The budget doc states concrete numbers: the CWV
      targets and JS-weight limits — shared First-Load JS and total client JS (gzip
      KB, e.g. "shared First-Load JS ≤ 180 KB").
- [ ] **AC4 (guard enforces):** The JS-weight check **passes** on `main` (within
      budget) and **fails** on a deliberate breach — demonstrated once (unit test +
      `npm run perf:budget`).
- [ ] **AC5 (documented):** The `tech-stack.md` "Performance budget" section (and
      the roadmap exit line) is updated with the budget and how it's checked.
- [ ] **AC6 (no regression / DoD):** `tsc --noEmit`, `lint`, `test`, `build` green;
      the new guard runs green on the current `main` (the budget is set at or above
      today's real numbers, not below them).

## Non-functional / constraints

- **Reuse before creating:** reuse the constitution's existing CWV targets and the
  existing CI workflow; prefer extending them over new infrastructure.
- **Lightweight:** the guard must keep CI fast; avoid headless-browser runs unless
  necessary.
- **Honest baselining:** set the enforceable limit at (or just above) the current
  real value so it guards against *growth*, not an aspirational number that fails
  on day one.
- **Mobile-first:** the re-measure prioritizes mobile numbers (our users skew
  mobile), reported alongside desktop.

## Resolved clarifications

- **Enforcement = lightweight CI check on JS weight.** Add a build + a check to CI
  that fails when the shared First-Load JS or total client JS exceeds its limit
  (a small Node script gzip-summing the build's chunks). No headless Chrome;
  ~1–2 min of extra CI. This guards the regression class that drives INP/TBT (our
  worst baseline metric).
- **Budget scope = JS weight (shared First-Load JS + total client JS).** Few,
  high-signal limits; JS weight is what breaks INP/TBT. _Adjusted during `/plan`
  (owner-confirmed):_ Next 16/Turbopack does **not** emit per-route First-Load JS
  (no `app-build-manifest.json`, no size column in the build table). It reliably
  exposes `rootMainFiles` = the **First Load JS shared by every page** (the
  dominant, cross-route portion) — so we budget that shared floor **plus** total
  client JS, instead of an unobtainable per-route-exact figure. (No
  total-transfer / image-weight limits this slice.)
- **Re-measure = owner-run post-deploy PSI.** As with 002/003/005/006/008: deploy
  `main`, run PSI on `/`, `/tires` and one **detail** URL (mobile + desktop); the
  owner provides the numbers, the assistant records the before→after in
  `results.md`. The detail URL is standardized on the first real-photo tire the
  owner selects (recorded in `results.md`).

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
