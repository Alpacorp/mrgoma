# Tasks — High fetch priority for the LCP element

> Feature: `002-lcp-fetchpriority` · Based on: [plan.md](./plan.md) · Created: 2026-07-01

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

- [x] **T1 — Home poster preload** · in `Home.tsx`, add a high-priority preload for
  `/assets/images/banner-hero.webp` (`ReactDOM.preload(..., { as: 'image',
  fetchPriority: 'high' })` or `<link rel="preload" as="image" fetchPriority="high">`).
  · files: `src/app/(home)/container/Home/Home.tsx` · check: rendered `<head>` has
  the preload with `fetchpriority=high`; the hero video still autoplays.
- [x] **T2 — `priority` prop on ProductImageZoom** · add optional `priority?: boolean`;
  pass it to the base `Image` (replace hard-coded `priority={false}`). · files:
  `src/app/ui/components/ProductImageZoom/ProductImageZoom.tsx` · check: `tsc` clean;
  prop forwarded.
- [x] **T3 — Prioritize the first Detail image** · pass `priority={index === 0}` to
  `<ProductImageZoom>`. · files:
  `src/app/ui/sections/ProductCarousel/ProductCarousel.tsx` · check: only the first
  image renders eager + `fetchpriority=high`; thumbnails/others unchanged.
- [x] **T4 — Verify `/tires` (no code)** _(Header.tsx:54 keeps `priority`)_ · confirm the shared `Header` bg image keeps
  `priority` (`Header.tsx:54`); no change. Note the post-deploy PSI check for the
  `/tires` LCP audit. · files: none · check: `priority` present in code; verification
  noted.
- [~] **T5 — Tests** _(manual coverage — a jsdom test of `next/image` priority
  threading is brittle and low-value for a one-line `index === 0`; covered by code
  review + T6)_ · if practical, add/adjust a component test asserting the first
  Detail image is prioritized (and others aren't); otherwise note manual coverage. ·
  files: `*.test.tsx` · check: `npm test` covers the priority threading or a note
  explains why not.
- [~] **T6 — Manual check** _(yours: DevTools attribute check + visual — see below)_ · `npm run dev`: Home video autoplays + poster preloaded;
  Detail first image loads eager; 3D selector and zoom still work; no visual/layout
  change or new CLS on the 3 routes (mobile viewport). **In DevTools**, confirm the
  poster preload carries `fetchpriority=high` and the Detail first `<img>` has
  `fetchpriority=high` and no `loading=lazy`. · check: attributes present; no
  regressions observed.
- [x] **T7 — Before/after note** _(see [results.md](./results.md))_ · add a short "P1.1 change" stub to
  `001-perf-baseline/baseline.md` (or a `002` note) for the **post-deploy** PSI
  numbers you'll provide. · files: `spec/features/**` · check: note present, ready to
  fill.
- [x] **T-DoD — Definition of Done** _(tsc + lint + test 107/107 + build all green; visual DevTools + PSI verification are yours)_ · `npx tsc --noEmit` + `npm run lint` +
  `npm test` + `npm run build` green; manual check per T6; every acceptance criterion
  met (AC1 fetchpriority verification is the post-deploy PSI run). · check: all green.

## Traceability

| Task           | Acceptance criteria         |
| -------------- | --------------------------- |
| T1, T2, T3, T4 | AC1                         |
| T1, T3         | AC4 (only LCP prioritized)  |
| T5             | AC4 (regression guard)      |
| T6             | AC3 (no visual/CLS change)  |
| T7             | AC2 (before/after recorded) |
| T-DoD          | AC5 (+ final gate AC1–AC5)  |
