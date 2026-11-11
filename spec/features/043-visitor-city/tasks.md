# Tasks — Shop by your city (Miami or Orlando)

> T9–T10 (city chip) were built, tested and then removed by spec D8 after the
> owner's review; T2 lost the choice half (estimate only).

> Feature: `043-visitor-city` · Based on: [plan.md](./plan.md) · Created: 2026-11-10

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. No new dependencies, env vars or Vercel settings are needed.

## 1 · Pure logic

- [x] **T1** — `distanceMiles` and `cityFromPosition(lat, lng)` (nearest store
      from `locationsConfig`, 60-mile rule, returns `{ city, nearestStoreId }`
      with `locationsData` ids, or `null`) · files:
      `src/app/utils/visitorCity.ts` (+ test) · check: Cutler Bay and Hialeah
      coords → Miami with the right store id; Kissimmee → Orlando; Tampa,
      Jacksonville, New York → null; invalid numbers → null.
- [x] **T2** — Storage helpers with expiry: `readChoice`/`writeChoice` (90 days,
      `Miami | Orlando | none`), `readGuess`/`writeGuess` (1 day),
      `resolveCity(choice, guess)`; try/catch around storage · files:
      `src/app/utils/visitorCity.ts` (+ test) · check: choice beats guess,
      "none" choice beats a guess, expiry boundaries, corrupt JSON and throwing
      storage → treated as empty; stored shape holds no coordinates.
- [x] **T3** — `closestMatch(reference, candidates)` exported from the 041
      engine (tread closest → unpatched → cheaper → id) · files:
      `src/app/utils/tireSets.ts` (+ test) · check: order cases; units without
      tread last; empty → null.

## 2 · Server

- [x] **T4** — `GET /api/visitor-city` · files:
      `src/app/api/visitor-city/route.ts` (+ test) · check: headers parsed with
      Zod (out-of-range → null); Vercel lat/long headers → city + store; missing/garbage headers → `{ city: null }`;
      `Cache-Control: private, no-store`; coordinates absent from the body and
      from logger calls.
- [x] **T5** — `GET /api/tire-sets/elsewhere?id=&city=` · files:
      `src/app/api/tire-sets/elsewhere/route.ts` (+ test) · check: Zod — invalid id
      or city → 400; city equal to the tire's → 400; unknown tire → 404 JSON;
      count includes any tread and Warehouse units for Miami; `href` is the
      closest-tread match's `/tires/{slug}`; 60 results → `count: 60` shown as
      "60+"; none → `{ count: 0 }`;
      `s-maxage=60`; repository error → `{ count: 0 }` without detail; local
      rate limit.

## 3 · Client state

- [x] **T6** — `VisitorCityProvider` + `useVisitorCity()` (choice → guess →
      one fetch, **lazy: only when a consumer asks**; `setChoice`; `status:
      'pending' | 'ready'`) · files: `src/app/context/VisitorCityContext.tsx`
      (+ test) · check: no fetch with no consumer (dashboard); no fetch when a
      valid choice or guess exists; one fetch otherwise; fetch failure → null
      city; `setChoice` persists and updates consumers.
- [x] **T7** — Mount the provider in the root layout · files:
      `src/app/layout.tsx` · check: app renders; existing layout tests green.
- [x] **T8** — Analytics names `CITY_CHANGED` ('city_changed', params `city`,
      `from`) and `CITY_MATCH_OPEN` ('city_match_open') · files:
      `src/app/utils/analyticsEvents.ts` · check: no collision with retired
      events; tests green.

## 4 · UI

- [x] ~~**T9**~~ (removed by D8) — `CityChip`: fixed-size 44 px pill (pin + city, or "Set city"
      while pending/none), native `popover` panel with a `fieldset` of Miami /
      Orlando / Not in Florida, privacy line, Esc closes, focus returns to the
      chip, polite live region "Now shopping in {city}", `city_changed` on
      choice · files: `src/app/ui/components/CityChip/CityChip.tsx` (+ test) ·
      check: roles/labels, keyboard, announcement, event payload (city only),
      same box width for all labels.
- [x] ~~**T10**~~ (removed by D8) — Put `CityChip` in the header next to the cart (desktop and
      phone) · files: `src/app/ui/sections/Header/Header.tsx` · check: header
      tests green; manual at 360 px with cart and menu, no wrap.
- [x] **T11** — `OtherCityMatch`: fetches only when the visitor's city differs
      from the tire's; renders inline "· N like this in {city} →" linking to
      `href` with `data-track="city_match_open"`; "60+" at 60; nothing on 0, error or
      no city · files: `src/app/ui/components/OtherCityMatch/OtherCityMatch.tsx`
      (+ test) · check: no fetch for same city or null; text and href; error
      silent.
- [x] **T12** — "Located in {city}" line on the tire page (server-rendered for
      everyone) with `OtherCityMatch` inline · files:
      `src/app/ui/sections/TireInformation/TireInformation.tsx` (+ test),
      guard update if needed · check: line rendered next to the key specs for Miami and Orlando
      tires, apart from the set block; no server/DB imports added to `TireInformation` (041 barrel
      guard green).
- [x] **T13** — Checkout: preselect `nearestStoreId` when pickup is chosen,
      the cart's single city equals the visitor's city, no store is selected
      and the store is allowed · files:
      `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` (+ test) ·
      check: preselected and changeable; not for Orlando cart, mixed cart, no
      city, a chosen city different from the guess, or a chosen city with no
      guess at all.

## 5 · Privacy, guards, docs

- [x] **T14** — Privacy policy item "Your city" (estimate from the network,
      not stored, how to change, remembered 90 days on the device) · files:
      `src/app/(shop)/legal-policies/page.tsx` (+ test) · check: text
      rendered.
- [x] **T15** — Guard test: only `src/app/api/visitor-city/route.ts` reads
      `x-vercel-ip-*`; no page/layout uses `headers()`/`cookies()` for the city;
      `/tires` code untouched · files:
      `src/app/utils/visitorCity.guard.test.ts` · check: green.
- [x] **T16** — Docs: tech-stack "Visitor city (043)" paragraph; roadmap note ·
      files: `spec/tech-stack.md`, `spec/roadmap.md` · check: reviewed.

## 6 · Verification

- [x] **T17** — Manual end to end (local, guess faked through stored values
      since local has no Vercel geo headers; then on a Preview deploy for the
      real headers — **the user pushes the branch, or authorizes that push,
      for this step**): chip states; change city and reload; Orlando tire seen
      from Miami (link to the closest match) and with no match; checkout
      preselect and its exceptions; 360 px; VoiceOver/TalkBack on chip and
      panel; CLS on home and a tire page (DevTools Performance / Lighthouse);
      HTML of a tire page identical with different stored cities (view-source)
      · files: `results.md` · check: table filled.
- [x] **T-tests** — new modules covered (T1–T15); full suite · check:
      `npm test` green.
- [x] **T-DoD** — `npx tsc --noEmit` + `npm run lint` + `npm test` +
      `npm run build` + `npm run perf:budget` (shared First-Load ≤ 180 KB)
      green; manual check on home, a tire page and `/checkout` · check:
      recorded in `results.md`.

## Traceability

| Task  | Acceptance criteria         |
| ----- | --------------------------- |
| T1    | AC1, AC2                    |
| T2    | AC3, AC9                    |
| T3    | AC4                         |
| T4    | AC1, AC2, AC9, AC13         |
| T5    | AC4, AC5                    |
| T6    | AC1, AC2, AC3, AC13         |
| T7    | AC1                         |
| T8    | AC12                        |
| T9    | AC1, AC2, AC3, AC8, AC11, AC12 |
| T10   | AC1, AC8, AC11              |
| T11   | AC4, AC5, AC12              |
| T12   | AC4, AC5, AC8               |
| T13   | AC6, AC7                    |
| T14   | AC10                        |
| T15   | AC8, AC9, AC14              |
| T16   | — (docs)                    |
| T17   | AC1–AC14 (manual)           |
| T-DoD | all                         |
