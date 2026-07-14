# Plan — Image variant budget (cut Image Optimization cost)

> Feature: `013-image-variant-budget` · Based on: [spec.md](./spec.md) · Created: 2026-07-14

## Technical approach

Vercel bills Image Optimization per **unique cache key**
(`projectId + source-url + width + quality + Accept`). We shrink the number of
distinct keys the site can generate, without changing which image is shown or how
sharp it looks at its displayed size. Two levers:

1. **Global config (`next.config.mjs → images`)** — the multiplier that applies to
   every optimized image:
   - `formats: ['image/webp']` (was `['image/avif','image/webp']`) → removes the
     ×2 per-photo format multiplier.
   - `qualities: [75]` (was `[50, 75]`) → drops the dead `50` tier (no component
     passes a `quality` prop).
   - `deviceSizes: [640, 828, 1200, 1920]` and `imageSizes: [128, 256]` (currently
     unset → Next's defaults, which reach 3840px and yield up to ~16 widths). This
     caps catalog/card variants at 1200 and keeps a single 1920 tier only for the
     two full-bleed `100vw` banners.
   - `minimumCacheTTL: 2678400` — **unchanged** (already the 31-day optimum).
   - `remotePatterns` — **unchanged**.

2. **Per-call-site `sizes` fix** — the "no-`vw`" bug. When a `next/image` `sizes`
   value contains **no `vw` unit**, Next can't map it to `deviceSizes` and falls
   back to emitting the full width list (~16 widths). Every offending call site is
   a small, fixed-size logo or thumbnail; the fix is to express the display size
   via explicit `width`/`height` and **drop the non-`vw` `sizes`**, so Next emits a
   2-entry (1×/2×) `srcset` from the small end of the width list instead.

3. **Regression guard** — a Vitest source-scan test that fails if any `next/image`
   `sizes` literal lacks a `vw` unit, so this class of bug can't silently return.

No custom loader, no new image component, no route or query change. This is a
config + prop-hygiene slice.

## Reuse first

- **`next.config.mjs`** already holds the `images` block (formats, TTL,
  remotePatterns) — we extend it, not replace it.
- The existing `next/image` call sites and their `sizes` conventions from
  [`004-image-payload`](../004-image-payload/spec.md) are the baseline; the
  responsive (`vw`) ones are already correct and stay untouched.
- **Vitest + Testing Library** suite and the existing mock-`next/image` pattern
  (see `ProductImage.test.tsx`) are reused for the guard test — no new tooling.
- `minimumCacheTTL` and `remotePatterns` are reused as-is.

## Files to add / change

**Config**
- `next.config.mjs` — set `formats`, `qualities`, `deviceSizes`, `imageSizes` as
  above; leave `minimumCacheTTL` and `remotePatterns` intact.

**Fixed-size call sites (drop non-`vw` `sizes`, set explicit display `width`/`height`)**
- `src/app/ui/sections/Header/Header.tsx` (`sizes="185px"`, logo on every page).
- `src/app/ui/sections/Footer/Footer.tsx` (`sizes="185px"`).
- `src/app/ui/sections/Footer/DashboardFooter.tsx` (`sizes="185px"`).
- `src/app/ui/components/BrandImage/BrandImage.tsx`
  (`sizes="(max-width: 768px) 160px, 200px"` — has px, **no `vw`**; currently
  `width={400} height={300}` → set to the real display box ≤200px wide, drop
  `sizes`).
- `src/app/ui/components/ProductCarouselMiniature/ProductCarouselMiniature.tsx`
  (`sizes="128px"`, `width/height=500` → `width={128} height={128}`, drop `sizes`).

**Guard test**
- `src/app/utils/imageSizes.guard.test.ts` (new) — scans `src/**/*.tsx`, collects
  `sizes` literals on `next/image` `<Image>` elements, asserts each contains a
  `vw` unit; excludes the HTML `<link rel="icon" sizes="any">` in `layout.tsx`.

**Left unchanged (already carry `vw` — verified):** `ProductImage` (`/tires`
grid), `ServiceCard`, `LocationCard`, `Home` service cards, `InfoSlider`,
`LocationDetail`, `ServiceDetail`, and `ProductCarousel`/`ProductImageZoom` (the
detail main photo, `…, 600px` with a `100vw` term → maps to `deviceSizes`, caps at
1200).

## Data & flow

No data flow, API, or DB change. The only runtime effect is the shape of the
`srcset`/`<source>` that `next/image` emits and the format Vercel negotiates:

- **Before:** each source photo → up to 2 formats × ~16 widths of *possible*
  variants; logos/thumbnails emit the full 16-width `srcset`.
- **After:** 1 format × a bounded width set; catalog/cards ≤1200, full-bleed
  banners ≤1920, logos/thumbnails a 2-entry `srcset`. Target **5–8× fewer** billed
  variants per photo on a crawl pass.

Verification is out-of-band on Vercel **Observability → Image Optimization**
(transformations + cache writes per crawled page) after deploy; the code-level
checks are `srcset` inspection + the guard test + the DoD gates.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 | `formats: ['image/webp']` — one negotiated format, no second-format transform per `(url,w,q)` | Inspect a `/_next/image` response `Content-Type` = `image/webp`; config diff review |
| AC2 | Fixed logos/thumbnails drop the non-`vw` `sizes` and set display `width`/`height` → 1×/2× `srcset` (thumbnail 128/256; logos the smallest covering tiers), never 16 | Browser `srcset` inspection on Header/Footer logo, `BrandImage`, `ProductCarouselMiniature` → ≤2 candidate widths |
| AC3 | `deviceSizes` cap 1200 for catalog/cards; 1920 reachable only by the two `100vw` banners | `srcset` inspection: detail carousel main photo max = 1200; `InfoSlider`/`LocationDetail` may reach 1920 |
| AC4 | Only variant budget changes; `priority`/lazy and reserved dimensions from P1.1/P1.2 untouched | Manual CWV check (Lighthouse/PSI) on `/`, `/tires`, detail — no LCP regression, no new CLS; `npm run perf:budget` |
| AC5 | Fewer widths × one format → 5–8× fewer variants per photo | Vercel Observability → Image Optimization: transformations + cache writes per crawled page vs pre-change baseline (out-of-band, post-deploy) |
| AC6 | Guard test asserts every `next/image` `sizes` literal contains `vw` | New `imageSizes.guard.test.ts` fails on a reintroduced non-`vw` fixed `sizes` |
| AC7 | Config + prop edits only, typed | `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` all green |

## Tradeoffs / alternatives

- **WebP over AVIF** — AVIF is ~15% smaller but doubles transform cost and is
  slower/cost­lier on the first (MISS) render; on tire photos already −81% the
  byte gain is immaterial. Chose the cost win.
- **Diet vs. `unoptimized`** — `unoptimized` on catalog photos would zero the cost
  but ship un-compressed images and degrade LCP/CWV/SEO. Rejected in the spec;
  mission priority is performance/correctness over cost.
- **1200 + a single 1920 tier vs. hard 1200 cap** — the extra 1920 tier costs one
  more possible variant only for the handful of full-bleed banners, buying crisp
  hero images on wide monitors. Worth it; the bulk of the saving comes from format
  and the 16→2 `srcset` fixes, not from the top tier.
- **Guard as a source-scan test vs. an ESLint rule** — a custom ESLint rule is
  heavier to author/maintain; a focused Vitest scan reuses existing tooling and
  runs in CI. Chose the test.

## Risks

- **Logo 2× tier lands on a `deviceSizes` width (640) rather than `imageSizes`.**
  A ~185px logo's 2× (~370) picks 640 (smallest available ≥370). Still a 2-entry
  `srcset`, not 16 — acceptable. AC2 checks the *count*, not the source array.
  Mitigation: if 640 for a tiny logo proves wasteful, a 384 `imageSizes` tier can
  be added later (out of scope now).
- **Full-bleed banners softened on 4K.** Capping catalog at 1200 is accepted; the
  1920 tier keeps `InfoSlider`/`LocationDetail` crisp. Verify those two visually.
- **Static-import logos** (`mrGomaLogoLight`) carry intrinsic dimensions; setting
  explicit display `width`/`height` must preserve aspect ratio to avoid CLS.
  Mitigation: match the rendered box; manual check that the logo isn't distorted
  and holds its space.
- **Guard test false positives/negatives.** Must exclude the favicon
  `<link sizes="any">` and only match `next/image` `<Image>` `sizes`. Mitigation:
  scope the scan to files importing `next/image`; unit-check the matcher on a known
  offender and a known-good responsive string.
- **Already-cached variants keep serving old formats for up to 31 days.** No user
  impact (they still render); new variants use the diet. No action needed.

## Out of scope

- Firewall / Bot Protection / WAF rules (SemrushBot, AhrefsBot, AI bots,
  `/_next/image` rate-limit) and Spend Management — owner-side dashboard config,
  complementary, tracked separately.
- Re-doing `004-image-payload` byte/dimension work or changing LCP asset choice.
- Adding an `imageSizes` 384 tier (only if the logo 640 tier proves wasteful).
- Business filters, SQL, and the GMC feed contract — untouched.

---

_The concrete steps live in [tasks.md](./tasks.md)._
