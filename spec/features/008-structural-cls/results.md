# Results — Structural CLS hardening (P1.4)

> Feature: `008-structural-cls` · Status: awaiting manual throttled check + PSI

## Context

The project's worst CLS (detail 0.914/0.525) was already fixed by **P1.7**
(server-render). Baseline lab CLS: home **0**, `/tires` **≤ 0.004**, detail now
**≈ 0**. Field CLS has no CrUX data yet. This phase is preventive: **audit** the
key routes and **reserve space only where there is real shift risk**.

## Audit — per surface

| Route | Surface | Verdict | Why |
| ----- | ------- | ------- | --- |
| Home | Hero / `SearchContainer` | ✅ SAFE | Mount animation is `opacity`/`translate` only (transforms → no layout); `activeTab` default `'size'` matches server↔client; 3D area reserved by the P1.5/P1.6 `<Skeleton>`. |
| Home | Hero `<video>` | ✅ SAFE | `absolute inset-0` (out of flow); section height comes from `SearchContainer`. |
| Home | Service-card images | ✅ SAFE | `fill` image inside a `min-h-[260px]` card. |
| Home | `InfoCardsSection` ("Why choose us") | ✅ SAFE | Static server component — no images / no hydration. |
| Home | `LocationsSlider` | ✅ SAFE | `LocationCard` image in a fixed `h-96` box (`fill`); only a benign horizontal re-layout on mobile hydration, vertical stable. |
| Home | **`PromoBanner`** | ⚠️ **FIXED** | See below — the only real hydration jump found. |
| `/tires` | `TireCard` image (`ProductImage`) | ✅ SAFE | Fixed-height box (`h-48` / `sm:min-h-[180px]`) + `next/image` intrinsic `width/height`. |
| `/tires` | Badges (`StockBadge`, `FreeShippingBadge`, condition, size) | ✅ SAFE | `StockBadge` is client but purely presentational; `FreeShippingBadge` static; all render identically server↔client — no late mount. |
| `/tires` | `BrandImage` | ✅ SAFE | Height reserved by `h-8` container + intrinsic dims. |
| Detail | `ProductCarousel` main image | ✅ SAFE | Reserved `aspect-square / 16:10 / 16:9` box; `fill` image. |
| Detail | `ProductCarouselMiniature` thumbs | ✅ SAFE | Fixed `h-24` thumbnail boxes. |
| Detail | (footer / late client content) | ✅ SAFE | Already fixed in **P1.7** (server-render). |

**Conclusion:** every surface already reserves its space **except `PromoBanner`**.
Per the clarified "reserve only where real shift risk," no other code changes were
made.

## The fix — PromoBanner (cookie + hide-before-paint)

**Problem:** `useState(false)` → the server always rendered the banner **expanded**;
a mount `useEffect` read `localStorage['promo:<key>']` and did an unconditional
`return null` with no reserved height. For a **returning user who dismissed it**,
the banner (+ `mb-10`) was removed on hydration and content below **jumped up**.
(Below the fold, so measured CLS ≈ 0 — but a genuine hydration jump.)

**Fix:**
- `PromoBanner.tsx` — dismissal now persists in a **cookie** (`promo_<key>=dismissed`,
  `path=/`, 180-day max-age) read/written in the effect + close handler; the
  `<aside>` gets `id="promo-<key>"`.
- `layout.tsx` — a tiny inline `<head>` script reads the cookie and injects
  `#promo-<key>{display:none!important}` **before the body paints**, so a dismissed
  banner never occupies space → no shift. Non-dismissers: unchanged SSR banner.
- The cookie is read in a **client** script (not `next/headers`), so the home page
  **stays statically prerendered** (verified: `┌ ○ /` in the build).
- One-time migration: users who previously dismissed via `localStorage` see the
  banner once more, then re-dismiss (writes the cookie).

## Automated gates (local)

| Gate | Result |
| ---- | ------ |
| `npx tsc --noEmit` | ✅ pass |
| `npm run lint` | ✅ pass |
| `npm test` | ✅ 117/117 (base 113 + 4 PromoBanner tests) |
| `npm run build` | ✅ compiles; `/` stays static (`○`) |

## Manual check (yours — T5, desktop + mobile, throttled)

- [ ] First visit: banner shows, no shift. Dismiss it.
- [ ] Reload as the returning dismisser (throttled): banner is gone from first
      paint; the Services section does **not** jump up.
- [ ] Spot-check hero, `/tires` grid, detail while loading (images/badges/sliders
      hold their space) → no reflow.

## CLS before / after (post-deploy PSI, authoritative)

| Route | CLS before | CLS after | Notes |
| ----- | ---------- | --------- | ----- |
| `/` | _tbd_ | _tbd_ | lab already 0; confirm field < 0.1 |
| `/tires` | _tbd_ | _tbd_ | |
| detail | _tbd_ | _tbd_ | P1.7 already brought this to ≈ 0 |

_Filled once you provide the PageSpeed numbers._
