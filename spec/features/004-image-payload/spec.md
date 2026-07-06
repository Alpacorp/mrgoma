# Spec — Image payload & delivery optimization

> Feature: `004-image-payload` · Status: Draft · Created: 2026-07-06
> Roadmap: P1.2 · Branch: `feat/004-image-payload`

## Why — problem & value

The baseline ([001-perf-baseline](../001-perf-baseline/baseline.md)) found that
**every key route ships oversized images** — the browser downloads far more image
bytes than the display needs. Measured **image-delivery savings**:

- **Home `/`** — ≈ 725 KiB (mobile) / 812 KiB (desktop).
- **`/tires`** — ≈ 887 KiB.
- **Detail** — ≈ 512 KiB (mobile) / 254 KiB (desktop).

Concrete offenders the baseline named:

- The **logo** served at 3840×665 but displayed ~323×56 (all routes).
- **`background-footer.png`** shipped as a **133 KB PNG** (all routes) — a modern
  format (webp/avif) would be a fraction of that.
- **`/tires` card images** served ~750×563 for a ~614×461 slot, without responsive
  `sizes`.
- **Detail gallery/thumbnail images** served at 726×810 for a 128×96 thumb.

This is wasted bandwidth on mobile/4G — the exact opposite of the mission's
**"perceived and real speed"** and **mobile-first** pillars. Trimming these bytes
speeds up every page, reduces data cost for the shopper, and — where the LCP asset
is itself an image (Home poster/logo region, `/tires` hero) — helps LCP too. It
also lets us lock in **CLS-safe** image dimensions so no image can reintroduce the
layout shift we just fixed in P1.7.

This is roadmap **P1.2** — the payload lever, complementary to the LCP-priority
(P1.1) and server-render (P1.7) work already shipped.

## User stories

- As a **shopper on a phone/4G**, I want pages to download only the image bytes my
  screen actually needs, so they load fast and don't burn my data.
- As a **shopper**, I want images to hold their space as they load, so nothing
  jumps around while I read or tap.
- As the **team**, we want the measured image-delivery savings realized on the key
  routes, closing the P1.2 payload gap the baseline found.

## Scope

- **In:**
  - The three key routes: **Home `/`**, **`/tires`** (catalog grid), and **detail**
    (gallery/thumbnails).
  - **Right-size** images so intrinsic dimensions match the display size, with
    responsive **`sizes`** so mobile requests smaller sources than desktop
    (especially the `/tires` card grid and the detail gallery).
  - **Modern formats** (webp/avif) for images we control — including converting
    static raster assets like **`background-footer.png`** and right-sizing the
    **logo**.
  - The third-party **unsplash PromoBanner** (~1.28 MB, the single largest image on
    Home + `/tires`): serve it **optimized** — right-sized and in a modern format via
    our image pipeline (`next/image`) and/or a locally-hosted optimized copy.
  - **Below-the-fold images lazy-loaded**, and **above-the-fold / LCP images not**
    lazy-loaded (preserving the P1.1 priority already set).
  - **Reserved dimensions** (width/height or aspect ratio) on every image so none
    contributes CLS.
- **Out:**
  - The hero **`banner-hero.mp4`** and the **3D tire animation** — brand-protected
    (must not be removed); video compression is tracked under P1.1, not here.
  - **Replacing** the unsplash promo's source/creative — we optimize how it's
    *delivered* (size/format), not swap the image or move off unsplash as a source
    of record.
  - LCP request-priority work (P1.1) and the detail server-render (P1.7) — already
    shipped; this phase does not change them, only the image *bytes/dimensions*.
  - Fonts (P1.3), structural/non-image CLS (P1.4), JS/bundle and INP (P1.5/P1.6).
  - Redesigning any layout or changing which images are shown.

## Functional requirements

- **FR1:** On the key routes, images are served at dimensions appropriate to their
  displayed size — no image downloads materially more pixels than it renders (per
  Lighthouse "Properly size images" / "Improve image delivery").
- **FR2:** Grid/gallery images (`/tires` cards, detail thumbnails) declare
  responsive **`sizes`** so smaller viewports fetch smaller sources.
- **FR3:** Images we control are served in a **modern format** (webp/avif); the
  static **`background-footer.png`** is no longer shipped as a large PNG.
- **FR4:** **Below-the-fold** images are **lazy-loaded**; the **LCP/above-the-fold**
  images remain eager + prioritized (no regression to P1.1).
- **FR5:** Every image reserves its space (intrinsic dimensions / aspect ratio) so
  it contributes **no layout shift** (keep CLS < 0.1, ideally 0 as achieved in P1.7).
- **FR6:** No brand or functional regression — the hero video, the 3D animation,
  image zoom/magnifier, carousel, and the generic fallback image all still work.

## Acceptance criteria (testable)

- [ ] **AC1:** Post-deploy PSI on the three URLs no longer flags the **images we
  control** under **"Improve image delivery" / "Properly size images"** (logo,
  `background-footer.png`, `/tires` card images, detail gallery/thumbnails, and the
  now-optimized unsplash promo). The baseline savings (≈ 725 / 887 / 512 KiB) are the
  "before" reference; no fixed KiB threshold is required.
- [ ] **AC2:** `background-footer.png` is **no longer** delivered as a ~133 KB PNG
  (served as webp/avif or an equivalently small asset) on all three routes.
- [ ] **AC3:** `/tires` card images and detail thumbnails carry responsive `sizes`
  and, on a mobile viewport, fetch a **smaller** source than on desktop (verifiable
  in DevTools "Network"/`srcset`).
- [ ] **AC4:** Below-the-fold images use `loading="lazy"`; the LCP/above-the-fold
  images are **not** lazy and keep their P1.1 priority.
- [ ] **AC5:** **CLS stays < 0.1** (ideally 0) on all three routes — no image
  introduces a shift; the hero video, 3D animation, zoom, carousel and fallback
  image all still work.
- [ ] **AC6:** Definition of Done green (`tsc` + `lint` + `test` + `build`), with
  tests/manual checks for any changed image-rendering logic.

## Non-functional / constraints

- **Mobile-first:** the win is largest on small screens / throttled networks — verify
  there first.
- **Reuse before creating:** prefer the existing image pipeline and its conventions
  (correct `sizes`/`priority`) over new components.
- **Accessibility:** preserve meaningful `alt` text; don't regress it while changing
  formats/dimensions.
- Product availability/content unchanged — this is a delivery/bytes change only.

## Decisions (from /clarify)

- **Unsplash promo = in scope, served optimized.** Deliver the ~1.28 MB third-party
  PromoBanner right-sized and in a modern format via our image pipeline
  (`next/image`) and/or a locally-hosted optimized copy — it's the single biggest
  image win. We optimize *delivery*, not the creative.
- **AC1 target = "Lighthouse no longer flags images we control."** Success is the
  image-delivery / properly-size audits clearing for the assets we own (no rigid KiB
  threshold — a chunk of the residual can be third-party/CDN behavior outside our
  control). The baseline KiB figures remain the "before" reference.
- **Verification = you re-run PSI post-deploy.** Locally we confirm in DevTools/build
  that images are right-sized, in webp/avif, and lazy where below-the-fold; the
  authoritative AC1/AC5 check is your **production PSI run**, recorded as the "after"
  (same pattern as 002/003).

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
