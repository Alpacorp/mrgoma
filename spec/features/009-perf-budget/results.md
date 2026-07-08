# Results — Re-measure CWV & performance budget (P1.8)

> Feature: `009-perf-budget` · Status: budget shipped; CWV re-measure awaiting PSI

## JS-weight budget (shipped)

Measured on the current production build (gzip), with headroom above today's real
numbers so the budget guards *growth*:

| Metric | Current (gzip) | Budget | Result |
| ------ | -------------- | ------ | ------ |
| Shared First-Load JS | **157.3 KB** | ≤ 180 KB | ✅ pass |
| Total client JS | **611.0 KB** | ≤ 680 KB | ✅ pass |

Guard: `npm run perf:budget` (`scripts/perf-budget.mjs`), run after `npm run build`
as part of the DoD / before a deploy. Exits non-zero on a breach or a
missing/format-changed manifest. **Not a CI step** — `next build` needs the DB
(build-time fetches + `constants.ts` env throw), which CI lacks; keeping the guard
local avoids DB/secret coupling in CI.

## CWV re-measure — before → after (post-deploy PSI)

> **Before** = 001 baseline (2026-06-30). **After** = PSI on the deployed `main`
> (mobile + desktop) — you run it and provide the numbers; the assistant fills
> this in. Targets: **LCP < 2.5s · INP < 200ms · CLS < 0.1**. Detail URL
> standardized on: _tbd (the first real-photo tire you pick)_.

### Home `/`

| Metric | Before (mobile) | After (mobile) | Before (desktop) | After (desktop) | Target met? |
| ------ | --------------- | -------------- | ---------------- | --------------- | ----------- |
| Perf score | 84 | _tbd_ | 55 | _tbd_ | — |
| LCP | 4.5 s ⚠️ | _tbd_ | 1.8 s | _tbd_ | _tbd_ |
| INP / TBT (lab) | TBT 0 ms | _tbd_ | TBT **19,760 ms** 🔴 | _tbd_ | _tbd_ |
| CLS | 0 | _tbd_ | 0 | _tbd_ | _tbd_ |

### `/tires`

| Metric | Before (mobile) | After (mobile) | Before (desktop) | After (desktop) | Target met? |
| ------ | --------------- | -------------- | ---------------- | --------------- | ----------- |
| LCP | _tbd_ | _tbd_ | _tbd_ | _tbd_ | _tbd_ |
| INP / TBT (lab) | _tbd_ | _tbd_ | _tbd_ | _tbd_ | _tbd_ |
| CLS | ≤ 0.004 | _tbd_ | 0 | _tbd_ | _tbd_ |

### Detail `/tires/[slug]`

| Metric | Before (mobile) | After (mobile) | Before (desktop) | After (desktop) | Target met? |
| ------ | --------------- | -------------- | ---------------- | --------------- | ----------- |
| LCP | 4.5 s ⚠️ | _tbd_ | _tbd_ | _tbd_ | _tbd_ |
| INP / TBT (lab) | _tbd_ | _tbd_ | _tbd_ | _tbd_ | _tbd_ |
| CLS | **0.914** 🔴 | _tbd_ | **0.525** 🔴 | _tbd_ | _tbd_ |

_Any target still missed after re-measure → recorded here as a follow-up (not
re-optimized in this phase)._

## Automated gates (local)

| Gate | Result |
| ---- | ------ |
| `npx tsc --noEmit` | ✅ pass |
| `npm run lint` | ✅ pass |
| `npm test` | ✅ (+4 budget-evaluator tests) |
| `npm run build` | ✅ compiles |
| `npm run perf:budget` | ✅ within budget |
