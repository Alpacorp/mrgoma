# Tasks — Structural CLS hardening (reserve space, no hydration jumps)

> Feature: `008-structural-cls` · Based on: [plan.md](./plan.md) · Created: 2026-07-07

Ordered, **very small, independently verifiable** tasks. The audit is done (see
plan.md); the code work is the single PromoBanner fix + documenting the audit.

## Document the audit

- [x] **T1 — Write the audit into `results.md`** · the per-surface table (hero,
  TireCard image + badges, service cards, LocationsSlider, InfoCardsSection,
  ProductCarousel + miniatures = SAFE; PromoBanner = shift-risk) with the verdict
  and reason for each, plus the before/after CLS section (PSI, filled later). ·
  files: **new** `spec/features/008-structural-cls/results.md` · check: every
  audited surface named with a verdict (satisfies AC1–AC4).

## Fix the one offender — PromoBanner

- [x] **T2 — Cookie persistence + id in PromoBanner** · swap the dismissed
  persistence from `localStorage` to a cookie: the mount effect reads
  `promo_<key>` from `document.cookie`; `onClose` writes
  `promo_<key>=dismissed;path=/;max-age=15552000`. Add
  `id={storageKey ? \`promo-${storageKey}\` : undefined}` to the `<aside>`. Keep
  the `dismissed`/`return null` and date-range logic unchanged. · files:
  `src/app/ui/sections/PromoBanner/PromoBanner.tsx` · check: `tsc` clean;
  dismissing sets the cookie; a preset cookie hides the banner after mount.
- [x] **T3 — Pre-paint hide script in the root head** · add a tiny inline
  `<script>` in `layout.tsx`'s `<head>` that reads `document.cookie`, and for each
  `promo_<key>=dismissed` injects `<style>#promo-<key>{display:none!important}</style>`
  before the body paints (wrapped in `try/catch`). · files: `src/app/layout.tsx` ·
  check: `build` compiles; as a returning dismisser, the banner is `display:none`
  from first paint (never occupies space → no shift); non-dismissers unaffected.

## Tests & Done

- [x] **T4 — PromoBanner cookie tests** · added
  `src/app/ui/sections/PromoBanner/PromoBanner.test.tsx` (4 tests: renders w/o
  cookie; close writes cookie + hides; preset cookie → not rendered; `id` matches
  the hide selector); suite now **117/117** (base 113 + 4). · unit tests: (a) clicking close writes
  `promo_<key>=dismissed` to `document.cookie`; (b) with the cookie preset, the
  banner is **not** rendered after mount (`queryByRole('region')` null); (c) with
  no cookie it **is** rendered. Reset `document.cookie` between tests. · files:
  **new** `src/app/ui/sections/PromoBanner/PromoBanner.test.tsx` · check:
  `npm test` green (suite grows).
- [ ] **T5 — Manual check** _(yours: DevTools, desktop + mobile)_ · Home on a
  throttled profile: (a) first visit — banner shows, no shift; dismiss it. (b)
  Reload as the returning dismisser — the banner is gone from first paint and the
  Services section does **not** jump up. Spot-check that hero, `/tires` grid,
  detail show no reflow while loading (images/badges/sliders hold their space). ·
  check: no visible reflow anywhere; banner dismissal persists with no jump.
- [~] **T-DoD — Definition of Done** _(automated gates green; manual + PSI are
  yours)_ · `npx tsc --noEmit` ✓ + `npm run lint` ✓ + `npm test` ✓ (**117/117**) +
  `npm run build` ✓ (home stays static `○`). Manual per **T5**. Lab CLS stays **0**
  on home/`/tires`/detail; post-deploy field CLS (**< 0.1**) recorded in
  `results.md` when available. · check: four gates green; no visible reflow on the
  audited surfaces.

## Traceability

| Task           | Acceptance criteria                                   |
| -------------- | ----------------------------------------------------- |
| T1             | AC1 (audit documented), AC2/AC3/AC4 (surfaces = SAFE) |
| T5             | AC2/AC3/AC4 (throttled: boxes hold space, no reflow)  |
| T2, T3, T4     | AC5 (no hydration jump — PromoBanner fixed)           |
| T2, T3         | AC6 (CLS held — the only jump removed)                |
| T5             | AC5, AC6 (manual throttled no-reflow check)           |
| T4, T-DoD      | AC7 (DoD gates + tests)                               |

---

_Run `/analyze` next to check spec ↔ plan ↔ tasks consistency before implementing._
