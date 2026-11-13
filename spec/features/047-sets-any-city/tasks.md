# Tasks — Sets and pickup across Miami and Orlando

> Feature: `047-sets-any-city` · Based on: [plan.md](./plan.md) · Created: 2026-11-13

Each task is one sitting, leaves the build green, and names its check.

## Engine and data (pure / server)

- [x] **T1** — Group without city: `SetGroup.city?`; `setGroupOf` leaves it
      out; `setGroupKey` → `any`; `buildSetCandidatesQuery` adds the
      `VaultName` clause only with a city; the elsewhere route's minimum
      change to compile (compare the tire's own `city`, pass `{ ...group,
      city }`) · files: `src/repositories/tireSetsRepository.ts` (+
      `tireSetsRepository.test.ts`), `src/app/api/tire-sets/elsewhere/route.ts`
      · check: tsc; no city → no `VaultName` in the WHERE, key ends `|any`; with
      Orlando/Miami → today's clauses; output still has no `VaultName` /
      `Location`.
- [x] **T2** — Engine: `eligible` without city; `byPreference(ref, city?)`
      with the city after tread, patch, price; `suggestSet`/`swapOptions` pass
      the anchor's city; `pickReplacement` without the city filter, tie on the
      first kept tire's city; module doc · files: `src/app/utils/tireSets.ts`
      (+ `tireSets.test.ts`) · check: AC1 (Miami anchor + Orlando units →
      set), AC2 (mixed units outside 2/32" never chosen), AC3 (swap lists both
      cities), AC4 (only replacement in the other city returned), AC12 (equal
      tread/patch/price → anchor's city; closer tread in the other city wins).
- [x] **T3** — `cheapestSet(units, size, preferCity?)` over one pool, city as
      the last unit tie-break · files: `tireSets.ts` (+ test) · check: a set
      may mix cities; between equal units the preferred city wins; patched and
      total still decide first.
- [x] **T4** — `citiesLabel(cities)` ("Miami", "Miami and Orlando", sorted,
      deduped) · files: `src/app/utils/cartSets.ts` (+ `cartSets.test.ts`) ·
      check: labels. (`cartCities` / `oddCity` are deleted in T12, once
      nothing uses them.)

## Chat

- [x] **T5** — `pickChatSets` per D7/D8: `groupKey` without city; named city
      → that city's units first, else all units with outcome `any_city`, then
      the `smaller` ladder on all units; no named city → visitor city sorts
      after patched and total; `other_city` replaced by `any_city` (with the
      minimum case in `buildSetsMessage` and the chat route so it compiles);
      `ChatSetCard.cities` added beside `city` (kept until T7);
      `resolvePresetSet` without the city check · files:
      `src/app/utils/chatSets.ts` (+ `chatSets.test.ts`),
      `src/app/api/_lib/aiChat/sets.ts`, `src/app/api/tires/ai-chat/route.ts`
      · check: tsc; AC5, AC15, AC16; a mixed `?set=` resolves `exact`.
- [x] **T6** — Messages and prompt: `any_city` text (EN/ES) naming pickup in
      the asked city; no `other_city`; step-1 tip and history without "same
      city", history with the cities; prompt says sets cross cities and pickup
      is at any store · files: `src/app/api/_lib/aiChat/sets.ts`,
      `src/app/api/tires/ai-chat/route.ts` (+ `sets.test.ts`, prompt guard)
      · check: AC5/AC15 wording; prompt guard has no "same city" / "store's
      city".
- [x] **T7** — `ChatSetCards` shows `citiesLabel(cities)`; `data-track-city`
      the same label; `ChatSetCard.city` removed (history and messages read
      `cities`) · files: `src/app/ui/components/AiChat/ChatSetCards.tsx`,
      `chatSets.ts`, `sets.ts` (+ tests) · check: AC13 for the chat card; tsc.

## Tire page

- [x] **T8** — `SoldTireAlternative` reads one group (count "60+" at the
      cap, its "120" comment fixed); a new elsewhere route test · files:
      `src/app/ui/sections/TireSet/SoldTireAlternative.tsx` (+ test),
      `src/app/api/tire-sets/elsewhere/route.test.ts` (new) · check: AC14
      (other city counted only; same city → 400); sold page makes one
      candidates call.
- [x] **T9** — (modern-web-guidance first) Builder and panel texts per D5: unit rows and swap options name
      their city when candidates span both; "N more of this tire" (+ "in Miami
      and Orlando" when mixed); panel header with the set's cities; replacement
      route doc · files: `TireSetBuilder.tsx`, `TireSetPanel.tsx`,
      `src/app/api/tire-sets/replacement/route.ts` (+ tests) · check: AC3,
      AC13 on the page; same-city groups render as today.

## Pickup and cart

- [x] **T10** — `create-session`: remove the pickup-city check and
      `code: 'city'` · files: `src/app/api/checkout/create-session/route.ts`
      (+ `route.test.ts`) · check: AC6, AC9 (Orlando tire + Miami store →
      session); AC11 (sold tire still 409 `sold`).
- [x] **T11** — (modern-web-guidance first) Checkout: all 7 stores; remove `mixedCities`, notice, "Remove
      the {city} tire" (and its `trackRemoval`), "only {city} stores" line,
      `code: 'city'` branch; preselect `nearestStoreId` whenever the visitor's
      city is known; set header with `citiesLabel`; each member of a mixed
      set shows its `CityTag` · files:
      `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` (+ test) ·
      check: AC6, AC7, AC8 (24–48 h text), AC13, AC17.
- [x] **T12** — (modern-web-guidance first) Cart drawer and `CityTag`: no
      `oddCity`; set header with `citiesLabel`; each member of a mixed set
      shows its `CityTag`; drop `odd`; delete `cartCities` and `oddCity` (+
      their tests) · files: `CartModal.tsx`,
      `src/app/ui/components/CityTag/CityTag.tsx`, `src/app/utils/cartSets.ts`
      (+ tests) · check: AC13; tsc (no importer left).

## Docs and done

- [x] **T13** — Docs: `tech-stack.md` tire-sets bullet; 041 spec header note
      (D1/D5 superseded by 047); 046 consultant note (`remove_from_cart` row,
      `ai_chat_sets_shown` outcome `any_city`); `analyticsEvents.ts` comments;
      roadmap · check: no doc still states the one-city rule as current.
- [x] **T14** — (owner review; modern-web-guidance `hovercard`,
      `interest-triggered-action-previews`) Cart lines carry tread, life,
      patch and DOT (`AddToCartButton`, `TireCard`, `setUnitToLine` via
      `cartFacts.ts`); the drawer shows the facts line and a top-layer card on
      hover/focus · files: `src/app/utils/cartFacts.ts` (+ test),
      `CartContext.tsx`, `cartSets.ts`, `AddToCartButton.tsx`, `TireCard.tsx`,
      `CartModal.tsx`, `CartTireHovercard.tsx` (+ `CartModal.test.tsx`),
      `globals.css` · check: AC18. Second round: smoother entry/exit and glide
      between tires; DOT, stock number and "Qty 1" off the line; set members
      without size/condition (in the header). Third round: a pointer toward
      the tire; the card stays open while hovered.
- [x] **T-DoD** — `tsc` + lint + tests + build + `perf:budget`; manual in
      Chrome by the agent on real inventory: a tire of a group that reaches 4
      only across cities shows a mixed set with each city named; swap and
      add to cart; drawer and checkout show "Miami and Orlando"; pickup lists
      7 stores, the 24–48 h text, Stripe test session created for a Miami
      store with an Orlando tire; chat "4 tires {size}" with and without "in
      Orlando"; "N like this in {city}" still appears · check: `results.md`.

## Traceability

| Task | AC |
| ---- | -- |
| T1 | AC1, AC10, AC14 (compiles) |
| T2 | AC1, AC2, AC3, AC4, AC12 |
| T3 | AC5, AC16 |
| T4 | AC7, AC13 |
| T5 | AC4, AC5, AC15, AC16 (FR8 outcome) |
| T6 | AC5, AC15 |
| T7 | AC13 |
| T8 | AC14 |
| T9 | AC3, AC13 |
| T10 | AC6, AC9, AC11 |
| T11 | AC6, AC7, AC8, AC13, AC17 |
| T12 | AC13 |
| T13 | — (docs) |
| T14 | AC18 |
| T-DoD | all (AC1–AC17) |
