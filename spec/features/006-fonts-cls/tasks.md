# Tasks — Font loading without layout shift (Inter)

> Feature: `006-fonts-cls` · Based on: [plan.md](./plan.md) · Created: 2026-07-07

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Order: wire the token first (config), then make the font call explicit
and route the body through the token, then verify nothing regressed.

## Wire the shared sans token

- [x] **T1 — Declare the `sans` token in CSS `@theme`** _(corrected: Tailwind v4
  does not auto-load `tailwind.config.ts` — no `@config` — so a JS-config edit is
  dead code; the token must live in CSS)_ · in `src/app/globals.css`, after
  `@import "tailwindcss";`, add `@theme inline { --font-sans: var(--font-inter),
  ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue',
  Arial, sans-serif; }`. `inline` makes `font-sans` emit the Inter variable
  directly; Preflight applies `--font-sans` to `<html>` so the whole document
  inherits Inter. · files: `src/app/globals.css` · check: `tsc` clean; `npm run
  build` compiles; `font-sans` and document text now compute to Inter (T4/T-DoD).

## Make the font call explicit + route the body through the token

- [x] **T2 — Make the `Inter()` options explicit and expose the variable** · in
  `src/app/layout.tsx`, change `Inter({ subsets: ['latin'] })` to
  `Inter({ subsets: ['latin'], display: 'swap', preload: true,
  adjustFontFallback: true, variable: '--font-inter' })`. (These match today's
  effective defaults — behaviour unchanged, decision now explicit.) · files:
  `src/app/layout.tsx` · check: `tsc` clean; `inter.variable` is defined and
  usable in T3.
- [x] **T3 — Apply the font at the root via the token** · in
  `src/app/layout.tsx`, set `<html lang="en" className={inter.variable}>` and
  change `<body className={inter.className} suppressHydrationWarning>` to
  `<body className="font-sans" suppressHydrationWarning>` (keep every other body
  attribute/child unchanged). · files: `src/app/layout.tsx` · check: `tsc` clean;
  build compiles; in the browser, base text and `font-sans`-utility elements both
  compute to Inter (verified in T4).

## Verify

- [ ] **T4 — Manual computed-font + no-regression check** _(yours: DevTools +
  visual)_ · On `/`, `/tires` and a detail page: DevTools **Computed →
  font-family** on sampled text incl. one element that uses the `font-sans`
  utility = **Inter** (with the intended fallback stack); the checkout code/SKU
  `font-mono` snippets stay **monospace**. Throttle to Slow 3G + disable cache,
  reload → text is **visible the whole time** (no blank/FOIT) and does **not jump**
  when Inter swaps in. Confirm `green-primary` colors and the cart `slide-in-right`
  animation still work (JS config still applied). · check: single typeface
  everywhere (except intended mono), no FOIT, no reflow, no visual regression.

## Tests & Done

- [x] **T5 — Config guard test** · added `src/font-token.test.ts` (2 tests:
  `globals.css` `@theme` declares `--font-sans: var(--font-inter)…` + a
  fallback-stack assertion); suite now **115/115** (base 113 on `main` + 2). · a pure unit test
  asserting the Tailwind config's `theme.extend.fontFamily.sans[0] ===
  'var(--font-inter)'`, as a cheap regression guard for the token wiring. Skip if
  it can't stay simple/green (no runtime font logic to unit-test; jsdom mocks
  `next/font`). · files: **new** `tailwind.config.test.ts` (or similar) · check:
  `npm test` green, count stays at 116+.
- [~] **T-DoD — Definition of Done** _(automated gates green; manual + PSI are
  yours)_ · `npx tsc --noEmit` ✓ + `npm run lint` ✓ + `npm test` ✓ (**115/115**) +
  `npm run build` ✓ all green.
  Manual check per **T4**. AC1/AC3 authoritative evidence = **post-deploy PSI**:
  capture CLS before/after on `/`, `/tires`, detail (CLS < 0.1, no font-attributed
  shift) and record in `results.md`. · files: **new**
  `spec/features/006-fonts-cls/results.md` · check: all four gates green; results
  recorded once you provide the PSI numbers.

## Traceability

| Task            | Acceptance criteria                                  |
| --------------- | ---------------------------------------------------- |
| T1, T3          | AC4 (single typeface — `font-sans` → Inter)          |
| T2              | AC5 (explicit swap/preload/fallback/subset + variable) |
| T2, T3          | AC2 (no FOIT — `display: swap`)                       |
| T1, T2, T3      | AC3 (no FOUT jump — metric-matched fallback)         |
| T2, T-DoD       | AC1 (CLS < 0.1, no font-shift — PSI)                 |
| T4              | AC2, AC3, AC4 (manual computed-font + no regression) |
| T5, T-DoD       | AC5, AC6 (guard test + DoD gates green)              |

---

_Run `/analyze` next to check spec ↔ plan ↔ tasks consistency before implementing._
