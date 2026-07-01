# Performance baseline — Mr. Goma Tires

> Feature: `001-perf-baseline` (P1.0) · See [spec.md](./spec.md) · [plan.md](./plan.md)

## Provenance

| Field | Value |
| --- | --- |
| Date measured | 2026-06-30 |
| Environment | Live production |
| Base URL | `https://www.mrgomatires.com` |
| Tool (source of truth) | PageSpeed Insights (Lighthouse lab + CrUX field) |
| Lighthouse version | 13.4.0 (HeadlessChromium 146) |
| Mobile profile | Moto G Power emulated · 4G lenta (Lighthouse) |
| Desktop profile | Emulated desktop · custom throttling |
| Production commit/deploy | live prod · captured 2026-06-30 20:30 GMT-5 (build id not captured) |
| Runs per route/form factor | 3 (record **median + spread**) |

**Routes measured**

- Home: `https://www.mrgomatires.com/`
- Listing: `https://www.mrgomatires.com/tires`
- Detail: `https://www.mrgomatires.com/tires/469690-continental-235-60-18`

**Status:** ✅ measured — **all three routes** (mobile + desktop) via the PSI web
UI (the API path returned 429). **Lab only**; CrUX/GA4 **field data not captured**
(single-page sessions) — see the field-data gap below.

**Brand constraint (do not violate):** the hero **video** and the **3D tire
animation** must stay — per brand spec they cannot be removed. Performance fixes
must optimize *around* them (defer / idle-mount / compress / prioritize), never
drop them.

Legend: **field** = CrUX (real users), **lab** = Lighthouse synthetic. INP is
field-only; **TBT** is the lab proxy. `—` = not yet measured.

---

## 1. Home `/`

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance score | **84** | **55** |
| LCP — field | not captured | not captured |
| LCP — lab | **4.5 s** ⚠️ | 1.8 s |
| INP — field | not captured | not captured |
| TBT — lab (INP proxy) | 0 ms | **19,760 ms** 🔴 |
| CLS — field | not captured | not captured |
| CLS — lab | 0 ✅ | 0 ✅ |
| FCP | 1.2 s | 0.3 s |
| Speed Index | 2.3 s | 3.2 s |
| TTFB | ~10 ms | ~10 ms |
| Total transfer | 5,349 KiB | 5,824 KiB |
| Largest resources | unsplash promo 1,281 KiB · logo 69.6 KiB | `banner-hero.mp4` **3,158 KiB** · unsplash 1,281 KiB · footer.png 133 KiB |

- **LCP element (both):** hero `<video poster="/assets/images/banner-hero.webp">`
  (`main.bg-white > section.px-4 > div.absolute > video.absolute`). LCP audit:
  **`fetchpriority=high` not applied** (flagged); not lazy; discoverable in HTML.
  - Mobile breakdown: TTFB 10 ms · **resource load delay 790 ms** · load 200 ms ·
    render delay 150 ms.
  - Desktop breakdown: TTFB 10 ms · load delay 130 ms · load 200 ms · **render
    delay 360 ms** (behind heavy main-thread work).
- **CLS:** **0** on both (lab) — the `PromoBanner`/reflow CLS hypothesis is **not
  observed in lab** (field still unknown).
- **Main-thread / TBT:** desktop **TBT 19,760 ms**, main-thread **32.4 s** (Other
  29,588 ms). The **three.js 3D selector** mounts on desktop (≥768 px) and not on
  mobile (mobile TBT 0) → confirms the INP/TBT hypothesis.
- **Payload:** `banner-hero.mp4` **3.16 MB** + the unsplash **PromoBanner** image
  1.28 MB dominate; oversized logo (3840×665 shown at 323×56); `background-footer.png`
  133 KB (PNG). Image-delivery savings ≈ 725 KiB (mobile) / 812 KiB (desktop).
- **Other:** render-blocking CSS chunk (~110 ms), legacy-JS polyfills 14 KiB,
  unused JS ≈ 110 KiB, no `preconnect` to `unsplash.com`.
- **A11y (score 94):** low-contrast text (green-600 labels, gray-400 links);
  LocationsSlider dots have small/close tap targets. _(Feeds WCAG AA work; not a
  CWV phase.)_
- **Run spread:** single run per cell (this batch).

## 2. Listing `/tires`

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance score | **93** ✅ | **92** ✅ |
| LCP — field | not captured | not captured |
| LCP — lab | **3.2 s** ⚠️ | 1.9 s |
| INP — field | not captured | not captured |
| TBT — lab (INP proxy) | 10 ms | 40 ms |
| CLS — field | not captured | not captured |
| CLS — lab | 0.004 ✅ | 0 ✅ |
| FCP | 1.2 s | 0.3 s |
| Speed Index | 2.6 s | 0.8 s |
| TTFB | ~70 ms | — |
| Image-delivery savings | ≈ 887 KiB | — |
| Largest resources | unsplash promo 1,281 KiB · footer.png 133 KiB · card imgs ~54–61 KiB | unsplash 1,281 KiB · footer.png 133 KiB · card imgs ~40–46 KiB |

- **LCP element (both):** the **hero background** `<img src="/assets/images/bg-header.svg">`
  (`div.sticky > header.w-full > div.absolute > img.object-cover`) — **not** a tire
  card. LCP audit: **`fetchpriority=high` not applied**; not lazy; discoverable.
  - Mobile breakdown: TTFB 70 ms · **resource load delay 720 ms** · load 230 ms ·
    render delay 160 ms.
- **CLS:** 0.004 (mobile) / 0 (desktop) — negligible. Sole contributor: the
  results container (`bg-gray-50 … "Showing 10 of 4,008 results"`). The count-reflow
  / `PromoBanner` / skeleton CLS hypothesis is **effectively refuted**.
- **TBT:** 10 ms (mobile) / 40 ms (desktop) — the large client `SearchResults` +
  client refetch is **not a lab TBT problem**; field **INP** still unknown.
- **Payload:** image-delivery savings ≈ 887 KiB — unsplash **PromoBanner** 1.28 MB
  (third-party), `background-footer.png` 133 KB (PNG → webp/avif), oversized card
  images (source 750×563 shown ~614×461) and oversized logo. → image work.
- **DOM:** 1,006 elements, depth 23; heaviest node = the brand scroller
  (`flex gap-2 overflow-x-auto`, 113 children).
- **A11y (score 91):** **invalid `aria-pressed` on `<a>` brand/rim links** (the link
  role doesn't support it) — affects many elements and the "agent accessibility"
  check; low-contrast gray-400 section labels; two identical-title Michelin cards
  with different hrefs. _(Feeds WCAG AA work; not a CWV phase.)_
- **Run spread:** single run per cell (this batch).

## 3. Detail `/tires/469690-continental-235-60-18`

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance score | **60** 🔴 | **72** |
| LCP — field | not captured | not captured |
| LCP — lab | **4.5 s** 🔴 | 0.8 s ✅ |
| INP — field | not captured | not captured |
| TBT — lab (INP proxy) | 80 ms | 180 ms |
| CLS — field | not captured | not captured |
| CLS — lab | **0.914** 🔴🔴 | **0.525** 🔴 |
| FCP | 0.9 s | 0.3 s |
| Speed Index | 2.0 s | 1.1 s |
| TTFB | ~70 ms | — |
| Image-delivery savings | ≈ 512 KiB | ≈ 254 KiB |
| Largest resources | product img 115 KiB · footer.png 133 KiB · gallery 58–80 KiB · logo 70 KiB | footer.png 133 KiB · logo 70 KiB · gallery 20–44 KiB |

- **LCP element (mobile):** the **main product `<img … loading="lazy">`**,
  client-fetched (not in the initial HTML). **All three LCP-discovery checks
  fail**: ❌ not-lazy, ❌ `fetchpriority=high`, ❌ discoverable in the initial
  document. Breakdown: TTFB 70 ms · **resource load delay 1,050 ms** · load 20 ms ·
  render 40 ms → the delay is the client fetch + lazy discovery. **Confirms the
  plan's biggest LCP lever.** (Desktop LCP is 0.8 s — the image loads fast there, so
  LCP shifts to the footer background; still flagged for `fetchpriority`.)
- **CLS 🔴 (standout issue):** **0.914 mobile / 0.525 desktop** — far above the 0.1
  target. Almost entirely the **footer** (`<footer class="bg-black relative
  overflow-hidden">` = 0.892 mobile / 0.519 desktop). Root cause: the page ships a
  short skeleton, then the **late client fetch injects the tall content block**,
  shoving the footer down → massive shift. Ties CLS to the client-fetch lever.
- **Payload:** oversized gallery images (e.g. 726×810 served for a 128×96 thumb),
  main product image ~115 KB, `background-footer.png` 133 KB (PNG), oversized logo.
  Savings ≈ 512 KiB (mobile) / 254 KiB (desktop).
- **TBT:** 80 ms (mobile) / 180 ms (desktop) — `TreadWearExplorer` 3D + zoom are
  below the fold; only a minor lab cost here.
- **A11y (score 95):** no `<main>` landmark; low-contrast gray-400 spec labels
  (CONDITION, LIFE, TREAD DEPTH…); redundant `alt="Image N"` equal to the
  aria-label. _(Feeds WCAG AA work; not a CWV phase.)_
- **Run spread:** single run per cell (this batch).

---

## Field data (CrUX / GA4)

- **CrUX (via PSI):** **not captured** — all runs were single-page **lab**
  sessions, so no field block was recorded. **Gap:** re-open each URL on
  pagespeed.web.dev and copy the "Discover what your real users are experiencing"
  panel (field LCP/INP/CLS, if the URL/origin has enough CrUX traffic). INP is
  **field-only**, so this is the only way to get real INP.
- **GA4 Web Vitals:** availability **to check** in the GA4 property (it may have no
  Web-Vitals events). Follow-up if CrUX coverage is thin.

---

## Top offenders → roadmap phases

Ranked once measured. **Pre-seeded from the code map (plan.md) as _hypotheses_ —
confirm/refute and rank with the real numbers.**

| # | Route | Offender (hypothesis) | Metric | Phase | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Home | Hero `<video>` poster missing `fetchpriority=high` → LCP **4.5 s** mobile | LCP | P1.1 | **confirmed** |
| 2 | Home | three.js 3D selector on desktop → **TBT 19,760 ms**, main-thread 32.4 s | INP/TBT | P1.5/P1.6 | **confirmed** |
| 3 | Home | Payload: `banner-hero.mp4` 3.16 MB + unsplash promo 1.28 MB + oversized logo/`footer.png` | LCP/payload | P1.1/P1.2 | **confirmed** |
| — | Home | `PromoBanner`/reflow CLS | CLS | P1.4 | **not observed** (lab CLS = 0; check field) |
| 4 | /tires | LCP = hero **`bg-header.svg`** missing `fetchpriority=high` → LCP 3.2s mobile | LCP | P1.1 | **confirmed** (hero bg SVG, not a card) |
| 5 | /tires | Image payload: unsplash promo 1.28 MB + `footer.png` 133 KB + oversized card imgs/logo (≈ 887 KiB) | payload | P1.2 | **confirmed** |
| — | /tires | Large client `SearchResults` + refetch | INP | P1.6/P1.7 | **not observed in lab** (TBT 10/40 ms; field INP tbd) |
| — | /tires | Count reflow / `PromoBanner` / skeleton | CLS | P1.4 | **not observed** (CLS ≤ 0.004) |
| 6 | Detail | Main image **`loading=lazy` + `priority=false` + client-fetched** → LCP 4.5s mobile (all 3 LCP checks fail) | LCP | P1.1+P1.7 | **confirmed** (biggest LCP lever) |
| 7 | Detail | **CLS 0.914 mobile / 0.525 desktop** — footer shifts as late client content injects | CLS | P1.4+P1.7 | **confirmed** 🔴 worst metric found |
| 8 | Detail | Oversized gallery images + `footer.png` 133 KB (≈ 512 KiB mobile savings) | payload | P1.2 | **confirmed** |
| — | Detail | `TreadWearExplorer` 3D + zoom | INP/TBT | P1.5/P1.6 | minor in lab (TBT 80/180 ms) |

**Targets (from `tech-stack.md`):** LCP < 2.5s · INP < 200ms · CLS < 0.1.

## Overall assessment & recommended order

**Route health (lab):** `/tires` is healthy (93/92). **Detail** and **Home** are
the problems. Ranked by impact (worst first) with the phase that addresses it:

1. **Detail — CLS 0.914 / 0.525** 🔴 (worst metric anywhere). The footer shifts when
   the late client fetch injects content. → **P1.7** (server-render the fetch) +
   **P1.4**. Highest priority.
2. **Detail — LCP 4.5 s mobile.** Product image is `loading=lazy` + `priority=false`
   + client-fetched. → **P1.1** (eager + priority) + **P1.7** (server-render).
3. **Home — desktop TBT 19,760 ms / main-thread 32.4 s.** three.js 3D selector.
   Brand: **keep it** → **P1.5/P1.6** (idle/deferred mount, lower cost).
4. **Home — LCP 4.5 s mobile.** Hero video poster without `fetchpriority=high`.
   Brand: **keep the video** → **P1.1** (prioritize poster, compress the 3.16 MB mp4).
5. **Payload (all routes).** unsplash PromoBanner 1.28 MB, `footer.png` 133 KB (PNG),
   oversized product/logo images. → **P1.2**.
6. **`fetchpriority=high` missing on every LCP element** (all 3 routes). Cheap,
   cross-cutting win. → **P1.1**.

**Cross-cutting root cause:** client-side data fetching on **Detail** (and the
`SearchResults` pattern) is the biggest structural lever — it drives both the
Detail LCP and the Detail CLS. → **P1.7**.

**Not confirmed / de-prioritized:** `/tires` client-component INP and the
`PromoBanner` CLS did not appear in lab (field INP still unknown).

**Separate track (not CWV):** recurring **accessibility** issues — invalid
`aria-pressed` on `/tires` brand links, missing `<main>` landmark on Detail,
low-contrast gray-400 labels site-wide, redundant `alt`. Recommend a dedicated
WCAG 2.1 AA feature.

---

## How to fill this

Per route × {mobile, desktop}, run **PageSpeed Insights** and paste the values
above. Options:

1. **PSI API + key** (unblocks the WebFetch path):
   `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<URL>&strategy=mobile&category=performance&key=<API_KEY>`
   (repeat with `strategy=desktop`). The anonymous endpoint is rate-limited (429).
2. **PSI web UI:** <https://pagespeed.web.dev/> — run each URL, copy lab + field
   numbers, the LCP element, and CLS culprits.
3. **Chrome DevTools → Lighthouse** for the LCP element / CLS sources when PSI's
   detail isn't enough.

Take 3 runs per cell and record the median + spread.
