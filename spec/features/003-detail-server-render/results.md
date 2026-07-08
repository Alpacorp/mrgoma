# Results — 003-detail-server-render (P1.7)

> Before/after for server-rendering the detail page. "Before" comes from
> [001-perf-baseline](../001-perf-baseline/baseline.md) (2026-06-30). "After" is a
> post-deploy PSI (Lighthouse lab) run on the detail URL, captured 2026-07-06.

## What shipped

The product detail page now renders from **server-fetched data** (server
`DetailView` + client islands) instead of a client `useEffect` fetch. The content
and main image ship in the initial HTML; nothing injects late.

## Detail route — before → after (Lighthouse lab)

| Metric | Mobile before | Mobile after | Desktop before | Desktop after |
| ------ | ------------- | ------------ | -------------- | ------------- |
| **CLS** | 0.914 🔴 | **0** ✅ | 0.525 🔴 | **0** ✅ |
| **LCP** | 4.5 s | **3.2 s** 🟠 | — | **0.6 s** ✅ |
| FCP | — | 1.0 s ✅ | — | 0.3 s ✅ |
| TBT | — | 150 ms ✅ | — | 50 ms ✅ |
| Speed Index | — | 2.5 s ✅ | — | 0.9 s ✅ |

_Mobile: Moto G Power emulated, slow-4G throttling, Lighthouse 13.4.0._

## Read

- **CLS fixed outright (0.914 → 0 mobile, 0.525 → 0 desktop).** The late
  client-injected content was the whole cause; server-rendering removed it. This
  was the biggest single defect in the baseline. ✅ **AC2 / AC3 met.**
- **LCP improved (4.5 s → 3.2 s mobile).** The image is now discoverable in the
  initial HTML (+ `fetchpriority=high` from P1.1). The remaining gap to the < 2.5 s
  target is **image payload**, addressed separately in **P1.2** (out of scope here).
- Desktop is comfortably in the green across the board.

## Acceptance criteria

- **AC1** (content in initial HTML) — ✅ verified via server render + manual check.
- **AC2** (CLS < 0.1, LCP improved, discoverable) — ✅ CLS = 0; LCP −1.3 s.
- **AC3** (main image priority, not lazy) — ✅ manual DevTools check.
- **AC4** (interactive features) — ✅ manual check (zoom, tread 3D, carousel,
  add-to-cart, sold/stock).
- **AC5** (client fetch removed, server fetch reused) — ✅ `Detail.tsx` deleted;
  grep confirms no `/api/tire` call in the detail render path.
- **AC6** (DoD + tests) — ✅ tsc + lint + test (113/113) + build green.
