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
| Detail   | 4.5 s      | _pending_ | before ❌ (+lazy) → _pending_  |

> After deploy, re-run PSI on the three production URLs and fill "after".
> Note: Detail's "discoverable in the initial HTML" sub-audit stays failing until
> **P1.7** (the image is still client-fetched).
