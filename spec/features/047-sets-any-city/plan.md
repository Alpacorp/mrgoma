# Plan — Sets and pickup across Miami and Orlando

> Feature: `047-sets-any-city` · Based on: [spec.md](./spec.md) · Created: 2026-11-13

## Technical approach

The city is a **filter** in three places today: the set group query (041), the
set engine (`eligible`, `pickReplacement`, `cheapestSet`, `resolvePresetSet`)
and pickup (checkout pre-filter + `create-session` 409 `code: 'city'`). 047 turns
it into a **tie-breaker** in the engine and removes it from the group and from
pickup. Nothing new is built; code is mostly deleted.

1. **Group without city.** `SetGroup.city` becomes optional. `setGroupOf()`
   leaves it out, so the tire page, the sold-tire replacement and 045's sold
   page read **one** group spanning both cities. Only 043's "N like this in
   {city}" (`/api/tire-sets/elsewhere`) still passes a city, because it counts
   the tires in one city. The query adds the `VaultName` filter only when a
   city is given; the cache key says `any` otherwise. `VaultName` is still read
   only to derive `city` and never returned.
2. **Engine: city as the last tie-break (D3).** `eligible()` drops
   `c.city === anchor.city`. `byPreference(reference, city?)` adds
   `Number(a.city !== city)` **after** tread, patch and price and before id, so
   it can never outrank them. `suggestSet`/`swapOptions` pass the anchor's
   city, `pickReplacement` the first kept tire's (spec FR3, checkout case). `cheapestSet` (chat) loops
   over the whole pool instead of per city, with an optional `preferCity`
   tie-break between units.
3. **Chat (D7, D8).** `pickChatSets`:
   - named city → `bestSets` on that city's units first; if none, `bestSets`
     on all units with the new outcome `any_city` ("none all in Orlando; these
     can be picked up there"); then the `smaller` ladder on all units;
   - no named city → `bestSets` on all units; the visitor's city sorts only
     after patched count and total (today it sorts first);
   - `other_city` is removed. A card carries `cities: TireCity[]` (sorted)
     instead of `city`, shown as "Miami and Orlando" when mixed.
   The prompt and the step-1 tip lose "same city" and the pickup rule.
4. **Pickup at any store (D2, D4, D9).** `create-session` loses the city check
   and the `code: 'city'` 409. Checkout offers `locationsData` (all 7 stores)
   always, drops the mixed-city notice, "Remove the {city} tire", the
   "only {city} stores are shown" line and the `code: 'city'` error branch,
   and preselects `visitor.nearestStoreId` whenever the visitor's city is
   known. The "24–48 business hours" text stays. `cartCities`, `oddCity` and
   `CityTag`'s `odd` style go (no caller left).
5. **Where each tire is (D5).** Each tire keeps its `CityTag`. Where a set's
   city was shown once (cart set header, set panel header, chat card), it shows
   the set's cities — one, or "Miami and Orlando". In the set builder each unit
   row and swap option names its city when the candidates span both cities,
   and "N more of this tire in {city}" becomes "N more of this tire" (+ "in
   Miami and Orlando" when mixed). In the drawer and at checkout, the members
   of a **mixed** set each get their `CityTag` (today only the set header has
   one); a one-city set stays as today.

UI tasks (builder, panel, checkout, drawer) start with the
`modern-web-guidance` skill (project rule), even though they only change text
and tags.

## Reuse first

- `storeCity()`, `ORLANDO_VAULTS` (city from `VaultName`, 043/041) — unchanged.
- `CityTag` — already the one way a cart line shows its city.
- `locationsData` + `useVisitorCity().nearestStoreId` (043) — the preselect.
- 041's engine and its tests; 044's `bestSets`/`toChatSetCard`; 046's
  `trackRemoval` (one caller fewer).
- `closestMatch` (043/045) — unchanged; it never looked at the city.

## Files to add / change

- `src/repositories/tireSetsRepository.ts` — `SetGroup.city?`; `setGroupOf`
  without city; `setGroupKey` → `any` when absent; `buildSetCandidatesQuery`
  adds the city clause only with a city.
- `src/app/utils/tireSets.ts` — `eligible` without city; `byPreference(ref,
  city?)`; `pickReplacement` without the city filter; `cheapestSet(units,
  size, preferCity?)` over one pool; module doc (D2 rule list).
- `src/app/utils/chatSets.ts` — `groupKey` without city; `pickChatSets` per
  D7/D8; outcome `any_city` replaces `other_city`; `ChatSetCard.cities`;
  `resolvePresetSet` without `unit.city === anchor.city`.
- `src/app/api/_lib/aiChat/sets.ts` — messages for `any_city`, no
  `other_city`; tip text without "same city"; history line with cities.
- `src/app/api/tires/ai-chat/route.ts` — prompt: compatible across cities,
  pickup at any store; `buildSetsMessage` inputs (`city` → none).
- `src/app/ui/components/AiChat/ChatSetCards.tsx` — show `cities`;
  `data-track-city` = joined label.
- `src/app/api/tire-sets/elsewhere/route.ts` — `setGroupOf` no longer carries
  a city: compare the tire's own `city` and pass `{ ...group, city }`.
- `src/app/ui/sections/TireSet/SoldTireAlternative.tsx` — one group query
  instead of two (both cities are one group now).
- `src/app/api/tire-sets/replacement/route.ts` — no change of code; its doc
  loses "and city".
- `src/app/ui/sections/TireSet/TireSetBuilder.tsx`, `TireSetPanel.tsx` — city
  texts per D5 (unit rows, swap options, "N more", panel header).
- `src/app/api/checkout/create-session/route.ts` — remove the pickup-city
  check and `code: 'city'`.
- `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` — remove
  `cartCities`/`oddCity`/`mixedCities`/`cityCounts`/`pickupCity`, the notice,
  the remove-city control, the `code: 'city'` branch; all stores; preselect
  per D9; set header shows the set's cities.
- `src/app/ui/sections/CartModal/CartModal.tsx` — no `oddCity`; set header
  shows the set's cities.
- `src/app/utils/cartSets.ts` — delete `cartCities`, `oddCity`; add
  `citiesLabel(cities)` ("Miami", "Miami and Orlando") shared by cart,
  checkout, panel and chat cards.
- `src/app/ui/components/CityTag/CityTag.tsx` — drop `odd`.
- `src/app/utils/analyticsEvents.ts` — docs: `outcome` values (`any_city`
  instead of `other_city`), no "Remove the {city} tire".
- Tests next to each file (see the AC table); `create-session/route.test.ts`,
  `cartSets.test.ts`, `chatSets.test.ts`, `sets.test.ts`, `tireSets.test.ts`,
  the prompt guard.
- Docs: `spec/tech-stack.md` (tire sets bullet), 041's spec header note
  ("D1/D5 superseded by 047"), the 046 consultant note row for
  `remove_from_cart` ("Remove the {city} tire" no longer exists), roadmap.

## Data & flow

- **DB:** same columns, same `STOREFRONT_SELLABLE_WHERE`, `TOP 60`, same order
  (tread desc, price). The group drops the city clause. Measured 2026-11-13:
  1,910 groups; 392 with ≥ 4 units; **12 reach 4 only by joining cities**; 7
  groups exceed the 60-unit cap merged (6 per city before).
- **Cache:** keys `brand|model|size|rf|cond|any` for pages; the elsewhere
  route keeps per-city keys. Per tire page: still one group query. Sold page:
  two → one.
- **API:** `POST /api/checkout/create-session` no longer returns 409
  `code: 'city'`; other 409s unchanged. `GET /api/tire-sets/elsewhere`
  unchanged contract.
- **Client state:** cart lines already carry their own `city` (041); nothing
  stored changes. Old carts work unchanged.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | Group without city; `eligible` without city | `tireSets.test`: Miami anchor + Orlando units → set; repository test: query has no `VaultName` clause without a city |
| AC2 | 2/32" window logic untouched | `tireSets.test`: mixed-city candidates outside 2/32" never chosen |
| AC3 | `swapOptions` via `eligible` | `tireSets.test`; `TireSetBuilder.test`: option text names the city when mixed |
| AC4 | `pickReplacement` without city | `tireSets.test`: only replacement in the other city is returned; `resolvePresetSet` test with a mixed chat set |
| AC5 | `pickChatSets` per D7/D8, `other_city` gone | `chatSets.test`, `sets.test` (no "none in your city" while sets exist) |
| AC6 | All 7 stores; server check removed | `Checkout.test`: Orlando cart lists Miami stores; `route.test`: Orlando tire + Miami store → session created |
| AC7 | Notice, control and branch removed | `Checkout.test`: mixed cart → 7 stores, no notice, no "Remove the" button, pay enabled |
| AC8 | Ready-time text unchanged | `Checkout.test`: mixed cart pickup shows "24–48 business hours" |
| AC9 | Same as AC6 for a single tire | `route.test` |
| AC10 | No new columns; D6 order kept | repository test (no `VaultName`/`Location` in output); existing order tests |
| AC11 | Sold check untouched | existing `route.test` sold cases stay green |
| AC12 | `byPreference` city tie-break | `tireSets.test`: equal tread/patch/price → anchor city; closer tread in other city wins |
| AC13 | `citiesLabel`; per-unit `CityTag` kept | `cartSets.test`; `CartModal.test`/`Checkout.test` set header "Miami and Orlando"; `ChatSetCards.test` |
| AC14 | Elsewhere route passes the city | `elsewhere` route test (exists or added): still counts the other city only |
| AC15 | Named city first, then `any_city` | `chatSets.test` + `sets.test` message names Orlando pickup |
| AC16 | Visitor city after patched and total | `chatSets.test` |
| AC17 | Preselect without `pickupCity` condition | `Checkout.test` with a mocked visitor city; none without it |

Manual (agent, Chrome, real inventory): a tire of one of the 12 newly
buildable groups shows a set with both cities; a mixed cart picks up at any
store and reaches Stripe test mode; the chat with and without "in Orlando".
DoD: `tsc`, lint, tests, build, `perf:budget`.

## Tradeoffs / alternatives

- **Keep per-city queries and merge in memory** (two cached queries per page):
  rejected — doubles the page's queries on a saturated pool; one query
  without the clause is cheaper.
- **Drop the city from the elsewhere route too, filter in memory:** rejected —
  with the 60-unit cap, 5 mixed groups above 60 would under-count "N like this
  in {city}". The route keeps its own city-filtered key.
- **City as a primary preference** (fewer trips before price): rejected by D3.
- **Keep `oddCity`/`CityTag odd` "just in case":** removed — dead code with a
  misleading meaning ("stops pickup").

## Risks

- **60-unit cap on merged groups:** 7 groups exceed it; a low-tread tire in
  one of them may see fewer candidates (true per city already for 6). Same
  mitigation as 041 (cap documented, checked in results); revisit if a
  complaint names one.
- **Promise of ready time when tires travel (D4):** confirmed by the owner on
  2026-11-13 — there are transfers between the cities every day.
- **Old chat links (`?set=`) with mixed sets:** now valid; older same-city
  links still resolve the same.
- **Analytics continuity:** `ai_chat_sets_shown.outcome` loses `other_city`
  and gains `any_city`; noted for the consultant.

## Out of scope

- Transfer fees, a longer ready time, holding tires while paying.
- A catalog "set available" badge (041's D8).
- Production deploy of 040–047.

---

_The concrete steps live in [tasks.md](./tasks.md)._
