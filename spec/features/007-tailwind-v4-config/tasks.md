# Tasks — Reconcile brand green & activate dormant Tailwind v4 tokens

> Feature: `007-tailwind-v4-config` · Based on: [plan.md](./plan.md) · Created: 2026-07-07

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Order: activate the two tokens in CSS, then reconcile the green
(usages → config), then guard + verify.

## Activate slide-in-right + xs (CSS @theme)

- [x] **T1 — Migrate `slide-in-right` + `xs` to `@theme`** · in
  `src/app/globals.css`, next to the existing `mg-spin`/`mg-attention` keyframes,
  add `@keyframes slide-in-right { 0% { transform: translateX(1000px); opacity: 0 }
  100% { transform: translateX(0); opacity: 1 } }` and a `@theme` block with
  `--breakpoint-xs: 350px;` and `--animate-slide-in-right: slide-in-right 2.5s
  ease-out;`. (Place it low in the file, away from the top — avoids colliding with
  P1.3's `@theme inline` at merge time.) · files: `src/app/globals.css` · check:
  `npm run build` compiles; `animate-slide-in-right` and `xs:` utilities now exist.

## Reconcile the brand green (retire green-primary)

- [x] **T2 — Replace `green-primary` → `green-600` in all 7 files** · every
  occurrence (all base accents, no hover): `src/app/ui/sections/TopFilters/…`,
  `…/ProductCarousel/…`, `…/FiltersMobile/…`, `…/FilterMobileContent/…`,
  `…/FilterBody/…`, `src/app/ui/components/HomeMoreFilters/…`,
  `…/ProductImageZoom/…`. · files: the 7 `.tsx` above · check: `grep -r
  green-primary src/` returns **nothing**; `tsc` clean.
- [x] **T3 — Remove the `green-primary` token + migrated animation from the config**
  · in `tailwind.config.ts`, delete the `colors: { 'green-primary' }` entry (and
  the now-empty `colors` object) and the `slide-in-right` `keyframes`/`animation`
  entries (now in `@theme`). Leave `screens`, `content`, `backgroundImage`,
  `plugins` untouched (out of scope). · files: `tailwind.config.ts` · check: `tsc`
  clean; `npm run build` compiles; no `green-primary` anywhere in the repo `src`.

## Guard + verify

- [x] **T4 — Token/usage guard test** · added `src/tailwind-tokens.test.ts`
  (3 tests: no `green-primary` in source [walks tree, excludes `*.test.*`] +
  `--breakpoint-xs`/`--animate-slide-in-right`/`@keyframes` present); suite now
  **116/116** (base 113 on `main` + 3). · new test asserting (a) **no**
  `green-primary` under `src/**/*.{ts,tsx}` (walks the tree — v4 drops unknown
  color utilities silently, so this is the real safety net), and (b)
  `globals.css` declares `--breakpoint-xs`, `--animate-slide-in-right` and
  `@keyframes slide-in-right`. **Exclude `*.test.*` from the (a) scan** — this test
  file contains the literal `green-primary` in its own assertions and would
  otherwise self-match. · files: **new** `src/tailwind-tokens.test.ts` · check:
  `npm test` green (suite grows by 1 file).
- [ ] **T5 — Manual visual check** _(yours: DevTools + visual, desktop + mobile)_ ·
  On `/tires` filters, mobile filters, product carousel, image zoom, home "more
  filters": the former `green-primary` controls now show the brand green (computed
  **#16a34a**), matching a sibling `green-600`. Open the cart → it **slides in**;
  enable *prefers-reduced-motion* → no slide/instant. Spot-check home hero, detail,
  checkout → unchanged. · check: brand green + cart slide present, nothing else
  shifts, focus rings still visible.

## Tests & Done

- [~] **T-DoD — Definition of Done** _(automated gates green; manual is yours)_ ·
  `npx tsc --noEmit` ✓ + `npm run lint` ✓ + `npm test` ✓ (**116/116**) +
  `npm run build` ✓ all green. Manual check per **T5**. Record before/after in
  `spec/features/007-tailwind-v4-config/results.md`. AC5 (font not regressed) is
  confirmed **post-merge** once 006 + 007 are both on `main`. · files: **new**
  `results.md` · check: four gates green; `grep green-primary src/` empty.

## Traceability

| Task        | Acceptance criteria                                    |
| ----------- | ------------------------------------------------------ |
| T2, T3, T4  | AC1 (green reconciled — no `green-primary`, = #16a34a) |
| T1, T4, T5  | AC2 (cart slides in, honours reduced-motion)           |
| T1, T4, T5  | AC3 (`xs` breakpoint available)                        |
| T5          | AC4 (no unintended change elsewhere)                   |
| T-DoD       | AC5 (P1.3 font not regressed — post-merge)             |
| T4, T-DoD   | AC6 (DoD gates + manual visual check)                  |

---

_Run `/analyze` next to check spec ↔ plan ↔ tasks consistency before implementing._
