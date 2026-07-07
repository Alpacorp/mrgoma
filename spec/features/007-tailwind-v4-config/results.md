# Results — Reconcile brand green & activate dormant Tailwind v4 tokens

> Feature: `007-tailwind-v4-config` · Status: awaiting manual visual check

## What changed

- **Brand green reconciled:** all **27** `green-primary` usages (7 files) replaced
  with the canonical `green-600`; the `green-primary` token removed from
  `tailwind.config.ts`. One brand green across the app; no `green-primary` left in
  `src`.
- **`slide-in-right` activated:** keyframes + `--animate-slide-in-right` moved into
  `src/app/globals.css` `@theme` (Tailwind v4 ignores the JS config). The cart
  drawer now slides in; reduced motion is tamed by the existing blanket rule.
- **`xs` (350px) activated:** `--breakpoint-xs` added to `@theme` — available to
  `xs:` utilities (none used yet → no visual change).
- Config's plugins (`forms`, `typography`, `aspect-ratio`) and `backgroundImage`
  left untouched — still dormant, tracked as a separate follow-up.

## Automated gates (local)

| Gate | Result |
| ---- | ------ |
| `npx tsc --noEmit` | ✅ pass |
| `npm run lint` | ✅ pass |
| `npm test` | ✅ 116/116 (base 113 + 3 guard tests) |
| `npm run build` | ✅ compiles |
| `grep -rn green-primary src/` | ✅ empty |

## Manual check (yours — T5, desktop + mobile)

- [ ] `/tires` filters, mobile filters, product carousel, image zoom, home "more
      filters": former `green-primary` controls now show the brand green — computed
      color **matches a sibling `green-600`** element (v4 renders it in OKLCH).
- [ ] Open the cart drawer → it **slides in**; enable *prefers-reduced-motion* →
      no slide / instant.
- [ ] Focus rings on filter checkboxes are visible (brand green).
- [ ] Spot-check home hero, detail, checkout → unchanged.

## AC5 — font not regressed (post-merge)

- [ ] After 006 + 007 are both on `main`: body text and a `font-sans` element
      still compute to **Inter** (this slice did not touch the font token; the two
      `@theme` blocks in `globals.css` merge cleanly).
