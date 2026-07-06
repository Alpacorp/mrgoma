# Results — 002-lcp-fetchpriority (P1.1)

> Before/after for the LCP-priority change. "Before" comes from
> [001-perf-baseline](../001-perf-baseline/baseline.md) (2026-06-30). Fill "after"
> from a **post-deploy PSI run** on the three production URLs.

## Changes shipped

- **Home `/`** — preload `banner-hero.webp` as a high-priority image
  (`ReactDOM.preload`, `as: image`, `fetchPriority: high`) for the `<video>`
  poster LCP.
- **Detail** — the first product image is now `priority` → eager +
  `fetchpriority=high` (partial; the client-fetch → server-render fix is **P1.7**).
- **/tires** — no change; the header background already carries `priority`. Verify
  the LCP audit now passes.

## LCP before → after (mobile, lab)

| Route    | LCP before | LCP after | `fetchpriority` audit         |
| -------- | ---------- | --------- | ----------------------------- |
| Home `/` | 4.5 s      | _pending_ | before ❌ → after _pending_    |
| /tires   | 3.2 s      | _pending_ | before ❌ → after _pending_    |
| Detail   | 4.5 s      | 3.2 s     | before ❌ (+lazy) → after ✅    |

> Home `/` and `/tires` "after" still pending a PSI run on those URLs.
> **Detail** was measured after **P1.7** shipped (2026-07-06): LCP 4.5 s → 3.2 s and
> CLS 0.914 → 0 (mobile). With the image now server-rendered, the "discoverable in
> the initial HTML" sub-audit passes. Full detail numbers:
> [003 results](../003-detail-server-render/results.md).
