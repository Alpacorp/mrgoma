# Plan — Shop by your city (Miami or Orlando)

> Feature: `043-visitor-city` · Based on: [spec.md](./spec.md) · Created: 2026-11-10

> **Revised 2026-11-10 (spec D8).** After the owner saw it implemented, the
> header chip / phone strip, the manual city choice (`mg_city_choice`) and the
> `city_changed` event were removed. What remains: `/api/visitor-city`, the
> 1-day estimate, `useVisitorCity()` (lazy), "Located in {city}", the
> "N like this in {city}" link and the nearest-store preselection. The UX notes
> on the chip below are kept for the record only.

## Technical approach

**Everything personal happens in the browser, after load; the server only
answers two small, uncached-for-the-page questions.** Pages keep rendering (and
caching) exactly as today, so the HTML is the same for every visitor and every
crawler (FR4, AC8).

1. **Guess — `GET /api/visitor-city`.** A tiny route handler reads Vercel's
   `x-vercel-ip-latitude` / `x-vercel-ip-longitude` request headers, finds the
   nearest store in `locationsConfig` (straight-line distance), and answers
   `{ city: 'Miami' | 'Orlando' | null, nearestStoreId }` — `null` beyond **60
   miles** of every store (D2) or without headers (local dev, relays — AC13).
   The coordinates are used in memory and never logged or returned
   (`withLogging` logs path/status/ms only). `Cache-Control: private, no-store`.
   `/api/` is already disallowed in `robots.ts`.
2. **Remember — browser storage, two keys.** `mg_city_guess` keeps the last
   answer for **1 day** (so a visitor makes at most one call a day, and a move
   is noticed); `mg_city_choice` keeps the visitor's own choice for **90 days**
   (D4). Choice wins over guess (FR2). Only the city and a store id are kept —
   never coordinates (FR7). `localStorage` with try/catch, like the cart; it is
   a functional preference, not consent-gated (D4).
3. **Share — `VisitorCityProvider`.** A small client context mounted in the
   root layout next to `CartProvider`: resolves choice → guess → fetch, exposes
   `{ city, source, nearestStoreId, setChoice }`. It fetches **lazily — only
   when a shop component asks for the city** (the chip, the tire line,
   checkout), so dashboard pages never call the route — and only when no valid
   choice or guess is stored. Context is justified by the tech-stack rule
   (cross-cutting selection used by the header, the tire page and checkout).
4. **Show — three consumers.**
   - **Header chip** (D3): "📍 Miami ▾" next to the cart, opening a small
     native `popover` panel with three radio options (Miami / Orlando / Not in
     Florida) and one line on privacy. The chip has a **fixed width** and is
     rendered with a neutral label before the city is known, so nothing moves
     (AC8). Pattern already used by `HomeMoreFilters` (Popover API, Baseline).
   - **Tire page:** a server-rendered line for everyone, "Located in Orlando"
     (a plain fact, same HTML), and a client addition **on the same line** when
     the visitor's city differs: "· 3 like this in Miami →". It fetches
     `GET /api/tire-sets/elsewhere?id=&city=` only for those visitors (D5, D6).
   - **Checkout:** when pickup is chosen, the cart's city equals the visitor's
     city and no store is selected, preselect `nearestStoreId` if it is among
     the allowed stores (FR6); otherwise today's behavior (AC7).

`proxy.ts` is **not** used, unlike the roadmap note: it calls `auth()` and
matches only `/login` and `/dashboard`; widening it to every page would run on
every request, bots included (the September 2026 lesson). The API route runs
once per visitor per day, only for browsers that execute our JavaScript.

## UX/UI notes (D3)

The project rule is to research with the `modern-web-guidance` skill; it is not
available in this session, so these notes follow the project's own conventions
(Popover API already in `HomeMoreFilters`, 44 px targets, Tailwind v4, brand
green) and are to be checked with the skill when available:

- **Chip:** pin icon + city ("Miami") — or "Set city" with no city — inside a
  44 px tall pill styled like the Cart button (`bg-white/10`, white text). Fixed
  `min-w` so "Miami", "Orlando" and "Set city" occupy the same box. On phones it
  shows the pin + city only; `aria-label="Shopping in Miami. Change city"`.
- **Panel:** native `popover` anchored under the header (no CSS anchor
  positioning — not Baseline — so it is positioned like the existing popover),
  title "Where are you shopping?", a `fieldset` of three large radio rows
  (Miami — 5 stores; Orlando — 2 stores; Not in Florida — delivery only), the
  note "We estimate your city from your connection to show nearby stock and
  stores. We don't store your location.", closes on choice and on Esc; focus
  returns to the chip. A polite live region announces "Now shopping in
  Orlando" (AC11).
- **Phones (changed during implementation, 2026-11-10):** at 360 px the logo
  (320×55 source, ~186 px at header height), the cart and a pill do not fit —
  the logo was squeezed to 29 px. Below 640 px the pill is hidden and the city
  is a **full-width 44 px strip under the header**, "📍 Shopping in Miami ·
  Change", rendered by `StickyHeader` **outside** the sticky block so it
  scrolls away. Same HTML for everyone; CSS picks pill or strip.

## Reuse first

- `locationsConfig` (`geo`, `city`, `name`) and `locationsData` ids (the ids
  checkout already uses for `pickupStoreId`).
- 041: `getCachedSetCandidates`, `setGroupOf`, `toSetUnit`/`SetUnit`,
  `byPreference` order (exported as a helper), `storeCity` (Warehouse = Miami,
  D7), and `fetchTireById` + `mapTireRecordToSingleTire` + the ID validation of
  `/api/tire-sets/replacement`.
- `buildTireSlug` for the link to the best match.
- Popover pattern from `HomeMoreFilters`; Cart button styles in `Header.tsx`.
- `trackEvent` / `data-track`, `EVENTS` in `analyticsEvents.ts`.
- `withLogging`, `createRateLimiter` (light limit on the elsewhere route).

## Files to add / change

**New**

- `src/app/utils/visitorCity.ts` — pure: `distanceMiles(a, b)`,
  `cityFromPosition(lat, lng) → { city, nearestStoreId } | null` (60-mile rule
  from `locationsConfig`), storage read/write with expiry (`readChoice`,
  `writeChoice`, `readGuess`, `writeGuess`), `resolveCity(choice, guess)`.
  No imports from server code (it is used by the client and the route).
- `src/app/api/visitor-city/route.ts` — `GET`: headers parsed with **Zod** (latitude −90…90, longitude −180…180) → `cityFromPosition`
  → JSON, `no-store`; missing/invalid headers → `{ city: null }`.
- `src/app/context/VisitorCityContext.tsx` — provider + `useVisitorCity()`.
- `src/app/ui/components/CityChip/CityChip.tsx` — chip + popover panel.
- `src/app/ui/components/OtherCityMatch/OtherCityMatch.tsx` — client: given
  `{ tireId, tireCity }`, when the visitor's city differs, fetch the match and
  render "· N like this in {city} →" (`data-track="city_match_open"`).
- `src/app/api/tire-sets/elsewhere/route.ts` — `GET ?id=&city=`: validate
  with **Zod** (`id` = 1–12 digits, `city` enum), `fetchTireById` → group with the **other** city →
  `getCachedSetCandidates` → count (any tread, D6; the 041 query returns at
  most 60, so 60 is shown as "60+") + best match by 041 order
  relative to this tire's tread → `{ count, href }` (or `{ count: 0 }`);
  `s-maxage=60`; same city as the tire → 400.

**Changed**

- `src/app/utils/tireSets.ts` — export `closestMatch(reference, candidates)`
  (041 preference order) for the elsewhere route.
- `src/app/layout.tsx` — wrap with `VisitorCityProvider`.
- `src/app/ui/sections/Header/Header.tsx` — `CityChip` beside the cart.
- `src/app/ui/sections/TireInformation/TireInformation.tsx` — the "Located in
  {city}" line (server-rendered for all) with `OtherCityMatch` inline (client).
  No server imports (the barrel trap from 041).
- `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` — preselect the
  nearest store under FR6's conditions.
- `src/app/utils/analyticsEvents.ts` — `CITY_CHANGED` ('city_changed', params
  `city`, `from: guess|choice|none`), `CITY_MATCH_OPEN` ('city_match_open').
- `src/app/(shop)/legal-policies/page.tsx` — "Your city" item in the privacy
  section (FR8).
- `spec/tech-stack.md` — a "Visitor city (043)" paragraph.

## Data & flow

1. Page renders as today (cached). `VisitorCityProvider` mounts:
   `readChoice()` (≤ 90 days) → else `readGuess()` (≤ 1 day) → else
   `fetch('/api/visitor-city')` → `writeGuess()`.
2. Header chip renders "Set city" until resolved, then the city — same box.
3. Visitor picks a city → `writeChoice()` → context updates → chip, tire line
   and checkout react; `city_changed` sent with the city only.
4. Tire page: `OtherCityMatch` sees `visitorCity && visitorCity !== tireCity`
   → `GET /api/tire-sets/elsewhere?id={id}&city={visitorCity}` → renders the
   link to `/tires/{slug}` of the best match, or nothing.
5. Checkout: on `fulfillmentMethod === 'pickup'` with `pickupCity ===
   visitorCity` and no store selected → `setPickupStoreId(nearestStoreId)` if
   allowed. The visitor's choice of a different city than the guess means the
   guessed nearest store is not used.

DB load: one cached (60 s, per group) query, only for visitors whose city
differs from the tire's — the same query 041 already runs for the tire's own
city.

## Acceptance criteria → implementation

| AC   | How it's met | How it's verified/tested |
| ---- | ------------ | ------------------------ |
| AC1  | Route → `cityFromPosition` → provider → chip | Unit: Cutler Bay / Hialeah coords → Miami; Kissimmee coords → Orlando. Route test with headers. Chip test renders "Miami" |
| AC2  | > 60 mi or no headers → `null`; consumers do nothing | Unit: Tampa, Jacksonville, NYC → null; chip shows "Set city"; checkout/tire tests unchanged with null |
| AC3  | `mg_city_choice` 90 days, read first | Unit: expiry boundary; provider test: choice beats guess; no consent dependency |
| AC4  | Elsewhere route + `OtherCityMatch` | Route tests (count any tread, Warehouse as Miami, href of closest tread → unpatched → cheaper); component test text + href; manual with a real Orlando tire from Miami |
| AC5  | `count: 0` → nothing appended | Route + component tests |
| AC6  | Checkout effect with `nearestStoreId` | Component test: pickup + Miami cart + Miami visitor → nearest selected, changeable |
| AC7  | Conditions not met → no preselect | Component tests: Orlando cart, mixed cart, no city, chosen city ≠ guess |
| AC8  | No server reads of geo outside the route; fixed-size chip; same-line match | Guard test: only `api/visitor-city` reads `x-vercel-ip-*`; layout/pages import nothing city-aware on the server; manual CLS check (Lighthouse/DevTools) on detail and home |
| AC9  | Storage holds city + store id; events hold city | Unit on storage shape; event payload tests; route never logs coords (test logger calls) |
| AC10 | Privacy item | Render test of the policy text |
| AC11 | Popover + fieldset + live region + 44 px | Component tests (roles, labels, Esc, focus return, announcement); manual VoiceOver/TalkBack at 360 px |
| AC12 | `city_changed`, `data-track="city_match_open"` | Tests on payloads (city only) |
| AC13 | Missing headers → null; fetch failure → null | Route + provider tests |
| AC14 | Catalog untouched | No change to `/tires` code paths; existing tests green |

## Tradeoffs / alternatives

- **Proxy cookie (roadmap idea) vs API route:** the proxy would see every
  request, bots included, and currently runs `auth()`; an API call once per
  visitor per day from real browsers is far cheaper and keeps pages cacheable.
- **Server-rendering both cities' matches into the page:** no client fetch,
  but a second group query on every detail render (bots render ~1/s and the
  mssql pool has saturated before). Rejected in favor of the on-demand route.
- **Cookie vs `localStorage`:** nothing on the server needs the city, so a
  cookie would only add bytes to every request. `localStorage` it is.
- **Browser GPS:** out of v1 (spec).

## Risks

- **Geo accuracy:** IP location can be off (mobile carriers, VPNs). The chip
  always shows the assumption and changes in one tap; 60 miles keeps edge
  cases at "no city" rather than wrong.
- **Shared JS budget:** the provider and chip load on every page (shared
  First-Load 166 / 180 KB). Keep both small (no libraries); check
  `perf:budget`.
- **Repeated wording:** for a tire in the visitor's own city the page shows
  "Located in Miami" by the specs and 041's "We have N more of this tire in
  Miami" in the set block — kept apart (specs vs set block) and reviewed in the
  manual check.
- **CLS:** chip box fixed; tire line exists for everyone and the match is
  appended inline (short text, fits 360 px). Verified manually.
- **Header crowding on phones** — checked at 360 px with the cart and menu.
- **`modern-web-guidance` unavailable** — UX notes to be revalidated when it is.

## Out of scope

Catalog ranking/filtering by city (D1), browser GPS, city-specific pricing or
URLs, anything from 042.

---

_The concrete steps live in [tasks.md](./tasks.md)._
