# Plan — Build your tire set

> Feature: `041-tire-sets` · Based on: [spec.md](./spec.md) · Created: 2026-11-10

## Technical approach

Three layers, each small and testable on its own:

1. **A pure set engine** (`src/app/utils/tireSets.ts`): given the tire on the
   page and its compatible candidates, it answers which set sizes are possible,
   which units to suggest (D6 order), which swaps keep the set valid, and the
   tread range. No React, no database — every rule in FR1–FR7 is a unit test.
2. **One cached query** (`src/repositories/tireSetsRepository.ts`): the
   compatible candidates of a tire — same brand, `Model2`, `RealSize`, run-flat
   type (`KindSaleId`), condition class and city — under the same "sellable
   online" rule the catalog uses. Wrapped in `unstable_cache` keyed by the
   _group_ (brand + model + size + run-flat + condition + city), so every page of
   a 100-unit group shares one entry. Short revalidation (60 s); staleness is
   caught at checkout (FR13).
3. **UI**: a server component streams the block into the detail page behind
   `<Suspense>` (LCP and the first byte are untouched), and hands plain,
   whitelisted unit data to a small client island that handles size choice,
   swapping and "Add set to cart". The cart learns about sets through an
   optional `setId` on each line; checkout groups by it, restricts pickup by
   city, and offers a replacement when a set tire sold meanwhile.

The server stays the authority: `create-session` re-checks availability (as
today) **and** the pickup city (new), whatever the browser says.

## Reuse first

- `fetchTireById`, `mapTireRecordToSingleTire`, `storeCity`, `ORLANDO_VAULTS` /
  `MIAMI_VAULTS` — the city of a tire and the vault lists for the query.
- The catalog's sellable rule (`Local = '0' AND Trash = 'false' AND Condition !=
'sold' AND Price != 0`, as in `fetchActiveTireIds` / `dimensionsRepository`) —
  extracted to one exported constant instead of a fourth copy.
- `logQuery` / `getPool` for the new query (timing in logs, same pool).
- `unstable_cache` pattern from `src/repositories/cachedCatalog.ts`.
- `locationsConfig[].city` — already there; `locationsData` just has to carry
  it.
- `CartContext` (`addToCart`, `removeFromCart`, `isCartReady`) and its
  `localStorage` persistence; `cartLine()` for names.
- Feature 040: `trackEcommerce`, `cartPayload`, `EVENTS` — the set reaches GA4
  as one `add_to_cart` with every tire.
- `create-session`'s existing 409 `{ unavailable: [{ id, reason }] }` contract —
  extended with a `reason`, not replaced.
- UI patterns: `fieldset`/`legend` radio groups as in the checkout's fulfilment
  choice; `ProductMeta`, `treadDepthLabel`, `patchedNote` from `tireSpecs`.
- Note: the `modern-web-guidance` skill is not available in this environment.
  To honour the project rule anyway, task **T0** researches current guidance
  on the web (WAI-ARIA APG radio group, mobile product configurators,
  `aria-live` totals) and records the decisions in `ux-notes.md` before the UI
  is built.

## Files to add / change

**Add**

- `src/app/utils/tireSets.ts` — types (`SetUnit`, `SetSize = 2 | 3 | 4`) and
  pure functions: `parseTread`, `treadRange`, `isWithinTolerance` (≤ 2/32"),
  `availableSetSizes(anchor, candidates)`, `suggestSet(anchor, candidates, size)`
  (D6: closest tread → unpatched → lower price, searched over every 2/32" window
  that contains the anchor so the best valid set is found, not just the first),
  `swapOptions(set, index, candidates)`, `pickReplacement(keep, candidates)`.
  Units with no tread value are excluded from used-tire sets (the rule cannot be
  verified); new tires use quantity mode (D11).
- `src/app/utils/tireSets.test.ts` — every FR1–FR7 rule, D6 tie-breaks (AC15),
  window search, missing tread, new-tire quantity mode, exact output key set.
- `src/repositories/tireSetsRepository.ts` — `fetchSetCandidates(anchor)`:
  parameterised `SELECT` of **whitelisted** columns (`TireId, Code, Price, Tread,
RemainingLife, Patched, DOT, Image1, ProductTypeId, VaultName` — the last only
  to derive the city server-side, never returned), `TOP 60`, ordered by tread
  distance. `getCachedSetCandidates` wraps it (`revalidate: 60`, tag
  `tire-sets`). Also `fetchSetCandidatesFresh` (uncached) for replacements.
- `src/repositories/tireSetsRepository.test.ts` — SQL is parameterised (no
  interpolation of brand/model/size), uses the shared sellable rule, filters by
  the right vault list per city, never selects `Location`.
- `src/app/ui/sections/TireSet/TireSetSection.tsx` — server component: fetches
  candidates, maps them to `SetUnit` (city only, no `VaultName`), renders
  nothing when no set is possible (FR3/AC3) or when the tire is sold (D12),
  otherwise `<TireSetBuilder>`.
- `src/app/ui/sections/TireSet/TireSetBuilder.tsx` — `'use client'` island:
  size radio group (only feasible sizes), suggested units list (tread, life,
  patched, DOT, thumbnail, price), "Swap" per unit (a native `<select>` of
  `swapOptions`), total + range announced via `aria-live`, "Add set of N to
  cart". Quantity mode for new tires (no unit list, D11). No new dependencies.
- `src/app/ui/sections/TireSet/TireSetBuilder.test.tsx`.
- `src/app/api/tire-sets/replacement/route.ts` — `GET ?sold=<id>&keep=<ids>`:
  loads the sold tire's group (fresh), excludes `keep` and `sold`, returns the
  best compatible unit within 2/32" of the kept units (`pickReplacement`) or
  `null`. Whitelisted fields only; validates ids are numeric and exist; `keep`
  ≤ 3; responses cached 10 s per `sold` id so repeated calls do not reach the
  pool. Public route: Vercel Firewall's bot rules already challenge non-browser
  traffic (see project notes).
- `src/app/api/tire-sets/replacement/route.test.ts`.
- `src/app/api/checkout/create-session/route.test.ts` — new file; covers the
  pickup-city check (and the existing 409 path it extends).

**Change**

- `src/repositories/tiresRepository.ts` (or a tiny `sellableRule.ts`) — export
  the sellable-online SQL condition; `fetchActiveTireIds` uses it (no behaviour
  change).
- `src/app/ui/sections/TireInformation/TireInformation.tsx` — render
  `<Suspense fallback={null}><TireSetSection tire={singleTire} /></Suspense>`
  under the price/add-to-cart row, only when not sold.
- `src/app/context/CartContext.tsx` — `CartItem` gains optional `setId`,
  `city`, `tread`; new `addSetToCart(lines: AddToCartProduct[], setId)` —
  full lines composed by the builder from anchor + unit (adds missing units, skips
  ones already in the cart, opens the cart once) and `removeSet(setId)`;
  `addToCart` copies `city` when given. `removeFromCart` unchanged (the rest of
  the set keeps its `setId`, FR10). Old carts without these fields keep working.
- `src/app/context/CartContext.test.tsx` (new or extended) — set add/remove,
  duplicates, legacy items.
- `src/app/ui/sections/TireCard/TireCard.tsx`, `AddToCartButton.tsx` — pass
  `city` to `addToCart` so pickup can be checked client-side for single tires
  too (AC10).
- `src/app/utils/transformTireData.ts` — include `city` on `TransformedTire`
  (from `storeCity(VaultName)`), if not already exposed by the list API.
- `src/app/ui/sections/LocationsSlider/locationsData.ts` — carry `city`.
- `src/app/ui/sections/CartModal/CartModal.tsx` — group lines by `setId`:
  header "Set of N · 9–10/32 · $total", "Remove set"; singles as today.
- `src/app/(shop)/checkout/container/Checkout/Checkout.tsx`
  - same grouping in the order summary;
  - pickup: compute the cart's cities from `item.city`; offer only stores of
    that city; if mixed, disable pickup with the reason (FR11/AC8–AC10); keep
    "24–48 business hours" (D9);
  - on 409, for each unavailable id that belongs to a set, call the replacement
    route and show "Tire #X sold — replace with #Y (9/32, $…)" + one-click
    accept, or remove it and say the set is smaller (FR13/AC11).
- `src/app/(shop)/checkout/container/Checkout/Checkout.test.tsx` — pickup city
  filtering, mixed cities, replacement accept / none.
- `src/app/api/checkout/create-session/route.ts` — when `fulfillmentMethod ===
'pickup'`, resolve the store's city from `pickupStoreId` and reject (409,
  `reason: 'city'`) items whose `data.city` differs. Uses the city already
  returned by `/api/tire`.
- `src/app/utils/analyticsEvents.ts` — `SET_BUILT: 'set_built'` (sent once when
  a set is added, with `set_size`, `swaps`, `condition`), documented.
- `spec/tech-stack.md` — one line on the set engine and the cart's `setId`.

## Data & flow

```
Detail page (force-dynamic, server)
 ├─ fetchTireById (as today) → SingleTire  ──► LCP content (unchanged)
 └─ <Suspense> TireSetSection
       getCachedSetCandidates(group+city)  ── 1 query / group / 60 s
       → SetUnit[] (city only) → availableSetSizes → none? render nothing
       → <TireSetBuilder anchor, candidates>         (client island)
             size → suggestSet → swap → addSetToCart(setId)
             → trackEcommerce(add_to_cart, N items) + trackEvent(set_built)

Cart / Checkout (client)
 ├─ lines grouped by setId
 ├─ pickup: stores filtered by cart city (item.city); mixed → pickup disabled
 └─ POST create-session ─► server re-checks stock + pickup city
       409 {unavailable:[{id, reason:'sold'|'city'}]}
         sold & in a set → GET /api/tire-sets/replacement → offer / remove
```

**SetUnit** (what reaches the browser):
`{ id, code, price, tread, life, patched, dot, image, condition, city }` —
never `VaultName`, `Location` or `Local`. Brand, model and size are **not**
repeated per unit: they are the anchor's (same group by definition). The
builder composes each cart line as `{ ...anchor brand/model2/size/name,
...unit }` so the cart title (`cartLine`) and the GA4 `item_name`
(`toGaItem`, feature 040) are identical to the ones `view_item` sent for the
same tire.

**Cart line**: today's `CartItem` + optional `setId` (random id per built set),
`city`, `tread`. Stored in the same `localStorage` key; older lines without them
are read as singles with unknown city (server still enforces the city).

No database writes; no schema changes; no new environment variables.

## Acceptance criteria → implementation

| AC   | How it's met                                                                  | How it's verified/tested                                                    |
| ---- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| AC1  | `availableSetSizes` + count text in `TireSetSection`                          | `tireSets.test.ts`; builder test; manual on a 4+ group                     |
| AC2  | Same, one candidate → `[2]`                                                   | `tireSets.test.ts`                                                          |
| AC3  | Query filters (model/size/run-flat/city) + engine tolerance → render nothing | repository + engine tests; section test renders `null`                     |
| AC4  | `suggestSet` includes anchor, distinct ids, sum, `treadRange`                 | engine tests; builder test (four rows, total, range)                       |
| AC5  | `swapOptions` only returns units keeping Δ ≤ 2/32"                            | engine tests; builder swap test                                             |
| AC6  | `addSetToCart` skips existing; one `add_to_cart` with N items                 | CartContext test; builder test asserts `trackEcommerce` payload            |
| AC7  | `removeFromCart` keeps siblings; `removeSet` removes all                      | CartContext + CartModal tests                                               |
| AC8  | Checkout filters `locationsData` by cart city                                 | Checkout test (Orlando cart → only Orlando stores)                         |
| AC9  | Mixed cities → pickup disabled + reason; delivery enabled                     | Checkout test                                                               |
| AC10 | `city` on single-tire lines + server check in `create-session`                | Checkout test; `create-session` route test (409 `reason: 'city'`)          |
| AC11 | 409 → replacement route → accept / remove                                     | replacement route test; Checkout test (both branches)                      |
| AC12 | Suspense streaming, island without deps, radio group + `aria-live`           | builder a11y test (roles, labels); manual 360 px + keyboard; `perf:budget` |
| AC13 | Each tire stays its own Stripe line → own `SC_OrderDetail` row (unchanged)    | Existing session route tests; manual paid set in Stripe test mode          |
| AC14 | Query restricted to the anchor's city vaults                                  | repository test                                                             |
| AC15 | D6 comparator in `suggestSet`                                                 | engine tie-break tests                                                      |
| AC16 | Quantity mode when `condition === 'New'`                                      | engine + builder tests                                                      |
| AC17 | `TireSetSection` returns `null` for sold tires                                | section test                                                                |
| AC18 | No change to `/tires` code paths                                              | diff review; no import of the new repository outside the detail page       |

## Tradeoffs / alternatives

- **Server stream vs. client fetch of candidates.** Fetching from the browser
  would keep the page lighter on the server, but the count ("We have 7 more in
  Miami") would arrive late and shift layout. Streaming behind Suspense keeps the
  text in the HTML for shoppers and crawlers, with no LCP cost.
- **Cache by group vs. by page.** Keying the cache by tire id would miss for
  every page of a 100-unit group; keying by group makes the expensive case
  cheap. Cost: up to 60 s of staleness, absorbed by the checkout re-check and
  the replacement flow.
- **`setId` on cart lines vs. a separate "sets" structure.** A field on each
  line keeps the cart a flat list of unique tires — which is what Stripe, the
  order tables and analytics already expect — and degrades gracefully when one
  tire is removed.
- **Window search vs. greedy pick.** Picking the N closest treads can produce a
  set wider than 2/32" (e.g. anchor 8, units 6 and 10). Trying each 2/32" window
  containing the anchor is still tiny work (≤ 60 candidates) and always finds a
  valid set when one exists.
- **City from the item vs. a lookup at checkout.** Carrying `city` on the cart
  line gives instant feedback; the server check makes it safe for old carts.

## Risks

- **Database load on the detail page.** One more query per detail render (cached
  per group). Pages are crawled heavily (Sept 2026 bot incident). _Mitigation:_
  group-keyed cache, `TOP 60`, whitelisted columns, `logQuery` timing to watch
  in production; if p95 rises, raise `revalidate` or move singletons out
  (most groups of one never need a query — candidates are empty — but we only
  know after querying; a follow-up could cache "no set" results longer).
- **No stock hold while paying** (spec, accepted). Replacement flow limits the
  damage before payment; after payment, manual refund as today.
- **Dirty data.** `Tread` is text (`'10.0'`, `'-'`); `Model2` blank on some
  records. _Mitigation:_ `parseTread` returns `null` → excluded; blank `Model2`
  → no set (a group by brand+size alone would mix models).
- **Legacy cart lines** without `city`: client cannot pre-filter stores; the
  server rejects a wrong-city pickup with a clear message.
- **Seller dashboard shares the cart.** Sets are added only from the shop's
  detail page; dashboard lines simply have no `setId`.
- **JS budget.** One island, no libraries; verify with `npm run perf:budget`.

## Out of scope

- 042 (PDF + WhatsApp), 043 (visitor city) — see roadmap.
- Stock reservation, staggered fitments, vehicle search, catalog badge (D8),
  set discount (D10), sets from a sold tire's page (D12), DB flags (D3).

---

_The concrete steps live in [tasks.md](./tasks.md)._
