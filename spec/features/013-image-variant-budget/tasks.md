# Tasks — Image variant budget (cut Image Optimization cost)

> Feature: `013-image-variant-budget` · Based on: [plan.md](./plan.md) · Created: 2026-07-14

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

- [x] **T1** — Narrow the global image config: in `images`, set
  `formats: ['image/webp']`, `qualities: [75]`, add
  `deviceSizes: [640, 828, 1200, 1920]` and `imageSizes: [128, 256]`; leave
  `minimumCacheTTL` and `remotePatterns` untouched. · files: `next.config.mjs` ·
  check: `npm run build` compiles; the config diff shows exactly these four keys
  changed/added and TTL/remotePatterns unchanged.

- [x] **T2** — Fix the miniature thumbnail: drop the non-`vw` `sizes="128px"` and
  set `width={128} height={128}` (keep `object-cover`). · files:
  `src/app/ui/components/ProductCarouselMiniature/ProductCarouselMiniature.tsx` ·
  check: rendered `<img>` `srcset` lists ≤2 candidate widths (128/256), never 16.

- [x] **T3** — Fix the header logo: drop `sizes="185px"` and set explicit display
  `width`/`height` matching the rendered logo box (preserve aspect ratio; keep the
  `h-6`/`h-8 w-auto` classes and `priority`). · files:
  `src/app/ui/sections/Header/Header.tsx` · check: logo `srcset` ≤2 widths; logo
  renders undistorted and holds its space (no CLS) on `/`.

- [x] **T4** — Fix the footer logo the same way (drop `sizes="185px"`, explicit
  `width`/`height`). · files: `src/app/ui/sections/Footer/Footer.tsx` · check:
  footer logo `srcset` ≤2 widths; renders undistorted.

- [x] **T5** — Fix the dashboard footer logo the same way. · files:
  `src/app/ui/sections/Footer/DashboardFooter.tsx` · check: logo `srcset` ≤2
  widths; renders undistorted on a dashboard route.

- [x] **T6** — Fix `BrandImage`: drop the no-`vw` `sizes="(max-width: 768px)
  160px, 200px"` and set `width`/`height` to the real display box (≤200px wide,
  keep `object-contain` and the `onError` fallback). · files:
  `src/app/ui/components/BrandImage/BrandImage.tsx` · check: brand logo `srcset`
  ≤2 widths; fallback on error still works.

- [x] **T7** — Add the regression-guard test: scan `src/**/*.tsx`, collect `sizes`
  literals on `next/image` `<Image>` elements, assert each contains a `vw` unit;
  exclude the favicon `<link rel="icon" sizes="any">` in `layout.tsx`. Unit-check
  the matcher against one known offender string and one known-good responsive
  string. · files: `src/app/utils/imageSizes.guard.test.ts` (new) · check:
  `npm test` — the guard passes now (all fixed) and fails if a non-`vw` fixed
  `sizes` is reintroduced.

- [x] **T8** — Adjust any existing test broken by the width/height/`sizes` prop
  changes (e.g. snapshot or prop assertions on the touched components). · files:
  as surfaced by `npm test` · check: `npm test` green. _No existing test broke —
  the touched components' tests mock `next/image` and don't assert on `sizes`/
  `width`/`height`; full suite 157/157 green._

- [ ] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
  `npm test` + `npm run build` green; then **manual verification**:
  - On `/`, `/tires`, and a detail page, inspect `srcset` in DevTools — logos/
    thumbnails ≤2 widths, catalog/detail photos cap at 1200, full-bleed banners
    (`InfoSlider`, `LocationDetail`) may reach 1920, and `/_next/image` responses
    are `image/webp`.
  - Lighthouse/PSI (or `npm run perf:budget` after build) shows **no LCP
    regression and no new CLS** on the three key routes.
  · check: all four gates green + the manual checklist observed.

- [ ] **T-verify (post-deploy, out-of-band)** — After the change ships and a fresh
  crawl of previously-uncached product pages occurs, check Vercel **Observability →
  Image Optimization**: transformations + cache writes per crawled page dropped by
  a large factor vs. the pre-change baseline (target 5–8×). · check: Observability
  metrics confirm the reduction. _(Not a code gate; recorded for AC5.)_

## Traceability

| Task            | Acceptance criteria |
| --------------- | ------------------- |
| T1              | AC1, AC3, AC7       |
| T2              | AC2                 |
| T3              | AC2, AC4            |
| T4              | AC2                 |
| T5              | AC2                 |
| T6              | AC2                 |
| T7              | AC6                 |
| T8              | AC7                 |
| T-DoD           | AC3, AC4, AC7       |
| T-verify        | AC5                 |
