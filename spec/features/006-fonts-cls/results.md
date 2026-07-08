# Results — Font loading without layout shift (Inter)

> Feature: `006-fonts-cls` (P1.3) · Status: awaiting post-deploy PSI

## What changed

- `next/font` (Inter) options made **explicit** in `src/app/layout.tsx`:
  `display: 'swap'`, `preload: true`, `adjustFontFallback: true`,
  `subsets: ['latin']`, `variable: '--font-inter'`.
- Inter wired as the Tailwind **`sans` token** via CSS `@theme` in
  `src/app/globals.css` (`--font-sans: var(--font-inter), …system`); `<html>`
  carries `inter.variable`, `<body>` uses `font-sans`. → `font-sans` utilities and
  the document default now resolve to Inter, not the system stack.
- No typeface/weight/design change; `font-mono` (checkout codes) untouched.

> **Discovery during implementation:** this repo is Tailwind **v4**, which (unlike
> v3) does **not** auto-load `tailwind.config.ts` — there is no `@config` directive
> in the CSS, so that file is currently **ignored** by Tailwind. A first attempt to
> add the `sans` token there had no effect (verified in DevTools: `font-sans` still
> computed to the default `ui-sans-serif, system-ui, sans-serif` = Segoe UI). The
> token was moved to a CSS `@theme` block, the v4-native mechanism. **Side note /
> follow-up (out of P1.3 scope):** the config's other custom tokens —
> `green-primary`, the `xs` breakpoint, the `slide-in-right` animation — are also
> dormant for the same reason and would need `@config` or migration to `@theme` to
> take effect.

## Automated gates (local)

| Gate | Result |
| ---- | ------ |
| `npx tsc --noEmit` | ✅ pass |
| `npm run lint` | ✅ pass |
| `npm test` | ✅ 115/115 (base 113 + 2 config-guard tests) |
| `npm run build` | ✅ compiles |

## Manual check (yours — T4)

- [ ] Computed `font-family` = Inter on sampled text incl. a `font-sans` element,
      on `/`, `/tires`, detail.
- [ ] Checkout code/SKU `font-mono` snippets stay monospace.
- [ ] Slow 3G + no cache: text visible the whole load (no FOIT), no jump on swap.
- [ ] `green-primary` colors + cart `slide-in-right` animation still work.

## PSI before / after — CLS (post-deploy, authoritative)

> Capture on the live URLs (PageSpeed Insights, mobile). Target: **CLS < 0.1**
> with no layout-shift entry attributed to a font swap.

| Route     | CLS before | CLS after | Notes |
| --------- | ---------- | --------- | ----- |
| `/`       | _tbd_      | _tbd_     |       |
| `/tires`  | _tbd_      | _tbd_     |       |
| detail    | _tbd_      | _tbd_     |       |

_Filled once you provide the PageSpeed numbers._
