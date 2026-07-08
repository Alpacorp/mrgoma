# Plan — Re-measure CWV & set a performance budget (close Track 1)

> Feature: `009-perf-budget` · Based on: [spec.md](./spec.md) · Created: 2026-07-08

## Technical approach

Two deliverables: a **documented re-measurement** (owner-run post-deploy PSI,
recorded in `results.md`) and a **lightweight JS-weight guard** run as a
local/pre-deploy gate (`npm run perf:budget`).

### Grounding discovery — what Next 16 (Turbopack) exposes

The clarified plan was "per-route First-Load JS", but the current build shows
**Turbopack does not emit per-route First-Load JS**:

- The build route table has **no "First Load JS" column** at all (only type /
  route / Revalidate / Expire).
- There is **no `app-build-manifest.json`** (the file that used to map route →
  chunks). Per-route data survives only as server-side
  `page_client-reference-manifest.js` maps — not chunk-size lists.
- What **is** reliably available in `.next/build-manifest.json` is
  **`rootMainFiles` (+ `polyfillFiles`)** — the **First Load JS shared by every
  app-router page**. That shared floor is identical across routes, dominates the
  per-route number, and is exactly the JS that lands on first paint and drives
  INP/TBT (our worst baseline metric).

**Adjustment (flagged for confirmation):** budget the two numbers Turbopack
exposes reliably instead of an unobtainable per-route-exact figure:

1. **Shared First-Load JS** (gzip of `rootMainFiles + polyfillFiles`).
2. **Total client JS** (gzip of every `.next/static/chunks/*.js`, incl. deferred
   chunks like the ~982 KB three.js — catches lazy-bundle/dep bloat too).

This guards the same regression class the clarification cared about, at the
granularity the platform actually provides. (Getting true per-route numbers would
mean adding `@next/bundle-analyzer` — heavier, rejected as over-tooling.)

### Current real numbers (calibration basis)

Measured from a local production build (gzip):

| Metric | Current (gzip) | Budget (gzip) | Headroom |
| ------ | -------------- | ------------- | -------- |
| Shared First-Load JS | **157.3 KB** | **180 KB** | ~14% |
| Total client JS | **611.0 KB** | **680 KB** | ~11% |

Budgets are set **above today's real values** (per the "honest baselining"
constraint) so they guard *growth*, not fail on day one, with enough headroom to
absorb minor Linux/Windows build variance.

### The guard

- **`perf-budget.json`** (repo root) — the limits (`limitKB` per metric) + a note;
  the single source of truth, easy to bump deliberately in a PR.
- **`scripts/perf-budget.mjs`** — Node built-ins only (no new deps): reads
  `.next/build-manifest.json`, gzip-sums the shared + all-chunk files, compares to
  `perf-budget.json`, prints a per-metric ✓/✗ table, and `process.exit(1)` on any
  breach. It also **fails loudly if the manifest is missing or `rootMainFiles` is
  empty** — so a build failure or a future Turbopack format change surfaces as an
  error, never a silent pass. The size math lives in exported pure functions so it
  is unit-testable without a build.
- **`package.json`** — `"perf:budget": "node scripts/perf-budget.mjs"`.
- **Run as a local/pre-deploy gate** — `npm run build && npm run perf:budget`, in
  the Definition of Done and before a deploy. _Not_ a CI step: a first attempt to
  add `build + perf:budget` to CI failed because `next build` needs the DB for
  build-time data fetches (`sitemap`, `/tires/new|used` call repositories that hit
  SQL, and `constants.ts` throws on missing env at import), which CI doesn't have.
  Owner chose to keep the guard out of CI rather than make the whole build
  DB-optional. (That DB-optional refactor — lazy `constants`/`db` + guarded
  build-time fetches — is the noted alternative if CI enforcement is wanted later.)

### Re-measure

Owner deploys `main`, runs PSI (mobile + desktop) on `/`, `/tires` and one detail
URL, and provides the numbers; the assistant records **before (001) → after** in
`results.md`, marking each target met/miss. Any miss becomes a follow-up, not a
fix here.

## Reuse first

- The constitution's existing **CWV targets** (`tech-stack.md`) — reused as the
  field budget; this feature adds the enforceable JS part beside them.
- The existing **`ci.yml`** — extended with a build + budget step, not replaced.
- **Node built-ins** (`fs`, `zlib`) — no `size-limit`/analyzer dependency.
- The **001 baseline** doc — the "before" side of the re-measurement.

## Files to add / change

- **`perf-budget.json`** — **new**; the JS-weight limits.
- **`scripts/perf-budget.mjs`** — **new**; the measurement + check CLI (pure
  functions exported for tests).
- **`src/perf-budget.test.ts`** — **new**; unit tests for `evaluateBudget`
  (within-budget passes; over-budget fails → covers AC4).
- **`package.json`** — add the `perf:budget` script.
- **`spec/tech-stack.md`** — extend the "Performance budget" section with the JS
  limits and how they're checked (`npm run perf:budget`, local/pre-deploy) (AC5).
- **`spec/roadmap.md`** — mark P1.8 done and state Track 1 exit-criteria status.
- **`spec/features/009-perf-budget/results.md`** — **new**; before→after CWV table
  (filled from the owner's PSI) + the recorded JS budget numbers.

## Data & flow

No runtime/app changes — build-time only. The guard reads build output
artifacts; nothing ships to users. PSI is external/manual.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (after recorded) | `results.md` before→after table | Owner's post-deploy PSI, recorded |
| AC2 (targets confirmed) | Table marks LCP/INP(TBT)/CLS met per route | From the PSI numbers; misses listed as follow-ups |
| AC3 (budget defined) | `perf-budget.json` + tech-stack limits (shared ≤180 KB, total ≤680 KB gzip) | Review the file/doc |
| AC4 (guard enforces) | `scripts/perf-budget.mjs` exits non-zero on breach | Unit test: `evaluateBudget` passes within budget, fails over; `npm run perf:budget` green on current build |
| AC5 (documented) | `tech-stack.md` "Performance budget" + roadmap updated | Review the diff |
| AC6 (DoD) | Small, build-only change | `tsc`+`lint`+`test`+`build` green; `perf:budget` green on `main` |

## Tradeoffs / alternatives

- **Shared + total JS (chosen)** vs **per-route-exact** — per-route isn't emitted
  by Turbopack; the shared floor is the dominant, reliable proxy. Chosen for
  reliability without new tooling.
- **Node script (chosen)** vs **`size-limit` / `@next/bundle-analyzer`** — built-in
  `zlib` does the job in ~60 lines; no dependency, no headless browser.
- **gzip (chosen)** vs raw on-disk — gzip is what users download and the honest
  metric; `zlib.gzipSync` is free.
- **Local/pre-deploy gate (chosen after CI attempt)** vs a CI step — CI can't
  `next build` without a DB (build-time fetches + `constants.ts` env throw). Rather
  than make the whole build DB-optional (lazy `constants`/`db` + guarded fetches),
  the owner chose to run the guard in the DoD / pre-deploy. Trade: not enforced on
  every PR (relies on the DoD), but zero DB/secret coupling in CI.

## Risks

- **CI build needs a DB (realized)** — `next build` fails without a DB:
  `constants.ts` throws on missing env at import, and `sitemap` / `/tires/new|used`
  fetch at build. This is why the guard runs locally/pre-deploy, not in CI. Making
  the build DB-optional (lazy `constants`/`db` + guarded fetches) would re-enable a
  CI step later.
- **Build-to-build gzip variance** — absorbed by the ~11–14% headroom.
- **Turbopack manifest format changes** — the script fails loudly on an empty/
  missing `rootMainFiles`, so a format change is caught, not silently passed.
- **Budget set too loose** — headroom is modest (~11–14%); tightened later if
  needed.

## Out of scope

- New optimizations (measure & guard only); field-CWV enforcement in CI (not
  measurable pre-deploy); per-route-exact JS; total-transfer/image budgets.

---

_The concrete steps live in [tasks.md](./tasks.md)._
