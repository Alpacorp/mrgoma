# Tasks — Build your tire set

> Feature: `041-tire-sets` · Based on: [plan.md](./plan.md) · Created: 2026-11-10

> Implementation notes: T6 was already satisfied by `STOREFRONT_SELLABLE_WHERE`
> (feedQuery.ts, with its own guard test) — reused, not duplicated. T12 mounts
> the block from `DetailView` via a `setSlot` prop instead of inside
> `TireInformation` (build fix, see results.md). T23's Lighthouse step is open.

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Every new test that reaches analytics mocks `@vercel/analytics`
(feature 015 Risks); repository tests mock `mssql`/`getPool` as the existing
repository tests do.

## Research

- [x] **T0** — UX research (stand-in for the unavailable `modern-web-guidance`
      skill, CLAUDE.md rule): WAI-ARIA APG radio group, mobile product
      configurator/variant pickers, announcing totals with `aria-live`,
      swapping an item in a bundle; record decisions and sources · files:
      `spec/features/041-tire-sets/ux-notes.md` · check: notes reviewed before
      T10.

## Engine (pure, no UI, no DB)

- [x] **T1** — `SetUnit`/`SetSize` types, `parseTread` (`'10.0'` → 10, `'-'`/
      blank → `null`), `treadRange`, `isWithinTolerance` (≤ 2/32") · files:
      `src/app/utils/tireSets.ts`, `tireSets.test.ts` · check: tests for parsing,
      range text ("9–10/32, Δ1/32"), tolerance edges (exactly 2.0 passes, 2.1
      fails).
- [x] **T2** — `availableSetSizes(anchor, candidates)`: sizes 2/3/4 only when a
      valid set of that size exists (window search); used units without tread
      excluded, new units without tread count as full tread; also
      `countJoinable(anchor, candidates)` = units within 2/32" of the anchor
      (FR4) · files: same · check: tests for 0, 1, 3+ candidates; outside
      2/32" ignored; missing tread used vs new; count excludes far-tread units
      (AC1).
- [x] **T3** — `suggestSet(anchor, candidates, size)` with D6 order (closest
      tread → unpatched → lower price) over every 2/32" window containing the
      anchor; anchor always included; distinct ids · files: same · check: tests
      incl. AC15 tie-breaks and the "anchor 8, units 6 and 10" case.
- [x] **T4** — `swapOptions(set, index, candidates)` (never the anchor; only
      units keeping Δ ≤ 2/32"; not already in the set) and
      `pickReplacement(keep, candidates)` (D6 order within 2/32" of the kept
      units) · files: same · check: tests for both, incl. "no option" cases.
- [x] **T5** — Quantity mode for new tires (D11): same API, a flag that tells
      the UI to hide the unit list · files: same · check: test that a `New`
      anchor yields quantity mode and sizes capped by availability (AC16).

## Data

- [x] **T6** — Export the sellable-online SQL rule once; `fetchActiveTireIds`
      uses it with no behaviour change · files:
      `src/repositories/tiresRepository.ts` (or `sellableRule.ts`) · check:
      existing repository tests green; `grep` shows one definition.
- [x] **T7** — `fetchSetCandidates(anchor)`: parameterised query, whitelisted
      columns, same brand/`Model2`/`RealSize`/run-flat/condition, city's vault
      list, `TOP 60`, excludes the anchor; maps to `SetUnit` with `city` only;
      blank `Model2` → `[]` without querying · files:
      `src/repositories/tireSetsRepository.ts`, `tireSetsRepository.test.ts` ·
      check: tests assert inputs are bound (no interpolation), vault list per
      city (AC14), no `Location`/`VaultName` in the output.
- [x] **T8** — `getCachedSetCandidates` (`unstable_cache`, key = group + city,
      `revalidate: 60`, tag `tire-sets`) and `fetchSetCandidatesFresh` · files:
      same · check: test that two anchors of the same group produce the same
      cache key.

## Detail page

- [x] **T9** — `TireSetSection` (server): returns `null` when the tire is sold
      (D12, AC17) or no size is available (AC3); otherwise renders the count
      sentence with N = `countJoinable` ("We have N more of this tire in
      Miami") and `<TireSetBuilder>`
      · files: `src/app/ui/sections/TireSet/TireSetSection.tsx` (+ test) ·
      check: tests for the three branches.
- [x] **T10** — `TireSetBuilder` (client): size radio group (feasible sizes
      only, `data-track="set_size_select"`), suggested unit list (tread, life,
      patched, DOT, thumbnail, price), total + range in an `aria-live` region;
      quantity mode for new tires; follows `ux-notes.md` ·
      files: `src/app/ui/sections/TireSet/TireSetBuilder.tsx` (+ test) · check:
      RTL tests for AC1, AC2, AC4, AC16 (roles, labels, totals).
- [x] **T11** — Swap per unit (native `<select>` of `swapOptions`,
      `data-track="set_unit_swap"`), state update of total and range · files: same · check: test for AC5.
- [x] **T12** — Mount in `TireInformation` behind
      `<Suspense fallback={null}>`, only when not sold · files:
      `src/app/ui/sections/TireInformation/TireInformation.tsx` · check:
      `tsc`; manual: page HTML streams the block after the price row.

## Cart

- [x] **T13** — `CartItem` gains optional `setId`, `city`, `tread`;
      `addSetToCart(lines, setId)` taking full `AddToCartProduct` lines (skips lines already in the cart, opens the
      cart once) and `removeSet(setId)`; legacy lines read as singles · files:
      `src/app/context/CartContext.tsx`, `CartContext.test.tsx` · check: tests
      for AC6 (no duplicates), AC7, legacy `localStorage` payload.
- [x] **T14** — "Add set of N to cart" wires `addSetToCart` + one
      `trackEcommerce(ADD_TO_CART)` with every unit and the set total + one
      `SET_BUILT` event (`set_size`, `swaps`, `condition`); add `SET_BUILT` to
      `EVENTS`. Lines are composed as anchor brand/model2/size/name + unit, and
      the GA4 items come from `cartPayload` (040) · files: `TireSetBuilder.tsx`,
      `analyticsEvents.ts` (+ tests) · check: builder test asserts both payloads
      (AC6) and that each `item_name` equals the one `view_item` sends for that
      tire; retired-events guard green.
- [x] **T15** — Single tires carry `city` into the cart: `city` on
      `TransformedTire` (from `storeCity`) and passed by `TireCard` and
      `AddToCartButton` · files: `transformTireData.ts`, `TireCard.tsx`,
      `AddToCartButton.tsx` (+ tests) · check: tests that the cart line has the
      city; list API still never exposes `VaultName`.
- [x] **T16** — Cart drawer groups lines by `setId` ("Set of N · range ·
      total", "Remove set"); a group of one renders as a single tire · files:
      `src/app/ui/sections/CartModal/CartModal.tsx` (+ test) · check: tests for
      grouped rendering, both removals and the group-of-one case (AC7).

## Checkout

- [x] **T17** — `locationsData` carries `city`; checkout derives the cart's
      cities; pickup offers only that city's stores, or is disabled with the
      reason when mixed; "24–48 business hours" kept (D9) · files:
      `locationsData.ts`, `Checkout.tsx`, `Checkout.test.tsx` · check: tests
      for AC8, AC9, AC10 (client side).
- [x] **T18** — Order summary groups lines by `setId` like the drawer · files:
      `Checkout.tsx` (+ test) · check: test renders "Set of 4" with its total.
- [x] **T19** — Server: `create-session` rejects a pickup whose items are not
      in the store's city (`409`, `reason: 'city'`); existing `sold` path gains
      `reason: 'sold'` · files: `src/app/api/checkout/create-session/route.ts`,
      new `route.test.ts` · check: tests for wrong city, right city, delivery
      unaffected, existing 409 unchanged in shape (AC10).
- [x] **T20** — Replacement API `GET /api/tire-sets/replacement?sold=&keep=`
      (numeric ids that exist, `keep` ≤ 3, fresh candidates,
      `pickReplacement`, whitelisted output or `null`, 10 s cache per `sold`
      id) · files: `src/app/api/tire-sets/replacement/route.ts` (+ test) ·
      check: tests for found, none, bad input (400), unknown id (404), second
      call served from cache.
- [x] **T21** — Checkout handles 409 for set lines: calls the replacement API,
      shows "Tire #X sold — replace with #Y (…)" with one-click accept (keeps
      `setId`), or removes it and says the set is smaller; `reason: 'city'`
      shows the city message · files: `Checkout.tsx`, `Checkout.test.tsx` ·
      check: tests for both branches (AC11).

## Docs, verification, DoD

- [x] **T22** — Docs: `tech-stack.md` line on the set engine, the cart's
      `setId` and the city rule; spec status · files: `spec/tech-stack.md`,
      `spec.md` · check: reviewed.
- [x] **T23** — Manual end to end (local, Stripe test mode): a used 4+ group
      (build 4, swap one, add, cart grouped, pickup only same-city stores, pay),
      a new-tire group (quantity mode), an Orlando single + Miami single (pickup
      disabled), a forced sold unit (replacement offered), sold tire page (no
      block), 360 px + keyboard + screen reader labels; Lighthouse (mobile) on
      the same detail page before and after — LCP not worse · files:
      `spec/features/041-tire-sets/results.md` · check: AC1–AC17 recorded;
      `/tires` query count unchanged (AC18).
- [x] **T-DoD** — `npx tsc --noEmit` + `npm run lint` + `npm test` +
      `npm run build` + `npm run perf:budget` green; manual check on a detail
      page, cart and `/checkout` at mobile width; changes left **staged, not
      committed** until the user has tested.

## Traceability

| Task  | Acceptance criteria              |
| ----- | -------------------------------- |
| T0    | AC12 (accessible, mobile UI)     |
| T1    | AC4, AC5 (range, tolerance)      |
| T2    | AC1, AC2, AC3                    |
| T3    | AC4, AC15                        |
| T4    | AC5, AC11                        |
| T5    | AC16                             |
| T6    | AC3 (same sellable rule), AC18   |
| T7    | AC3, AC14                        |
| T8    | AC12 (no LCP / DB regression)    |
| T9    | AC1, AC3, AC17                   |
| T10   | AC1, AC2, AC4, AC12, AC16        |
| T11   | AC5                              |
| T12   | AC12                             |
| T13   | AC6, AC7                         |
| T14   | AC6                              |
| T15   | AC10                             |
| T16   | AC7                              |
| T17   | AC8, AC9, AC10                   |
| T18   | AC6, AC13 (staff see the set)    |
| T19   | AC10, AC13                       |
| T20   | AC11                             |
| T21   | AC11                             |
| T22   | —                                |
| T23   | AC1–AC18 (observed)              |
| T-DoD | all (regression gate)            |
