# Tasks — Catalog and search events in GA4

> Feature: `046-ga4-catalog-events` · Based on: [plan.md](./plan.md) · Created: 2026-11-11

Each task is one sitting, leaves the build green, and names its check.

## Foundations (pure)

- [x] **T1** — Event names `VIEW_ITEM_LIST`, `SELECT_ITEM`, `VIEW_CART`,
      `REMOVE_FROM_CART`, `SEARCH` · files: `src/app/utils/analyticsEvents.ts`
      · check: tsc; values are GA4's recommended names.
- [x] **T2** — `LISTS`, `listPayload(list, tires, offset)`,
      `selectPayload(list, tire, index)` · files: `src/app/utils/ecommerce.ts`
      (+ `ecommerce.test.ts`) · check: exact key sets (040 item keys +
      `item_list_id`, `item_list_name`, `index`); index = offset + i + 1;
      ≤ 200 items.
- [x] **T3** — `searchParams(w, s, d, brands, condition)` · files:
      `ecommerce.ts` (+ test) · check: `225/45R17`; partial `225/45`, `R17`;
      brands joined; no size → `null`; `search_term` ≤ 100 chars.
- [x] **T4** — `trackViewCart(lines)`, `trackRemoval(lines)` · files:
      `src/app/utils/cartTracking.ts` (+ test) · check: `cartPayload` sent
      under the right names; empty list sends nothing.

## Lists

- [x] **T5** — `useViewItemList(list, products, offset)`: result key, tab-level
      last key · files: `src/app/ui/components/ViewItemList/useViewItemList.ts`
      (+ test) · check: first render sends; same key (re-render, remount)
      does not; new key sends; no list → nothing; the Vercel summary
      (`toVercelEcommerceProps`) of a list carries `item_list_id` and
      `item_count`, no items (AC12).
- [x] **T6** — `TireCard`: `list`, `indexOffset`, hook, `select_item` on the
      photo and title links · files: `src/app/ui/sections/TireCard/TireCard.tsx`
      (+ test) · check: both detail links send `select_item` with list and
      index; brand/size/condition links and Add to Cart do not.
- [x] **T7** — Pass the list through: `TireResults`, `TireGrid`; `/tires`
      (`catalog`, offset from page × page size), `/tires/new`, `/tires/used`,
      brand and size pages · files: `TireResults.tsx`, `TireGrid.tsx`,
      `SearchResults.tsx`, `new/page.tsx`, `used/page.tsx`,
      `brands/[brand]/page.tsx`, `size/[size]/page.tsx` · check: test — on
      page 2 of `/tires` (page size 20) the first tire's `view_item_list`
      item has `index` 21; `TireGrid` with `brand_tires` "Brand: Michelin"
      sends that list (AC13).
- [x] **T8** — Chat sets: `ChatSetCard.size`, `units`; `ChatSetCards`
      `view_item_list` (`chat_sets`) and `select_item` · files:
      `src/app/utils/chatSets.ts`, `ChatSetCards.tsx` (+ tests) · check: AC4;
      card still has no internal fields.

## Cart

- [x] **T9** — `view_cart` when the drawer opens with tires · files:
      `CartModal.tsx` (+ test) · check: one event per opening; empty cart
      sends nothing.
- [x] **T10** — `remove_from_cart` at the shopper's controls: drawer (tire,
      set), checkout (tire, set, "Remove the {city} tire"); sold path
      untouched · files: `CartModal.tsx`, `Checkout.tsx` (+ tests) · check:
      AC6, AC7; checkout sends no `view_cart`.

## Search and filters

- [x] **T11** — `useSearchEvent()` in `SearchResults` (key on the size
      `w`/`s`/`d` only; `brands`/`condition` as params; tab-level last key) ·
      files: `src/app/ui/components/SearchEvent/useSearchEvent.ts` (+ test),
      `SearchResults.tsx` · check: new size sends once; same size does not; a
      brand or condition change with the size set does not; no size part →
      nothing.
- [x] **T12** — `apply_home_filters` with `data-track-tire-brand` /
      `-tire-condition`; `filter_apply` with `data-track-filter-group` /
      `-filter-value` · files: `HomeMoreFilters.tsx`, `FacetGroup.tsx`,
      `SearchableFacet.tsx`, `RangeFacet.tsx`, `FilterRail/tracking.guard.test.ts`
      (+ component tests) · check: AC9, AC10; count and label kept.

## Docs and done

- [x] **T13** — Consultant note (ES) and the `tech-stack.md` line · files:
      `spec/features/046-ga4-catalog-events/consultant-note.md`,
      `spec/tech-stack.md` · check: lists every event, trigger, list id and
      parameter name of D6, and that a rail size facet sends `filter_apply`
      and `search` (two facts, not a duplicate).
- [x] **T-DoD** — `tsc` + lint + tests + build + `perf:budget`; manual in
      Chrome by the agent with GA4 in `debug_mode` (local) and the network
      panel: `/tires` page 1 → 2 → filter → tire (list, select, view_item);
      `/tires/used`; home search by size and by text; home filters; rail
      facet; cart open, remove a tire and a set; checkout city removal; chat
      cards; a visitor without consent (no GA4 hits) · check: `results.md`.

## Traceability

| Task | AC |
| ---- | -- |
| T1 | all (names) |
| T2 | AC1, AC2, AC3, AC11 |
| T3 | AC8, AC11 |
| T4 | AC5, AC6 |
| T5 | AC1, AC2, AC12 |
| T6 | AC1, AC3 |
| T7 | AC1, AC2, AC3, AC13 |
| T8 | AC4 |
| T9 | AC5 |
| T10 | AC5, AC6, AC7 |
| T11 | AC8 |
| T12 | AC9, AC10 |
| T13 | AC11 (documented keys) |
| T-DoD | all (AC1–AC13) |
