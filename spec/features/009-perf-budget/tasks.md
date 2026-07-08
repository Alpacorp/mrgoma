# Tasks — Re-measure CWV & set a performance budget (close Track 1)

> Feature: `009-perf-budget` · Based on: [plan.md](./plan.md) · Created: 2026-07-08

Ordered, **very small, independently verifiable** tasks. Build the guard first
(calibrated to today's real numbers), then wire CI + docs, then the re-measure.

## The JS-weight guard

- [x] **T1 — Budget file** · `perf-budget.json` at repo root with the gzip limits:
  `sharedFirstLoadJs.limitKB = 180`, `totalClientJs.limitKB = 680` (+ a note on
  what each measures). · files: **new** `perf-budget.json` · check: valid JSON.
- [x] **T2 — Budget script** · `scripts/perf-budget.mjs` (Node built-ins only):
  exported pure fns `measure(nextDir)` (gzip-sum `rootMainFiles`+`polyfillFiles`
  from `build-manifest.json` → shared; gzip-sum every `static/chunks/*.js` →
  total) and `evaluateBudget(measured, budget)`; a `main()` that prints a ✓/✗
  table and `process.exit(1)` on breach **or** on missing/empty `rootMainFiles`
  (loud fail on format change), guarded by an `import.meta`/`argv` main-check so
  importing it for tests has no side effects. · files: **new**
  `scripts/perf-budget.mjs` · check: `node scripts/perf-budget.mjs` on the current
  build prints both metrics under budget and exits 0.
- [x] **T3 — npm script** · add `"perf:budget": "node scripts/perf-budget.mjs"` to
  `package.json`. · files: `package.json` · check: `npm run perf:budget` green on
  the current build.

## Tests

- [x] **T4 — Unit test the evaluator** · `src/perf-budget.test.ts` imports
  `evaluateBudget` from `../scripts/perf-budget.mjs`: a within-budget input →
  `pass: true`; an over-budget input → `pass: false` with the offending metric
  flagged (covers AC4 without needing a build). · files: **new**
  `src/perf-budget.test.ts` · check: `npm test` green (suite grows).

## CI + documentation

- [x] **T5 — Wire the guard into CI** · in `.github/workflows/ci.yml`, add (after
  the test step) `npm run build` then `npm run perf:budget`. No DB env needed — the
  brand/size `generateStaticParams` already `try/catch → []`. · files:
  `.github/workflows/ci.yml` · check: workflow YAML valid; the local
  build → `perf:budget` sequence passes (CI re-verifies on push).
- [x] **T6 — Document the budget** · extend `tech-stack.md` "Performance budget"
  with the JS limits (shared ≤180 KB, total ≤680 KB gzip, `perf-budget.json`, how
  CI checks it) and mark **P1.8 done + Track 1 exit-criteria status** in
  `roadmap.md`. · files: `spec/tech-stack.md`, `spec/roadmap.md` · check: both read
  correctly; numbers match `perf-budget.json`.

## Re-measure + Done

- [ ] **T7 — Record CWV before→after** _(needs your post-deploy PSI)_ · in
  `results.md`, fill the before(001)→after table for home, `/tires` and a detail
  URL (mobile + desktop: LCP, INP/TBT, CLS, score), mark each target met/miss, and
  note the standardized detail URL. Any miss → follow-up (not fixed here). · files:
  **new** `spec/features/009-perf-budget/results.md` · check: table complete once
  you provide the numbers.
- [~] **T-DoD — Definition of Done** _(automated gates; PSI is yours)_ ·
  `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` +
  `npm run perf:budget` all green on `main`. · check: five gates green; budget
  passes at today's real numbers.

## Traceability

| Task       | Acceptance criteria                                   |
| ---------- | ----------------------------------------------------- |
| T1, T6     | AC3 (budget defined with concrete numbers)            |
| T2, T4     | AC4 (guard enforces — breach fails, within passes)    |
| T3, T5     | AC4 (enforced automatically in CI)                    |
| T6         | AC5 (documented in constitution + roadmap)            |
| T7         | AC1, AC2 (after recorded; targets confirmed/misses)   |
| T1–T5, T-DoD | AC6 (DoD gates + guard green on current main)       |

---

_Run `/analyze` next to check spec ↔ plan ↔ tasks consistency before implementing._
