# Plan — Structural CLS hardening (reserve space, no hydration jumps)

> Feature: `008-structural-cls` · Based on: [spec.md](./spec.md) · Created: 2026-07-07

## Technical approach

Per the clarified decisions (funnel-first; **reserve only where there is real
shift risk**; audit-only for already-safe surfaces), the work started with a
**code audit** of the shift-risk surfaces on home, `/tires` and detail. The audit
(recorded in full in `results.md`) found **every surface already reserves its
space except one** — the dismissible **`PromoBanner`**. So this slice is a
documented audit **plus a single targeted fix**.

### Audit outcome (evidence)

**Already SAFE — no code change (documented in `results.md`):**

- **Home hero / `SearchContainer`** — the mount animation is `opacity`/`translate`
  only (transforms don't cause layout shift); `activeTab` defaults to `'size'` on
  both server and client; the 3D area is reserved by the P1.5/P1.6 `<Skeleton>`.
- **`/tires` `TireCard`** — image sits in a fixed-height box (`h-48` /
  `sm:min-h-[180px]`) with `next/image` intrinsic `width/height`; badges
  (`StockBadge` — client but purely presentational, `FreeShippingBadge` — static,
  condition/size links) render identically server↔client (no late mount);
  `BrandImage` height reserved by `h-8`.
- **Home service cards** — `fill` image inside a `min-h-[260px]` card.
- **`LocationsSlider`** — `h-96` card box (only a benign *horizontal* mobile
  re-layout on hydration; vertical position stable).
- **`InfoCardsSection`** ("Why choose us") — static server component, no
  images/hydration.
- **Detail `ProductCarousel`** — main image in a reserved
  `aspect-square/16:10/16:9` box; **`ProductCarouselMiniature`** thumbnails in
  fixed `h-24` boxes. (Detail's big CLS was already fixed in P1.7.)

**SHIFT-RISK — fix (the one offender):**

- **`PromoBanner`** — `useState(false)` ⇒ the **server always renders it
  expanded**; a mount `useEffect` reads `localStorage['promo:<key>']` and does an
  unconditional `return null` with **no reserved height / no animation**. For a
  **returning user who dismissed it**, the banner (+ its `mb-10`) is removed on
  hydration and everything below **jumps up**. It's below the fold so its *measured*
  CLS is ≈ 0, but it's a genuine hydration jump and the only one found.

### The fix — cookie + hide-before-paint (user-chosen)

The root cause is that the **server can't read `localStorage`**, so its render
can't match a returning dismisser. Fix by moving the dismissed flag to a **cookie**
(readable before paint) and hiding a dismissed banner **before it ever paints** —
so it never occupies space, so there's nothing to shift:

1. **Persist dismissal in a cookie** (`promo_<key>=dismissed`, `path=/`, ~180-day
   `max-age`) instead of `localStorage`: the mount effect reads the cookie; the
   close handler writes it. (One-time effect: users who previously dismissed via
   the old `localStorage` key see the banner once more, then re-dismiss — writes
   the cookie. Acceptable.)
2. **Tag the banner** with `id="promo-<key>"` so it can be targeted.
3. **Tiny inline script in the root `<head>`** (runs before body parses): read
   `document.cookie`, and for each `promo_<key>=dismissed` inject a
   `<style>#promo-<key>{display:none!important}</style>`. Because the rule exists
   before the banner element parses, a dismissed banner is `display:none` from the
   very first paint → **no reserved space → no shift**. Non-dismissers have no
   cookie → banner renders SSR as today (no regression). React then reconciles
   (effect sets `dismissed` → returns `null`) with no visual change, since the
   element was already hidden.

Hydration stays clean: server and client both start `dismissed=false` (no
mismatch/warning); the injected `<style>` is a visual hide, not a DOM-structure
change.

## Reuse first

- Existing `PromoBanner` dismiss flow and date-range logic — reused, only the
  persistence swaps `localStorage` → cookie.
- Existing root `<head>` in `layout.tsx` — the pre-paint script goes there
  (same place as the existing icon/JSON-LD tags).
- No new dependencies; the script is ~8 lines of vanilla JS.

## Files to add / change

- **`src/app/ui/sections/PromoBanner/PromoBanner.tsx`** — read/write the cookie
  (`promo_<key>=dismissed`) in the mount effect and `onClose` instead of
  `localStorage`; add `id={storageKey ? \`promo-${storageKey}\` : undefined}` to
  the `<aside>`.
- **`src/app/layout.tsx`** — add the inline pre-paint `<script>` in `<head>` that
  hides any cookie-dismissed `#promo-<key>` before it paints.
- **`src/app/ui/sections/PromoBanner/PromoBanner.test.tsx`** — **new** tests for
  the cookie behaviour (see below).
- **`spec/features/008-structural-cls/results.md`** — **new**; the full audit
  table (SAFE surfaces + the PromoBanner finding/fix) and the before/after CLS.

## Data & flow

No APIs, params, DB, or route changes. Client cookie only:

- Dismiss → `document.cookie = 'promo_<key>=dismissed;path=/;max-age=…'`.
- Next load → the head script reads the cookie and injects a hide-style **before
  paint**; the banner never occupies space for a dismisser. Non-dismissers:
  unchanged (SSR banner). No effect on static rendering — the cookie is read in a
  **client** inline script, **not** via `next/headers`, so the home page stays
  statically rendered (no dynamic opt-out).

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (audit documented) | `results.md` audit table (every surface + verdict) | Review `results.md` |
| AC2 (images reserved) | Audit confirms all content images reserve space (fixed box / intrinsic dims / aspect) — no change needed | Documented; DevTools spot-check with images throttled |
| AC3 (badges reserved) | `StockBadge`/`FreeShippingBadge` server-render identically — no late mount | Documented; throttled reload shows no push |
| AC4 (carousels reserved) | All sliders reserve a fixed height/aspect — no change | Documented; first-paint check |
| AC5 (no hydration jump) | **PromoBanner** fixed (cookie + pre-paint hide); hero already safe | Manual: as a returning dismisser on a throttled reload, no upward jump; unit test covers the cookie/return-null path |
| AC6 (CLS held) | The only hydration jump is removed; nothing new reserved incorrectly | Lab CLS stays 0 on the 3 routes; throttled reload shows no reflow; field < 0.1 via post-deploy PSI (recorded later) |
| AC7 (DoD) | Small, targeted diff | `tsc` + `lint` + `test` + `build` green; manual desktop+mobile check pages look identical |

### Tests (PromoBanner.test.tsx)

- Clicking close writes `promo_<key>=dismissed` to `document.cookie`.
- With the cookie preset, after mount the banner is **not** rendered
  (`queryByRole('region')` is null).
- With no cookie, the banner **is** rendered.
- (jsdom supports `document.cookie`; the inline head script is verified manually —
  its logic is a trivial cookie→style injection.)

## Tradeoffs / alternatives

- **Cookie + pre-paint hide (chosen)** vs **`next/headers` cookie read** — the
  latter would make the home page **dynamic** (lose static rendering on our
  LCP-critical page). The client inline-script hide keeps the page static and
  still eliminates the shift. Chosen for zero perf cost.
- vs **mounted-flag (render nothing until mounted)** — would drop the banner from
  SSR for *everyone* (the majority who never dismiss), trading the common case to
  fix a minority below-the-fold shift. Rejected.
- vs **audit-only / document** — defensible (measured CLS ≈ 0), but the phase's
  mandate is "no hydration jumps," and the chosen fix removes it cheaply with no
  downside. Rejected in favour of the fix.
- **No speculative reservations** on the already-safe surfaces (per the clarified
  "reserve only where real risk") — keeps the diff minimal and regression-free.

## Risks

- **Inline head script** — tiny, wrapped in `try/catch`, no-op without a promo
  cookie; runs on every route (root layout) but only acts when a cookie exists.
- **localStorage → cookie migration** — old dismissers see the banner once more,
  then re-dismiss (writes cookie). One-time, acceptable; noted.
- **CSP** — the app has no strict inline-script CSP; if one is added later, this
  script needs a nonce (noted for the future).
- **Regression on non-dismissers** — none: no cookie ⇒ unchanged SSR banner.

## Out of scope

- Reserving space on the already-safe surfaces (audit-only, per clarification).
- The detail footer CLS (fixed in P1.7); INP/bundle (P1.5/6); re-measure/budget
  (P1.8).
- The dormant Tailwind plugins follow-up (separate backlog item).

---

_The concrete steps live in [tasks.md](./tasks.md)._
