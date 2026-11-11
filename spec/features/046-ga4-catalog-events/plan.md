# Plan — Catalog and search events in GA4

> Feature: `046-ga4-catalog-events` · Based on: [spec.md](./spec.md) · Created: 2026-11-11

## Technical approach

Everything rides on what 040 built: `toGaItem` / `cartPayload`
(`src/app/utils/ecommerce.ts`) describe a tire, `trackEcommerce`
(`src/app/utils/analytics.ts`) sends items to GA4 and a flat summary to Vercel,
and `InteractionTracker` turns `data-track-*` attributes into event params.
This feature adds **builders** for the new payloads, **one hook** for lists,
and wiring at a handful of call sites.

1. **Payload builders (pure, in `ecommerce.ts`).**
   - `listPayload(list, tires, offset)` → `{ item_list_id, item_list_name,
     items }`, each item = `toGaItem(tire)` + `item_list_id`, `item_list_name`,
     `index` (position on the whole result: `offset + i + 1`).
   - `selectPayload(list, tire, index)` → the same, one item.
   - `searchParams(w, s, d, brands, condition)` → `{ search_term, tire_width,
     tire_profile, tire_rim, tire_brand, tire_condition }`; `search_term` is
     `225/45R17`, a partial `225/45` / `R17`, cut to 100 characters.
   - `LISTS` — the fixed ids and names (FR3).
2. **Lists — `view_item_list` and `select_item`.** `TireCard` already renders
   every catalog list (`TireResults` for `/tires`, `TireGrid` for
   `/tires/new`, `/tires/used`, brand and size pages). It gets an optional
   `list` prop (`{ id, name }`) and `indexOffset`:
   - a `useViewItemList(list, products, offset)` hook sends
     `view_item_list` when the **result key** (list id + ordered tire ids)
     changes, and skips a key equal to the last one sent in this tab
     (module-level), so a re-render or coming back to the same result does
     not resend (D1, FR10);
   - the two links to the tire page (photo and title — the card's other
     links go to brand, size or condition pages) get `onClick` →
     `select_item` with the tire, list and index (D2). Add to Cart keeps its
     own `stopPropagation` and `add_to_cart`.
   - No `list` prop → nothing is sent (other surfaces unaffected).
3. **Chat sets.** `ChatSetCard` gains `size` and `units: { id, price }[]`
   (still nothing internal). `ChatSetCards` sends one `view_item_list`
   (`chat_sets`) with every tire of the cards, `index` = the card's position,
   and on "Review set" a `select_item` with that set's tires at its position
   (AC4). The existing `chat_set_open` `data-track` stays.
4. **Cart — `view_cart` and `remove_from_cart`.**
   - `CartModal`: an effect on `showCartModal` turning `true` with items →
     `view_cart` with `cartPayload(cartItems)` (D3). Nothing on `/checkout`.
   - Removals are reported **at the shopper's controls**, not in
     `CartContext` (which the checkout also calls when a tire sold — D4): a
     helper `trackRemoval(lines)` wraps the remove buttons in `CartModal`
     (one tire, a set) and in `Checkout` (one tire, a set, "Remove the
     {city} tire"). The sold-tire path (`Checkout.tsx`, `removeFromCart(soldId)`)
     is left untouched.
5. **Search — GA4 `search` (D5).** All three searches end on `/tires` with the
   size in the URL (`w`, `s`, `d`; plus `brands`, `condition` from the home
   filters): the home size search, the home text search (which accepts only a
   full size) and the size facets of the `/tires` rail. So the event is sent
   **once, where the search lands**: a `useSearchEvent()` hook in
   `SearchResults` reads `w`/`s`/`d` and sends `search` when **the size**
   changes and has at least one part; `brands` and `condition` ride along as
   `tire_brand` / `tire_condition` when present but never trigger it, so a
   brand chosen in the rail with a size set stays a `filter_apply` (spec FR6).
   One place, no duplicate between the home button and the arrival, and no
   keystrokes. A reload of the same search does not resend (tab-level last
   key).
   - **Not `data-track`, on purpose:** `tech-stack.md` asks for declarative
     tracking of *clicks*; this event is the result of a navigation, not a
     click — like the AI chat's outcome events — so it goes through
     `trackEvent` from the hook. A rail size facet therefore sends two
     events, `filter_apply` (the click) and `search` (the landing): two
     facts, explained in the consultant note.
6. **Filters with their values (FR7, D6)** — declarative, as the stack asks:
   - `apply_home_filters` (`HomeMoreFilters`): add
     `data-track-tire-brand={brands.join(',')}` and
     `data-track-tire-condition={condition.join(',')}`; `value` (the count)
     stays.
   - `filter_apply` (`FacetGroup`, `SearchableFacet`, `RangeFacet`): add
     `data-track-filter-group={trackGroup}` and
     `data-track-filter-value={value}`; `label` stays.
   `InteractionTracker` already forwards them as `tire_brand`,
   `tire_condition`, `filter_group`, `filter_value`.
7. **Consultant note.** `spec/features/046-ga4-catalog-events/consultant-note.md`
   (Spanish, like 040's): the new events, when each fires, the list ids, the
   parameter names to register as custom dimensions, and that the missing
   `items` they saw are production running pre-040 code.

## Reuse first

- `toGaItem`, `cartPayload`, `STORE_CURRENCY`, `money` (040) — the one way a
  tire becomes a GA4 item.
- `trackEcommerce` (040) — GA4 with items + Vercel flat summary; consent is
  already applied inside `gaEvent` / `ecommerceEvent` via `consent.ts`.
- `EVENTS` (`analyticsEvents.ts`) — add `VIEW_ITEM_LIST`, `SELECT_ITEM`,
  `VIEW_CART`, `REMOVE_FROM_CART`, `SEARCH` (GA4 recommended names).
- `InteractionTracker` — extra `data-track-*` → params (no change).
- `TireCard` (every listing), `TireResults`, `TireGrid`, `SearchResults`
  (page/sort/filter state), `CartModal`, `Checkout`, `HomeMoreFilters`,
  `FacetGroup` / `SearchableFacet` / `RangeFacet`, `ChatSetCards`,
  `chatSets.ts` (044).
- Test patterns: `ecommerce.test.ts` (exact key sets), `analytics` mocks in
  component tests, `FilterRail/tracking.guard.test.ts`.

## Files to add / change

- `src/app/utils/ecommerce.ts` (+ test) — `LISTS`, `listPayload`,
  `selectPayload`, `searchParams`.
- `src/app/utils/analyticsEvents.ts` — five event names.
- `src/app/ui/components/ViewItemList/useViewItemList.ts` (new, + test) — the
  list hook (result key, tab-level dedupe).
- `src/app/ui/sections/TireCard/TireCard.tsx` (+ test) — `list`,
  `indexOffset`; hook; `select_item` on the two detail links.
- `src/app/ui/components/TireResults/TireResults.tsx`,
  `src/app/(shop)/tires/container/TireGrid/TireGrid.tsx` — pass `list` and
  `indexOffset` through.
- `src/app/(shop)/tires/container/SearchResults.tsx` — `list = LISTS.catalog`,
  `indexOffset = (page − 1) × pageSize`; `useSearchEvent()`.
- `src/app/(shop)/tires/new/page.tsx`, `used/page.tsx`,
  `brands/[brand]/page.tsx`, `size/[size]/page.tsx` — the list for each
  (`new_tires`, `used_tires`, `brand_tires` "Brand: X", `size_tires`
  "Size: X"). Brand and size pages are the same component; leaving them
  unnamed would make them invisible in the list report.
- `src/app/ui/components/SearchEvent/useSearchEvent.ts` (new, + test).
- `src/app/ui/sections/CartModal/CartModal.tsx` (+ test) — `view_cart`;
  removals.
- `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` (+ test) —
  removals at the three shopper controls.
- `src/app/utils/cartTracking.ts` (new, + test) — `trackRemoval(lines)`,
  `trackViewCart(lines)` (thin, so both screens share them).
- `src/app/utils/chatSets.ts`, `src/app/ui/components/AiChat/ChatSetCards.tsx`
  (+ tests) — `size`, `units`; list and select.
- `src/app/ui/components/HomeMoreFilters/HomeMoreFilters.tsx`,
  `FilterRail/FacetGroup.tsx`, `SearchableFacet.tsx`, `RangeFacet.tsx`
  (+ tracking guard) — the new `data-track-*` attributes.
- `spec/features/046-ga4-catalog-events/consultant-note.md` — new.
- `spec/tech-stack.md` — one line under Analytics: list, cart and search
  events and where they fire.

## Data & flow

```
/tires?w=225&s=45&d=17&page=2   (home Search, text search or rail facet)
  SearchResults
    useSearchEvent  → search {search_term:"225/45R17", tire_width:225, …}   (key changed)
    TireResults → TireCard(list=catalog, indexOffset=20)
      useViewItemList → view_item_list {item_list_id:"catalog", items[21..40]}
      click photo/title of #23 → select_item {items:[{…, index:23}]} → /tires/{slug}
                                                               → view_item (040)
cart icon → CartModal open → view_cart {currency, value, items}
remove (drawer / checkout / "Remove the Orlando tire") → remove_from_cart {items removed}
sold tire removed by checkout → nothing (D4)
chat cards shown → view_item_list chat_sets; "Review set" → select_item (+ chat_set_open)
```

GA4 receives items; Vercel receives `item_list_id`, `item_count`, `value`,
`currency`, `search_term`… (040's flattening). Consent as in 040.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `TireCard` + `useViewItemList` with `LISTS.catalog`, offset 0 | hook test (payload, 20 items, index 1–20); manual in GA4 DebugView |
| AC2 | result key changes on page/filter/sort; `indexOffset` from `SearchResults`; same key skipped | hook test (new key sends, same key not, page 2 → 21–40) |
| AC3 | `onClick` on the photo and title links only | `TireCard` test: both links send `select_item` (used_tires, index 3); Add to Cart sends `add_to_cart` only |
| AC4 | `ChatSetCards` list + select with set units | `ChatSetCards` test |
| AC5 | `CartModal` effect; nothing in `Checkout` | `CartModal` test; `Checkout` test asserts no `view_cart` |
| AC6 | `trackRemoval` at the drawer and checkout controls | `CartModal` + `Checkout` tests (one tire, set of 4 once, city removal) |
| AC7 | sold path untouched | `Checkout` test: sold replacement path sends no `remove_from_cart` |
| AC8 | `useSearchEvent` keyed on the size only + `searchParams()` | builder tests (full, partial); hook test (new size sends, same size not, brand change with size set not) |
| AC9 | `data-track-tire-brand`, `-tire-condition` on Apply | `HomeMoreFilters` test reads the attributes; count kept |
| AC10 | `data-track-filter-group`, `-filter-value` | rail tests + tracking guard |
| AC11 | builders name every key; items = 040 keys + list keys | exact key-set tests in `ecommerce.test.ts` |
| AC13 | brand and size pages pass `brand_tires` / `size_tires` with the page's brand or size | `TireGrid` render test per list; manual |
| AC12 | `trackEcommerce` / `trackEvent` already consent-gated for GA4, ungated for Vercel | existing analytics tests; one assertion of the Vercel summary for `view_item_list` |

## Tradeoffs / alternatives

- **`search` at the landing vs. at each button** — at the landing: the three
  searches share one end (`/tires` with the size in the URL), so one hook
  covers them with no duplicates and no keystroke noise. Cost: a search with
  an invalid size that never reaches `/tires` is not counted (it returns
  nothing anyway).
- **Removals in `CartContext` vs. at the controls** — at the controls:
  the context cannot tell the shopper's removal from the checkout's
  sold-tire clean-up (D4).
- **`view_item_list` with all 20 items** — D1. 20 items is far below GA4's
  200; the payload is a few KB per page.
- **Intersection-based list views** (only tires scrolled into view) — rejected
  for now: more code on the busiest page, and GA4's list reports work on
  "shown".

## Risks

- **Vercel Analytics volume.** `view_item_list` fires on every catalog page
  view; the catalog is the most visited page. Vercel custom events count
  toward the plan's quota. Mitigation: measure a week after release
  (`aggregate_events`); if it matters, send `view_item_list` to GA4 only
  (`vercel: false`), as `purchase` already does. Bots that do not run JS
  send nothing.
- **Double `select_item`** if the photo and title links are both inside one
  clickable area — they are separate links; tested.
- **Back/forward**: the tab-level last key means returning to the same list
  sends nothing (D1). A new tab sends it again — correct, it is a new view.
- **040 not yet in production**: the consultant can only see the full funnel
  after publishing; validate in a Preview with DebugView (`debug_mode`).

## Out of scope

- Publishing 040 / 046, `purchase` validation in Preview (follow-ups).
- GA4 custom-dimension setup (consultant), promotions, refunds, dashboard.

---

_The concrete steps live in [tasks.md](./tasks.md)._
