# Plan — High fetch priority for the LCP element

> Feature: `002-lcp-fetchpriority` · Based on: [spec.md](./spec.md) · Created: 2026-07-01

## Technical approach

Small, surgical change: make each route's LCP resource high-priority, using the
mechanism that fits its element type. Grounding the LCP elements in the code
**shrinks the work** — `/tires` is already handled.

- **`/tires` — already done in code.** The LCP is the shared header background
  `Image` (`src/app/ui/sections/Header/Header.tsx:54`):
  `<Image src="/assets/images/bg-header.svg" alt="" fill className="object-cover" priority />`
  — it **already has `priority`**, so `next/image` emits `fetchpriority="high"` +
  a preload. The baseline flag reflects the deployed build; **action = verify
  post-deploy**, no code change. _(Note: this shared header image is `priority` on
  every route; on Home/Detail it isn't the LCP, but it's a small SVG, so the
  competing-preload cost is negligible — left as-is, out of scope.)_
- **Home `/` — add a high-priority preload for the poster.** The LCP is the hero
  `<video poster="/assets/images/banner-hero.webp">`
  (`src/app/(home)/container/Home/Home.tsx:107-120`). A `<video>` poster has no
  native `fetchpriority`, so we preload the poster image at high priority.
- **Detail — prioritize the main product image.** The LCP is the main image in
  `ProductImageZoom` (`ProductImageZoom.tsx:75-84`), currently `priority={false}`
  (so `next/image` also lazy-loads it). Thread a `priority` prop and set it for the
  **first** image. Partial win only (the image is still client-fetched → the
  "discoverable in initial HTML" audit stays failing until **P1.7**).

## Reuse first

- **`next/image` `priority`** — the existing pattern (already used in `Header` and
  `TireCard`); no new mechanism for the Detail image.
- **React 19 / Next 16 preload** — `ReactDOM.preload()` (or a plain
  `<link rel="preload">`) for the Home poster; no new dependency.
- No new libraries, no config changes.

## Files to add / change

- `src/app/(home)/container/Home/Home.tsx` — add a high-priority **preload** for
  `/assets/images/banner-hero.webp` (e.g.
  `import { preload } from 'react-dom'; preload('/assets/images/banner-hero.webp', { as: 'image', fetchPriority: 'high' })`,
  or render `<link rel="preload" as="image" href="…" fetchPriority="high" />`).
- `src/app/ui/components/ProductImageZoom/ProductImageZoom.tsx` — add an optional
  `priority?: boolean` prop; pass it to the base `Image` (`priority={priority}`),
  replacing the hard-coded `priority={false}`. `priority` makes `next/image` eager
  + `fetchpriority="high"`.
- `src/app/ui/sections/ProductCarousel/ProductCarousel.tsx` — pass
  `priority={index === 0}` to `<ProductImageZoom>` so only the initially-shown
  (LCP) image is prioritized.
- **`/tires`:** no change (already `priority`).

## Data & flow

No data/API changes. Purely resource-hint/attribute changes on already-rendered
elements. The Home preload is a static asset path that matches the `<video>`
poster URL exactly (so the browser reuses the cached fetch).

## Acceptance criteria → implementation

| AC  | How it's met                                                                                             | How it's verified                                                        |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AC1 | Home poster preloaded `fetchpriority=high`; Detail image `priority` (eager); `/tires` already `priority` | Post-deploy PSI: "LCP request discovery" shows fetchpriority applied; Detail not lazy |
| AC2 | Same change should lower mobile LCP on Home/Detail                                                        | Post-deploy PSI before/after appended to the baseline                    |
| AC3 | Only resource hints/attributes change; no markup/layout change; video + 3D untouched                     | Manual check on all 3 routes (mobile); no new CLS                        |
| AC4 | Only the Home poster + the Detail **first** image are prioritized (`index === 0`)                        | Code review: no other image gains `priority`                             |
| AC5 | DoD                                                                                                       | `tsc` + `lint` + `test` + `build` green; manual route check              |

## Tradeoffs / alternatives

- **Home poster:** `ReactDOM.preload()` (idiomatic React 19, dedupes) vs a plain
  `<link rel="preload">` (explicit, framework-agnostic). Either satisfies AC1;
  recommend `ReactDOM.preload` since Home is a Server Component and it hoists
  cleanly.
- **Detail:** prioritize only the **first** image (`index === 0`) rather than the
  always-current image, to respect FR3 (one prioritized image) and avoid eager-
  loading every gallery image as the user navigates.
- **`/tires`:** considered adding an explicit hint, but the attribute is already
  present — adding more would violate "one LCP resource" and risk double-preload.

## Risks

- **`/tires` may still flag post-deploy.** If PSI still reports missing
  fetchpriority after deploying current code, `next/image priority` on the `fill`
  header image isn't emitting as expected → investigate (inspect the deployed
  `<img>`), possibly add an explicit preload. Captured as a verify step, not a
  code change yet.
- **Detail preload is late** (src known only after the client fetch) → partial LCP
  gain; the real fix is P1.7. Expected and documented.
- **Poster preload path** must exactly match the `<video poster>` URL, else it's a
  wasted download. It does (`/assets/images/banner-hero.webp`).

## Out of scope

- Server-rendering the Detail product fetch (**P1.7**) — needed for the Detail
  "discoverable in initial HTML" audit.
- Image/video payload optimization (**P1.2**), 3D TBT (**P1.5/P1.6**), CLS
  (**P1.4**), accessibility.
- Refactoring the shared `Header` background-image priority.

---

_The concrete steps live in [tasks.md](./tasks.md)._
