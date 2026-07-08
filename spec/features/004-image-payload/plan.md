# Plan — Image payload & delivery optimization

> Feature: `004-image-payload` · Based on: [spec.md](./spec.md) · Created: 2026-07-06

## Technical approach

Trim wasted image bytes on the three key routes by fixing the **specific offenders**
the baseline named, using the app's existing `next/image` pipeline and Baseline-2025
CSS (`image-set()`). Five moves, all small and independent:

1. **Enable AVIF globally** — add `formats: ['image/avif', 'image/webp']` to
   `next.config.mjs`. Every `next/image` render (cards, logo, brand chips, service
   cards, detail gallery) then negotiates AVIF first, webp fallback. One-line,
   cross-cutting win; no per-component change.
2. **Right-size the logo** — the `logo-mrgoma-light.webp` source is ~3840×665 (~106
   KB) but shown ~185×32; imported statically with **no `width`/`height`/`sizes`**, so
   `next/image` emits an oversized `srcset`. Downscale the **source asset** to ~2×
   display (≈ 750px wide) and add explicit `width`/`height` + `sizes` at the three
   usages. Also **drop `priority`** from the two **footer** logos (below the fold →
   should lazy-load), keeping it only on the above-the-fold header logo.
3. **`background-footer.png` → modern format** — it's a **133 KB PNG CSS background**
   (decorative, below the fold). Re-encode to **avif + webp** and serve via
   **`image-set()`** (avif → webp) per the decorative-image guide (Baseline since
   2023; fits our Baseline-2025 target). webp alone is the universal floor, so no PNG
   fallback needed.
4. **Optimize the unsplash promo (~1.28 MB)** — it's a **CSS background** sourced with
   `q=100&w=2400`. Unsplash's CDN already does `auto=format` (serves avif/webp), so the
   bloat is purely quality+width: lower to **`q=75&w=1600`** (≈ 75–80% smaller, no
   visible loss on a gradient-overlaid banner) in `promoBanner.ts`, and add a
   **`preconnect`** to `images.unsplash.com`. Keeps the third-party CDN (fast, cached)
   with a near-zero-risk edit. _(Local-hosting alternative in Tradeoffs.)_
5. **Fix detail thumbnails** — `ProductCarouselMiniature` sets **`priority` on every
   thumbnail** and **no `sizes`**, loading each at up to 500px in ~90px boxes. Make
   them **lazy** (drop `priority`) and add a small **`sizes`** (~`"128px"`).

## Reuse first

- **`next/image`** pipeline + the existing `qualities`/`minimumCacheTTL`/
  `remotePatterns` config (product images from `usedtires.online` already allowed).
- **`ProductImage`** (`components/ProductImage`) is the good model: it already sets
  responsive `sizes`, `priority` for the first two cards, and `loading='lazy'`
  otherwise — **leave it as the reference**; `ProductCarouselMiniature` gets aligned
  to it (add `sizes`, lazy).
- **`image-set()`** (Baseline 2025-safe) for the footer background — no new deps.
- Keep the intentional **raw `<img>`** zoom lens + fullscreen in `ProductImageZoom`
  (they need the original-resolution URL; out of scope — that's zoom quality).

## Files to add / change

**Global:**
- `next.config.mjs` — add `images.formats: ['image/avif', 'image/webp']`.

**Logo (right-size + below-fold lazy):**
- `public/assets/images/Logo/logo-mrgoma-light.webp` — **re-encode** downscaled to
  ~750px wide (from ~3840). (Generated with `sharp`, already a transitive dep.)
- `src/app/ui/sections/Header/Header.tsx` (~L64–71) — add explicit `width`/`height` +
  `sizes`; keep `priority` (above the fold).
- `src/app/ui/sections/Footer/Footer.tsx` (~L82–89) — add `width`/`height` + `sizes`;
  **remove `priority`** (below the fold → lazy).
- `src/app/ui/sections/Footer/DashboardFooter.tsx` (~L23–28) — same as Footer.

**Footer background (PNG → avif/webp):**
- **New** `public/assets/images/background-footer.avif` + `background-footer.webp`
  (generated from the existing PNG).
- `src/app/ui/sections/Footer/Footer.tsx` (~L71–75) — swap the inline
  `backgroundImage: url('...png')` for an **`image-set()`** (avif, webp).
- `src/app/ui/sections/Footer/DashboardFooter.tsx` (~L13–17) — same.
- Keep `background-footer.png` on disk unreferenced (safe fallback) or delete after
  verifying — decide during implementation.

**Unsplash promo (bytes):**
- `src/app/ui/sections/PromoBanner/config/promoBanner.ts` (L25, L39) — change the
  unsplash URLs `q=100&w=2400` → `q=75&w=1600` (both `home` and `searchResults`).
- Add a `preconnect` to `https://images.unsplash.com` — in the root layout `<head>`
  (or via `ReactDOM.preconnect` where the promo mounts). Confirm host during impl.

**Detail thumbnails:**
- `src/app/ui/components/ProductCarouselMiniature/ProductCarouselMiniature.tsx`
  (~L28–39) — remove hard-coded `priority`; add `sizes` (~`"128px"`); keep the
  error fallback.

## Data & flow

No data, API, or route changes — this is purely how images are **encoded, sized and
loaded**. `next.config` `formats` changes the negotiated output format at request
time; the logo/footer/thumbnail edits change `srcset`/`sizes`/`loading`; the promo
edit changes the requested unsplash URL. No serialization or server/client boundary
shifts.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 | Right-sized logo + AVIF config + thumbnail `sizes` + promo `q/w` + footer webp/avif clear the images we control | Post-deploy PSI: "Properly size images"/"Improve image delivery" no longer flag our assets |
| AC2 | `background-footer.png` replaced by `image-set()` avif/webp on both footers | DevTools Network: footer bg is avif/webp, not the 133 KB PNG |
| AC3 | Thumbnails get `sizes`; cards already have `sizes` (reference); logo `sizes` added | DevTools: mobile fetches a smaller source than desktop (check `srcset`/actual request) |
| AC4 | Footer logos + thumbnails made lazy; header logo + first cards keep priority | DevTools: below-fold imgs `loading=lazy`; LCP/above-fold not lazy (P1.1 intact) |
| AC5 | Explicit `width`/`height` on logo; `next/image` reserves box for cards/thumbs; footer bg is decorative (no reflow) | PSI CLS < 0.1 (ideally 0); manual: video, 3D, zoom, carousel, fallback all work |
| AC6 | DoD gates | `tsc` + `lint` + `test` + `build` green; manual check |

## Tradeoffs / alternatives

- **Unsplash: tune URL params (chosen) vs host locally via `next/image`.** Tuning
  `q`/`w` keeps the CSS-background structure and unsplash's format-negotiating CDN —
  ~80% smaller for a one-line, low-risk change. Hosting a local optimized copy would
  drop the third-party request entirely but requires downloading the asset,
  restructuring `PromoBanner` from a CSS bg to a `fill` `next/image` behind the
  gradient, and adding a `remotePattern` or committing a large binary. Chosen the
  pragmatic path; local-hosting stays available if we later want zero third-party
  image requests.
- **Footer bg: `image-set()` vs `next/image`.** It's a full-bleed decorative
  background; `image-set()` is the idiomatic, no-refactor fix (vs converting to a
  positioned `fill` image). Baseline-safe.
- **Logo: downscale source vs per-call `width` only.** Downscaling the shared asset
  fixes all three usages at the byte level; adding `width`/`height`/`sizes` caps the
  `srcset`. We do both for belt-and-suspenders.

## Risks

- **Asset generation** (logo downscale, footer avif/webp): must produce correct
  dimensions/quality; verify visually. Use `sharp` (transitive dep) via a one-off
  script; commit the generated assets.
- **`image-set()` inline style**: written as a single `backgroundImage` value (no
  two-declaration fallback in a style object) — acceptable since webp is the Baseline
  floor; verify it renders in the target browsers.
- **AVIF encode cost**: `formats: ['image/avif',...]` makes Next encode AVIF on first
  request (slightly slower cold, then cached via `minimumCacheTTL`). Acceptable.
- **Promo quality**: `q=75&w=1600` must still look crisp under the gradient — sanity-
  check on a large screen; bump to `w=1920` if needed.
- **Don't regress P1.1**: keep `priority` on the header logo and first two cards / the
  detail main image; only below-the-fold images become lazy.

## Out of scope

- The hero **`banner-hero.mp4`** (3.16 MB) and the **3D animation** — brand-protected;
  mp4 compression is a P1.1 note.
- `bg-section.webp` (276 KB) / `banner-tires-search.webp` and other section
  backgrounds not on the three key routes' critical payload.
- The zoom lens / fullscreen raw `<img>` (need original resolution).
- Fonts (P1.3), non-image CLS (P1.4), JS/INP (P1.5/P1.6).

---

_The concrete steps live in [tasks.md](./tasks.md)._
