# Tasks — Image payload & delivery optimization

> Feature: `004-image-payload` · Based on: [plan.md](./plan.md) · Created: 2026-07-06

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Order: global config first, then each named offender (independent), then
tests + DoD.

## Global

- [x] **T1 — Enable AVIF** · add `images.formats: ['image/avif', 'image/webp']` to
  `next.config.mjs` (keep existing `qualities`/`minimumCacheTTL`/`remotePatterns`). ·
  files: `next.config.mjs` · check: `npm run build` clean; a `next/image` request in
  DevTools returns `content-type: image/avif` on a supporting browser.

## Logo (right-size + below-fold lazy)

- [x] **T2 — Downscale the logo asset** · re-encoded from **11266×1951 (106 KB)** to
  **750px (12.9 KB)** with `sharp`. _The original file was locked by a watcher/OneDrive
  and couldn't be overwritten, so the downscaled asset is a **new file**
  `logo-mrgoma-light-sm.webp`; the barrel `Logo/index.tsx` was repointed to it and the
  orphaned 106 KB original removed (`git rm`)._ · files:
  `public/assets/images/Logo/logo-mrgoma-light-sm.webp`, `Logo/index.tsx` · check:
  ~88% smaller; logo crisp at header/footer sizes.
- [x] **T3 — Explicit dims + `sizes` on the header logo** · add `width`/`height` +
  `sizes` to the `<Image>` (~L64–71); **keep `priority`** (above the fold). · files:
  `src/app/ui/sections/Header/Header.tsx` · check: `tsc` clean; DevTools shows a
  small logo source, no oversized `srcset`; logo unchanged visually.
- [x] **T4 — Footer logos: dims + `sizes` + lazy** · add `width`/`height` + `sizes`
  and **remove `priority`** (below the fold) on both footer logos (~Footer L82–89,
  DashboardFooter L23–28). · files: `src/app/ui/sections/Footer/Footer.tsx`,
  `src/app/ui/sections/Footer/DashboardFooter.tsx` · check: `tsc` clean; footer logos
  `loading=lazy` in DevTools; header logo still eager.

## Footer background (PNG → avif/webp)

- [x] **T5 — Generate footer bg in modern formats** · from
  `background-footer.png` produce `background-footer.avif` + `background-footer.webp`
  (`sharp`); commit them. · files: **new**
  `public/assets/images/background-footer.{avif,webp}` · check: both files exist and
  are much smaller than the 133 KB PNG.
- [x] **T6 — Serve footer bg via `image-set()`** · replace the inline
  `backgroundImage: url('...png')` with `image-set(url('.avif') type('image/avif'),
  url('.webp') type('image/webp'))` on both footers. · files:
  `src/app/ui/sections/Footer/Footer.tsx` (~L71–75),
  `src/app/ui/sections/Footer/DashboardFooter.tsx` (~L13–17) · check: DevTools Network
  shows the footer bg as avif/webp (not the PNG); footer looks unchanged.

## Unsplash promo (bytes)

- [x] **T7 — Shrink the promo source** · change both unsplash URLs `q=100&w=2400`
  → `q=75&w=1600` (`home` + `searchResults`). · files:
  `src/app/ui/sections/PromoBanner/config/promoBanner.ts` (L25, L39) · check: DevTools
  shows the promo request materially smaller (was ~1.28 MB); banner still looks crisp
  under the gradient.
- [x] **T8 — Preconnect to unsplash** · add `preconnect` to
  `https://images.unsplash.com` (root layout `<head>` or `ReactDOM.preconnect`). ·
  files: root `layout.tsx` (or where the promo mounts) · check: `<link
  rel="preconnect">` present; promo starts loading sooner.

## Detail thumbnails

- [x] **T9 — Thumbnails lazy + `sizes`** · in `ProductCarouselMiniature`, remove the
  hard-coded `priority`, add `sizes` (~`"128px"`); keep the error fallback. · files:
  `src/app/ui/components/ProductCarouselMiniature/ProductCarouselMiniature.tsx`
  (~L28–39) · check: thumbnails `loading=lazy`, fetch a small source; gallery + main
  image + zoom still work.

## Tests & Done

- [x] **T10 — Tests** · the changes are config/markup (no new logic); adjust any
  snapshot/DOM test touching the logo/thumbnail/footer if it breaks, and add a small
  assertion where practical (e.g. thumbnail no longer `priority`). Note manual
  coverage otherwise. · files: `*.test.tsx` · check: `npm test` green (was 113/113).
- [ ] **T11 — Manual check** _(yours: DevTools + visual)_ · on `/`, `/tires`, detail
  (mobile viewport): logo/footer/thumbnail sources are small + modern format; footer
  bg is avif/webp; promo is much smaller; below-fold imgs `loading=lazy`; header logo
  + first cards + detail main image still eager/`priority`; **no CLS**; hero video, 3D
  animation, zoom, carousel and fallback image all still work. · check: attributes +
  formats correct, no regressions.
- [~] **T-DoD — Definition of Done** _(automated gates green; manual + PSI are yours)_
  · `npx tsc --noEmit` ✓ + `npm run lint` ✓ + `npm test` ✓ (113/113) + `npm run build`
  ✓. Manual check per **T11** and the AC1/AC5 authoritative **post-deploy PSI** run
  (image-delivery audits cleared for our assets; CLS < 0.1) are yours to record in
  `results.md`.

  _Note: T3/T4 use static-import `<Image>` (the logo carries its intrinsic
  width/height from the import), so only `sizes` was added — no explicit `width`/
  `height` needed; footer/dashboard logos had `priority` removed (below the fold)._

## Traceability

| Task              | Acceptance criteria                                   |
| ----------------- | ----------------------------------------------------- |
| T1, T2, T3, T7, T9 | AC1 (image-delivery audits cleared)                  |
| T5, T6            | AC2 (footer PNG replaced by avif/webp)                |
| T3, T4, T9        | AC3 (responsive `sizes`, smaller source on mobile)    |
| T4, T9            | AC4 (below-fold lazy; LCP/above-fold priority intact) |
| T2, T3, T5, T6, T11 | AC5 (CLS < 0.1; no brand/functional regression)      |
| T10, T-DoD        | AC6 (DoD + tests)                                     |
| T8                | Supports AC1 (promo loads sooner/smaller)             |
