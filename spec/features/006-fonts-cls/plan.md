# Plan — Font loading without layout shift (Inter)

> Feature: `006-fonts-cls` · Based on: [spec.md](./spec.md) · Created: 2026-07-07

## Technical approach

The site already loads **Inter** through `next/font/google` in the root layout,
but the loading behaviour is **implicit** (relying on defaults) and the font is
applied only via `<body className={inter.className}>`. Two consequences:

1. Correctness rests on undocumented defaults (`display`, `preload`,
   `adjustFontFallback`) — not reviewable, easy to regress (AC5 gap).
2. Tailwind's `sans` font token still resolves to the **default system stack**,
   so any element using the `font-sans` utility overrides the inherited Inter and
   renders in the system font (AC4 gap / mixed-font flash).

The fix is small and reuse-first — **no new font pipeline, no self-hosted files,
no typeface change**:

- **Make the `next/font` call explicit** in `layout.tsx`: declare `display:
  'swap'`, `preload: true`, `adjustFontFallback: true` and `subsets: ['latin']`
  (these match today's effective defaults — behaviour is unchanged, the decision
  becomes explicit → AC5), and add `variable: '--font-inter'` so Inter is exposed
  as a CSS variable.
- **Metric-matched fallback (AC2/AC3) comes for free** from `adjustFontFallback:
  true`: `next/font` generates a fallback `@font-face` ("Inter Fallback") with
  computed `size-adjust` / `ascent-override` / `descent-override` /
  `line-gap-override` tuned to Inter's metrics, so the swap does not reflow. This
  is the `@font-face`-descriptor strategy the modern-web-guidance
  `visually-stable-font-fallbacks` guide describes as the manual alternative to
  the CSS `font-size-adjust` property — and it is **universally supported** (works
  below the property's Baseline-2024 cutoff, incl. older Safari), so we prefer it
  and do **not** add a manual `font-size-adjust`.
- **Wire Inter as the shared `sans` token (AC4):** add `fontFamily.sans =
  ['var(--font-inter)', …system fallbacks]` to the existing
  `tailwind.config.ts` `theme.extend`. Then `font-sans` resolves to Inter, and
  making `<body>` use `font-sans` routes **all** inherited text through the one
  token. `var(--font-inter)` already expands to `'Inter', 'Inter Fallback'`, so
  the metric-matched fallback is in the stack too.
- **`font-mono` untouched:** the checkout code/SKU snippets keep Tailwind's
  default monospace stack (AC4 exception) — no change.

### Why the JS config (not a CSS `@theme` block)

This is Tailwind **v4** (`@import "tailwindcss"` + `@tailwindcss/postcss`), but the
repo keeps a legacy v3-style `tailwind.config.ts`. Its custom tokens
(`green-primary`, the `xs` screen, the `slide-in-right` keyframe/animation) are
used across shipped, visibly-working components — so the JS config **is** being
loaded (Tailwind v4 auto-detects a root config). Extending `theme.extend` there is
the established pattern in this repo (reuse before creating); adding a competing
CSS `@theme` block would fragment the token source. We verify the config still
applies (`bg-green-primary` etc.) as part of the DoD.

## Reuse first

- **Existing `next/font/google` Inter import** in `src/app/layout.tsx` — hardened,
  not replaced.
- **Existing `tailwind.config.ts` `theme.extend`** — the same place `green-primary`
  and the custom animation live; we add `fontFamily.sans` alongside them.
- **Existing `next/font` automatic fallback** (`adjustFontFallback`) — no manual
  `@font-face`, `size-adjust` math, or self-hosted `.woff2`.
- **No new dependencies, no new files** in `src/` (only a spec `results.md` at the
  end, and an optional guard test).

## Files to add / change

- `src/app/layout.tsx` — extend the `Inter({...})` call with explicit `display:
  'swap'`, `preload: true`, `adjustFontFallback: true`, `variable: '--font-inter'`
  (keep `subsets: ['latin']`). Move the font onto the root: `<html lang="en"
  className={inter.variable}>` and set `<body className="font-sans ...">` (drop
  `inter.className` in favour of the token; keep `suppressHydrationWarning`).
- `tailwind.config.ts` — add `fontFamily.sans: ['var(--font-inter)',
  'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto',
  'Helvetica Neue', 'Arial', 'sans-serif']` under `theme.extend`. Leave `mono`
  and everything else as-is.
- `spec/features/006-fonts-cls/results.md` — **new**, before/after CLS + a
  computed-font note, filled once the post-deploy PSI numbers arrive.
- _(optional)_ `tailwind.config.test.ts` (or a small unit test) — assert
  `theme.extend.fontFamily.sans[0] === 'var(--font-inter)'` as a cheap regression
  guard for AC4/AC5. Included only if it stays trivial and green.

## Data & flow

No APIs, params, DB reads/writes, or route changes. This is a build-time / CSS
concern only:

1. `next/font` fetches + self-hosts Inter at build, injects the `@font-face` for
   Inter **and** the size-adjusted "Inter Fallback", and defines
   `--font-inter: 'Inter', 'Inter Fallback'`. With `preload: true`, Next emits a
   `<link rel="preload">` for the Inter `.woff2` on routes that use it.
2. `<html class="--font-inter variable">` scopes the variable document-wide;
   `<body class="font-sans">` sets `font-family: var(--font-inter), …` so every
   descendant inherits Inter, including `font-sans`-utility elements.
3. On load: fallback (metric-matched) paints immediately (`display: swap` → no
   FOIT); Inter swaps in with no reflow (metrics match → no CLS).

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (CLS < 0.1, no font-shift) | `adjustFontFallback` metric-matched fallback + preload; no late-swapping remote font | **Post-deploy PageSpeed** on `/`, `/tires`, detail — CLS < 0.1, no font-attributed shift; recorded in `results.md` |
| AC2 (no FOIT) | `display: 'swap'` declared explicitly → fallback visible during download | DevTools: throttle to Slow 3G + disable cache, reload — text visible the whole time (also visible in a PSI filmstrip) |
| AC3 (no FOUT jump) | Fallback is size-adjusted to Inter → swap doesn't move text | Visual check on swap + the CLS number from AC1 (no perceptible reflow) |
| AC4 (single typeface) | `fontFamily.sans` → `var(--font-inter)`; `<body>` uses `font-sans`; all text inherits Inter | DevTools **Computed → font-family** on sampled elements incl. a `font-sans` one on each route = Inter; checkout `font-mono` codes stay monospace (intended). Optional config guard test |
| AC5 (explicit config) | `display`/`preload`/`adjustFontFallback`/`subsets` + `variable` all spelled out; token in config | Code review of the diff; optional test asserts the `sans` token points at the Inter variable |
| AC6 (no regression / DoD) | Same typeface, minimal diff | `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` green; manual desktop + mobile check the site looks identical (incl. `green-primary` and the slide-in animation still work) |

## Tradeoffs / alternatives

- **`adjustFontFallback` (chosen) vs CSS `font-size-adjust`.** The CSS property is
  cleaner but only Baseline since 2024-07 (no older Safari/Firefox); `next/font`'s
  generated `@font-face` descriptors work everywhere and need no per-element
  opt-in. Chosen for universal, zero-CLS coverage.
- **JS-config token (chosen) vs CSS `@theme` block.** `@theme` is the v4-idiomatic
  path, but this repo already centralizes custom tokens in `tailwind.config.ts`;
  adding a second source would fragment the design tokens. Chosen for consistency
  and "reuse before creating".
- **`font-sans` on `<body>` (chosen) vs keeping `inter.className`.** Keeping the
  className would fix inherited text but **not** elements using the `font-sans`
  utility (the AC4 gap). Routing through the token fixes both with one source of
  truth.
- **Self-hosting / adding weights — rejected.** `next/font` already self-hosts and
  we change no weights; out of scope and would add risk with no benefit.

## Risks

- **JS config not applied → `font-sans` wouldn't resolve to Inter.** Mitigation:
  the config is already proven live (`green-primary`, `slide-in-right` render);
  the DoD manual check re-confirms both those and the new `font-sans`.
- **A component hard-codes a different `font-family` inline.** Mitigation: grep
  confirmed only `font-mono` (intended) and the OG image (out of scope) set a
  non-Inter family; nothing else overrides.
- **Dropping `inter.className` from `<body>`.** Mitigation: `font-sans` now equals
  the same Inter stack, so base text is unchanged; verified via computed-style
  check on load.
- **Testing next/font in vitest is mocked/awkward.** Mitigation: don't unit-test
  the font itself; rely on build + the manual computed-style check, with an
  optional pure-config assertion as the only automated guard.

## Out of scope

- Non-font CLS sources (badges, carousels, media reservations) → **P1.4**.
- Any typeface/weight/spacing redesign; adding a second family; non-Latin subsets.
- The OG social image's `system-ui` (edge-rendered, not a page).

---

_The concrete steps live in [tasks.md](./tasks.md)._
