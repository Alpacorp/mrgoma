# Spec — Server-render the product detail page

> Feature: `003-detail-server-render` · Status: Draft · Created: 2026-07-03
> Roadmap: P1.7 · Branch: `feat/003-detail-server-render`

## Why — problem & value

The baseline ([001-perf-baseline](../001-perf-baseline/baseline.md)) found the
**product detail page is the worst route**, and both of its problems share **one
root cause**:

- **CLS 0.914 mobile / 0.525 desktop** 🔴 — the footer lurches down when late
  content appears.
- **LCP 4.5 s mobile** — the main product image isn't discoverable in the initial
  HTML.

Today the detail page (`Detail.tsx`, a top-level `'use client'` component) fetches
the product **client-side** (`/api/tire`, `no-store`) inside a `useEffect`. The
server ships only a **skeleton**; then the client fetch resolves, injects the tall
real content, and shoves the footer down (**CLS**) — and because the image only
exists after that fetch, it's discovered late (**LCP**). Even the P1.1 priority we
added can't help an element that isn't in the initial HTML.

**Server-rendering the product data** fixes both at once: the content (and the
main image) is present in the first HTML response, so the image is discoverable
and prioritized (LCP), and nothing injects late, so the footer doesn't move (CLS).
This is the **highest-leverage change in Track 1**. The server already fetches the
product for metadata/JSON-LD (a `React.cache`-wrapped `fetchProduct` in
`[slug]/page.tsx`), so the data path largely exists.

## User stories

- As a **visitor on a phone**, I want the tire's photo, price and specs to appear
  immediately and not jump around, so the page feels fast and stable.
- As the **team**, we want the detail page rendered from the server so LCP and CLS
  meet target, closing the biggest gap the baseline found.

## Scope

- **In:**
  - Fetch the product **on the server** and render the detail content (hero, main
    image, price, key specs — at least everything above the fold) into the
    **initial HTML**, instead of after a client `useEffect` fetch.
  - The **main product image** ships in the initial HTML, eager +
    `fetchpriority=high` (building on P1.1) → the discoverable LCP.
  - **Remove the late content injection** so the footer no longer shifts (CLS).
  - Keep all **interactive features** working — image zoom, tread & wear 3D,
    carousel navigation, add-to-cart, stock/sold states — by hydrating the client
    parts from **server-provided initial data** (props) rather than a client fetch.
- **Out:**
  - Redesigning the detail UI or changing its layout/content.
  - Tread 3D / zoom behavior or cost (P1.5/P1.6).
  - The `/tires` `SearchResults` client-fetch pattern (separate; the baseline
    showed its INP isn't a lab problem).
  - Image/video payload optimization (P1.2), accessibility work.

## Functional requirements

- **FR1:** The detail route fetches product data **on the server**; the visible
  above-the-fold content renders in the **initial server HTML** (not post-hydration).
- **FR2:** The **main product image** is in the initial HTML with priority (eager +
  `fetchpriority=high`) as the LCP element.
- **FR3:** No large layout shift from late content injection — the footer stays put
  (target **CLS < 0.1**).
- **FR4:** Interactive features still work after hydration: desktop lens + mobile
  fullscreen zoom, tread & wear 3D, carousel thumbnails, add-to-cart, and the
  sold/stock badges.
- **FR5:** **Reuse the existing server `fetchProduct`** (the `React.cache` one used
  for metadata/JSON-LD) — no duplicate/second fetch for the same product.
- **FR6:** Preserve current behavior for **unavailable/sold** products, the
  **generic fallback image**, and **not-found / error** states.

## Acceptance criteria (testable)

- [ ] **AC1:** The detail route's **initial HTML** (view-source / server response)
  contains the product's **main `<img>`** and key content (price, specs) — not just
  a loading skeleton.
- [ ] **AC2:** Post-deploy PSI on the detail URL shows **CLS < 0.1** and an improved
  **LCP** (mobile), and the "LCP request discovery → discoverable in the initial
  document" audit **passes**.
- [ ] **AC3:** The main image in the server HTML is the **LCP element** with
  `fetchpriority=high` and **not** `loading="lazy"`.
- [ ] **AC4:** All interactive features still work (zoom desktop + mobile, tread 3D,
  carousel, add-to-cart, sold/stock) — verified manually and by existing tests.
- [ ] **AC5:** **No duplicate data fetch** — the server fetch is reused; the client
  `useEffect` product fetch is removed (or reduced to a client-only refresh that
  doesn't re-fetch on first paint).
- [ ] **AC6:** Definition of Done green (`tsc` + `lint` + `test` + `build`), with
  tests updated/added for the new server → client data flow.

## Non-functional / constraints

- Keep the same data source and `/api/tire` contract; no new dependencies if
  avoidable.
- Product availability/price must stay accurate (see the freshness question below).

## Decisions (from /clarify)

- **Rendering strategy = (a) Server Component + client islands.** Render the detail
  page's product content on the **server** (reusing `fetchProduct`), keeping only
  the genuinely interactive parts as **client islands**: the image gallery/zoom
  (`ProductCarousel` / `ProductImageZoom`), the tread & wear 3D
  (`TreadWearExplorer`), and add-to-cart. This delivers the LCP/CLS fix **plus**
  less client JS (better INP/CWV) — chosen for UX + SEO. (Higher refactor risk,
  accepted.)
- **Freshness = dynamic / `no-store`.** The server fetch is fresh per request (as
  today), so price and sold/stock stay accurate; the detail route renders
  dynamically (no ISR caching for now).
- **Verification = you re-run PSI post-deploy.** Locally we confirm the initial
  HTML contains the main image + content and that no client product fetch remains;
  the authoritative AC2/AC3 check is your **production PSI run**, recorded as the
  "after".

> Side benefit of (a): removing the client-side product fetch and shrinking the
> client component also chips at the detail INP/JS weight (a P1.6 concern),
> although INP tuning is not a goal of this phase.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
