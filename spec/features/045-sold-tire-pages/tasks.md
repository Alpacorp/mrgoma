# Tasks — Sold and removed tire pages

> Feature: `045-sold-tire-pages` · Based on: [plan.md](./plan.md) · Created: 2026-11-10

- [x] **T1** — `isSoldStatus`, `isTrashed`, `isRemoved` (trashed and not sold, D2) · files: `src/app/utils/tireAvailability.ts` (+ test) · check: sold variants, trash as `true`/`1`/`'true'`, falsy values; a sold and trashed record is not removed.
- [x] **T2** — Page: removed (trashed, not sold) → not found; JSON-LD availability · files: `src/app/(shop)/tires/[slug]/page.tsx` · check: manual on #458561 (sold → `SoldOut`) and #512564 (trashed, not sold → not found); tsc.
- [x] **T3** — `SoldTireAlternative` server component · files: `src/app/ui/sections/TireSet/SoldTireAlternative.tsx` (+ test) · check: link to closest match with count; nothing when none or on error.
- [x] **T4** — `soldSlot` in `TireInformation`, passed by `DetailView` · files: `tires.d.ts`, `TireInformation.tsx` (+ test), `DetailView.tsx`, guard test · check: shown only when sold.
- [x] **T5** — Hide the price of a sold tire (D3): page, title, description, JSON-LD · files: `TireInformation.tsx` (+ test), `src/app/(shop)/tires/[slug]/page.tsx` · check: test for no price when sold; manual on #458561 and #418119.
- [x] **T-DoD** — tsc + lint + test + build + perf budget; manual check of a sold tire, a trashed tire and a tire for sale · check: `results.md`.

| Task | AC |
| ---- | -- |
| T1 | AC1, AC3 |
| T2 | AC1, AC2, AC3 |
| T3 | AC4 |
| T4 | AC4, AC5 |
| T5 | AC5, AC6 |
| T-DoD | all |
