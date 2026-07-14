# Spec — Image variant budget (cut Image Optimization cost)

> Feature: `013-image-variant-budget` · Status: Draft · Created: 2026-07-14
> Roadmap: Backlog (cost/perf follow-up to `011-gmc-product-feed`) · Branch: `feat/013-image-variant-budget`

## Why — problem & value

Since the Google Merchant Center feed (`011-gmc-product-feed`) went live on
**~Jul 12**, Vercel's **Image Optimization** cost has become the dominant line on
the bill. Production data (Jul 14):

- Image Optimization is **89% of the infrastructure charge**: **$5.00 of $5.61**
  in the current cycle.
  - Transformations: **63.2K → $3.16**
  - Cache Writes: **460.79K → $1.84**
  - Cache Reads: 58.35K → $0.02
- Observability (14 days): **102K transformations**, flat until ~Jul 11 then a
  cliff from Jul 12–13 — exactly when we handed Google **4,102 product-page URLs**
  to crawl.
- Current run-rate: ~**11K transformations / 12h ≈ 22K/day**, which projects to
  roughly **$50/month** if nothing changes.

The optimization itself is working — **Average Size Change −81%**, so the bytes
shipped to shoppers are small and Core Web Vitals benefit. The problem is **not
efficiency, it's volume**: Vercel bills per unique cache key
(`projectId + source-url + width + quality + Accept`), and our configuration
multiplies the number of distinct variants far beyond what the site actually
renders. With ~16,400 source photos in the catalog, a bloated variant space turns
one crawl pass into tens of thousands of billed transformations and cache writes.

This directly serves the mission's **"performance is part of design"** and the
roadmap's **Track 1 (Core Web Vitals)** priority — but from the **cost/operations**
angle: we keep the delivered image quality and CWV wins from
[`004-image-payload`](../004-image-payload/spec.md), while stopping the catalog
crawl from being an open-ended cost. It also protects the value of the GMC feed:
we *want* Google to crawl the catalog, and this makes that crawl affordable.

## User stories

- As the **site owner**, I want the Vercel Image Optimization bill to stop growing
  with every catalog crawl, so a working SEO feed doesn't turn into a runaway cost.
- As a **shopper on a phone/4G**, I want images to keep loading fast and looking
  right, so cost-cutting on our side never makes the store slower or uglier.
- As the **team**, we want the number of billed image variants bounded to what the
  site actually displays, so we don't pay for image sizes and formats nobody sees.

## Scope

- **In — trim the variant space (the "variant diet"), keeping Vercel optimization on:**
  - `next.config.mjs` image config:
    - **Formats:** serve **WebP only** (`formats: ['image/webp']`), removing AVIF
      and the ×2 per-photo transformation multiplier. WebP has universal support;
      the ~15% larger bytes vs AVIF are irrelevant on photos already compressed
      −81%.
    - **Qualities:** keep only the quality value the site actually requests
      (`qualities: [75]`; no component passes a `quality` prop, so `50` is dead).
    - **Widths:** `deviceSizes: [640, 828, 1200, 1920]` and
      `imageSizes: [128, 256]` — catalog/cards top out at 1200; the two full-bleed
      `100vw` banners (`InfoSlider`, `LocationDetail`) may still request 1920 so
      they stay sharp on wide monitors; logos/thumbnails resolve from the small
      `imageSizes`. This replaces Next's defaults (which reach up to 3840px).
    - **Keep** `minimumCacheTTL` at its current 31-day value (already correct).
  - **`sizes`-without-`vw` audit and fix.** When a `next/image` `sizes` value
    contains **no `vw` unit**, Next generates the `srcset` from the **full width
    list (16 widths, up to 3840px)** regardless of how small the slot is. Every
    such component must be corrected so a small/fixed-size image requests only the
    2–3 widths it needs. Known offenders (all fixed-width logos or thumbnails):
    - `src/app/ui/components/ProductCarouselMiniature/ProductCarouselMiniature.tsx`
      (128px thumbnail).
    - `src/app/ui/sections/Header/Header.tsx` (185px logo, on **every** page).
    - `src/app/ui/sections/Footer/Footer.tsx` and
      `src/app/ui/sections/Footer/DashboardFooter.tsx` (185px logo).
    - `src/app/ui/components/BrandImage/BrandImage.tsx` (≤200px brand logo).
  - **Consistency pass** over the remaining `next/image` call sites so their
    `sizes` stay coherent with the new width list and don't silently request a
    width the config no longer offers.
  - **Regression guard.** A small automated test that inspects the `next/image`
    call sites (or a shared helper) and fails when a fixed-size image declares a
    `sizes` value without a `vw` unit — so the "16-width `srcset`" bug can't
    silently return. Fits the existing Vitest suite.
- **Out:**
  - **No `unoptimized`** on the catalog's main product photos — that would ship
    un-compressed images, degrade LCP/CWV and hurt SEO (explicitly rejected).
  - **Firewall / Bot Protection / WAF** (blocking SemrushBot, AhrefsBot, AI bots,
    rate-limiting `/_next/image`) — done by the owner in the Vercel dashboard, not
    code. Complementary, tracked separately.
  - **Spend Management** cap — a dashboard safety net, not code.
  - No change to business filters, SQL queries, or the GMC feed contract.
  - Re-doing the byte/dimension work already delivered in `004-image-payload` —
    this phase changes the **variant budget**, not which image is the LCP asset or
    its priority/lazy behavior.

## Functional requirements

- **FR1:** The image pipeline serves a single modern format; a given source
  photo is no longer transformed once per format.
- **FR2:** The offered widths are `deviceSizes: [640, 828, 1200, 1920]` and
  `imageSizes: [128, 256]`; no variant is generated above 1920px, and only the two
  full-bleed `100vw` banners may reach 1920 (catalog/cards cap at 1200).
- **FR3:** Only quality `75` is allowed (`qualities: [75]`).
- **FR4:** Every `next/image` whose displayed size is small and fixed requests
  only the handful of widths it needs — no call site emits the full 16-width
  `srcset` for a logo or thumbnail.
- **FR5:** `minimumCacheTTL` stays at the current 31-day value.
- **FR6:** No visible regression on the key routes (`/`, `/tires`, detail): images
  still render sharp at their displayed size on common devices, hold their space
  (no new CLS), and keep the P1.1 priority / P1.2 lazy behavior.
- **FR7:** An automated test fails if a fixed-size `next/image` call site declares
  a `sizes` value with no `vw` unit, preventing the 16-width regression.

## Acceptance criteria (testable)

- [ ] **AC1:** Given the deployed config, when a catalog product photo is
  requested via `/_next/image`, then the `Accept`-negotiated response is a single
  modern format and no second-format transformation is billed for the same
  `(url, width, quality)`.
- [ ] **AC2:** Given any `next/image` render of a fixed-size logo or thumbnail
  (Header/Footer logo, `BrandImage`, `ProductCarouselMiniature`), when its
  `srcset` is inspected in the browser, then it lists **at most 2 candidate
  widths** (the 128px thumbnail resolves to 128/256 from `imageSizes`; the fixed
  logos to the two smallest tiers that cover their 1×/2× display, e.g. 256/640) —
  **never the full width list**, and never the 3840px tier.
- [ ] **AC3:** Given the detail carousel main photo (the largest catalog image),
  when its `srcset` is inspected, then the maximum candidate width is **1200px**
  and the photo still looks sharp at its displayed size on a standard laptop/phone;
  the only images allowed to reach 1920px are the two full-bleed `100vw` banners
  (`InfoSlider`, `LocationDetail`).
- [ ] **AC4:** Given the key routes on mobile and desktop, when compared before/
  after, then there is **no LCP regression** and **no new CLS** (the P1.2 byte
  savings and CLS-safe dimensions from `004-image-payload` are preserved).
- [ ] **AC5:** Given a fresh crawl of a set of previously-uncached product pages
  after the change ships, when Vercel Observability → Image Optimization is
  checked, then transformations and cache writes per crawled page drop by a large
  factor versus the pre-change baseline (target **5–8×** fewer variants per photo).
- [ ] **AC6:** Given a fixed-size `next/image` call site is (re)written with a
  `sizes` value that has no `vw` unit, when the suite runs, then the regression
  guard test fails.
- [ ] **AC7:** `npx tsc --noEmit`, `npm run lint`, `npm test`, and `npm run build`
  are all green (Definition of Done).

## Non-functional / constraints

- **Mobile-first / CWV:** LCP < 2.5s, CLS < 0.1 must hold on the key routes; this
  change must not move them the wrong way. Performance and correctness of the
  visual (sharpness) outrank cost when they conflict, per the mission's priority
  order — but the accepted trade-off below is judged not to cross that line.
- **Accessibility:** no change to `alt`/labeling behavior.
- **Reuse before creating:** adjust existing config and existing `next/image`
  call sites; do not introduce a custom loader or a new image component.
- **Accepted trade-off:** the catalog/card images top out at **1200px** (below
  Next's default 3840px), so on a 4K/Retina display the detail photo could look
  marginally less sharp. Accepted for used-tire photos. The two full-bleed `100vw`
  banners (`InfoSlider`, `LocationDetail`) keep a **1920px** ceiling so a hero-style
  image stays crisp on wide monitors.

## Resolved decisions (from /clarify, 2026-07-14)

- **Max offered width:** `deviceSizes: [640, 828, 1200, 1920]`. 1200 covers
  catalog/cards; 1920 exists only so the full-bleed `100vw` banners stay sharp.
- **Single format:** **WebP** (`formats: ['image/webp']`). Universal support and
  half the transformations of also emitting AVIF; the ~15% byte penalty is
  immaterial on already-compressed tire photos.
- **Regression guard:** yes — a small Vitest test that fails when a fixed-size
  `next/image` `sizes` value omits `vw`. Prevents the 16-width bug from returning.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
