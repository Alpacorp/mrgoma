# Tasks — Filters that say how much is behind them

> Feature: `030-tires-filter-rail` · Based on: [plan.md](./plan.md) · Created: 2026-08-25

Ordered, **very small, independently verifiable** tasks. **Revised after
`/analyze`** — T0, T11b, T15b and T24 were added, and four checks strengthened.
Baseline before starting: **1.236 tests in 95 files, green**, on `feat/030-tires-filter-rail`
(which carries the unmerged `028` and `029`).

**Four ordering rules:**

1. **Nothing is introduced before something consumes it.** `022` added a helper
   one task ahead of its caller and the suite went red on lint rather than on
   logic. So each new module lands with its first caller.
2. **The data layer is finished before any UI is built** (group B before D), so
   no component is ever written against counts that do not exist yet.
3. **The URL layer comes before the rail** (group C before D). Every link in the
   rail is produced by `filterHref`, and it is the one file whose bugs are
   invisible in a screenshot — a filter that quietly drops another filter looks
   exactly like a filter that works.
4. **`'use client'` is decided when the file is created, not after.** `026` shipped
   a client component without the directive and only `npm run build` caught it —
   vitest cannot see React Server Component boundaries. Every task that creates a
   component states which side it is on.

---

## A. Groundwork the rest depends on

- [x] **T0** — Change the four `aria-pressed` attributes in `BrowseFilters.tsx`
      (lines 53, 67, 98, 221) to `aria-current`.
      · **`/analyze` found the guard in T9 could never go green without this.**
      T15 stops `/tires` rendering `BrowseFilters`, but all four offending
      attributes live *inside* that file, which stays on `/tires/new`,
      `/tires/used` and `/tires/brands/[brand]`. The guard would have sat red
      forever, and a permanently red guard teaches everyone to ignore it.
      · They are links, and `aria-pressed` belongs to a button role. Fixing it at
      the source repairs the three landing pages as well — **254 invalid
      attributes on `/tires` today**, and the same fault on every landing page.
      · files: `src/app/(shop)/tires/container/BrowseFilters/BrowseFilters.tsx`
      · check: `npm test` green; `grep -rn "aria-pressed" src` returns nothing.

- [x] **T1** — Export `buildFiltersClause` from `tiresRepository.ts`, and replace
      the duplicated sellable-WHERE literal inside `fetchBrands` with the
      `STOREFRONT_SELLABLE_WHERE` constant the file already imports.
      · Two copies of the sellable rule is the shape of defect fixed three times
      this month; they are character-identical today, which is exactly when it is
      cheap to fix.
      · files: `src/repositories/tiresRepository.ts`, `src/repositories/feedQuery.ts`
      · check: `npm test` green; a test asserts `fetchBrands` and the feed use the
      same constant.
      · **The guard found three more copies than the plan knew about**, and they
      were not identical: `fetchTireRanges` used a *numeric* life test,
      `fetchSizes` an exact duplicate of the string one, and
      `fetchActiveTireIds` plus the three dimension queries apply **no life test
      at all**. The first two now use the constant — which also means the price
      slider's bounds finally describe the same set the results do. The last four
      are deliberately different rules and were left alone; the guard matches the
      whole sentence rather than a fragment so it does not push towards unifying
      them.
      · **The constant's life test is now numeric.** `RemainingLife` is text, so
      `>= '50%'` compared lexicographically and `'100%'` sorts *below* `'50%'` —
      a tire recorded at 100% would have silently vanished from the catalog, the
      feed and every count. Both forms were measured over the live catalog and
      return **the same 4.128 tires**, so this changes nothing today and removes
      a bug that could only appear later.

- [x] **T2** — Add `src/app/utils/facetBuckets.ts`: `PRICE_BUCKETS` and
      `LIFE_BUCKETS` as `{ id, label, min, max }`, plus a helper that renders a
      bucket list as a SQL `CASE` expression.
      · **Single source.** The SQL and the visible labels are both generated
      here, so a tier cannot be renamed in one place only.
      · Buckets from the measured distribution: price 416 / 1.341 / 1.024 / 949 /
      419; life 2.060 / 1.021 / 1.063 / 5.
      · files: `src/app/utils/facetBuckets.ts` + test
      · check: unit test asserts the generated `CASE` covers every bucket with no
      gap and no overlap, and that the bucket a price falls into matches the
      `CASE` branch it would take.

## B. The counts

- [x] **T3** — Add `src/repositories/tireFacets.ts` with `fetchTireFacets(filters)`:
      one `GROUPING SETS` query returning brand, condition, patched, run-flat,
      **rim, width and sidewall**, price-bucket and life-bucket counts —
      **nine grouping sets**.
      · **Re-measured, and the prediction was half wrong.** The plan said the two
      extra facets would "grow but not multiply" the 244 ms measured with seven.
      Actual: **320 ms for nine** — about 35 ms per grouping set either way, so
      the cost *is* roughly linear in the number of facets. What `GROUPING SETS`
      buys is the single scan: seven `UNION ALL` passes cost 876 ms, ~125 ms per
      set. The plan has been corrected rather than left to imply extra facets are
      free.
      · Verified against the live catalogue: **all nine groups sum to exactly the
      total (4.127)**, so nothing leaks out of a facet, and rim returns all
      fourteen real values including 19.5", 23", 24" and 26".
      · Parameterized via `buildFiltersClause` (T1). No user input concatenated.
      · Wrapped in `logQuery('tires.facets', …)` like every other query.
      · The `CASE` expressions come from `facetBuckets.ts` (T2).
      · files: `src/repositories/tireFacets.ts` + test
      · check: test asserts the built SQL contains no interpolated filter values
      and that every filter in `TireFilters` reaches the WHERE clause.

- [x] **T4** — Add `facetsForRequest(filters)`: runs **one query for the groups
      with no filter of their own, plus one per active group with that group's
      own filter removed**, in `Promise.all`.
      · This is the whole reason the counts are usable: with Pirelli applied, a
      single query reports zero for every other brand and the buyer can never
      switch.
      · files: `src/repositories/tireFacets.ts` + test
      · check: test with brand and rim applied asserts **three** queries, that the
      rim query carries no brand parameter, and that the brand query carries no
      rim parameter.

- [x] **T5** — Guard: **the facet counts and the result count agree.**
      · One filter set is run through `fetchTires` and through `fetchTireFacets`,
      and the facet total must equal the result total. They share
      `buildFiltersClause`, and this is what stops them drifting if one day they
      do not.
      · files: `src/repositories/tireFacets.test.ts`
      · check: red if the facet query's WHERE is edited independently.

## C. The URLs

- [x] **T6** — Add `src/app/utils/filterHref.ts`: `addValue`, `removeValue`,
      `toggleValue`, `clearAll`, each taking the current query string and
      returning a new one.
      · Always resets `page` to 1. Always preserves every other parameter,
      **including `view` and `sort`**.
      · files: `src/app/utils/filterHref.ts` + test
      · check: the heaviest test file in the feature — **45 tests**: removing one
      filter keeps the others; toggling twice returns the original; `page`
      resets; `view` and `sort` survive; an unknown parameter is never dropped.
      · **One of those tests passed while asserting the opposite of its own
      comment.** `activeFilterCount` counted a price band as two filters because
      it counted parameters rather than choices, so the collapsed mobile control
      would have announced "2 filters" for one band. Fixed, and `RANGE_PAIRS` now
      says which parameters are two ends of one thing.

- [x] **T7** — Teach `buildTireFilters` to read `view` (`list` | `table`,
      defaulting to `list`) and ignore anything else.
      · files: `src/app/utils/filterUtils.ts` + `filterUtils.test.ts`
      · check: `?view=table` parses; `?view=nonsense` falls back to `list`.

## D. The rail

- [x] **T8** — `FacetGroup.tsx` — **server component**. One heading, a list of
      links, each with its label and count. Applied options carry
      `aria-current="true"`.
      · files: `src/app/ui/sections/FilterRail/FacetGroup.tsx` + test
      · check: component test on a fixed payload; asserts `aria-current` on the
      applied option and **`aria-pressed` on nothing**.

- [x] **T9** — Guard: **no `<a>` in `src/app` carries `aria-pressed`.**
      · Lands here rather than last: T8 establishes the correct pattern, and the
      254 existing offenders are removed in T15. Written now so T15 has something
      that fails until it is done.
      · Same shape as `catalogHeadings.guard.test.ts` — per file, per line, with
      comment lines exempt.
      · files: `src/app/ui/sections/FilterRail/ariaPressed.guard.test.ts`
      · check: **green on arrival, not red as planned** — `/analyze` moved the
      fix from T15 to T0, so by the time the guard existed the offenders were
      gone. Verified red by restoring one `aria-pressed`, then restored.

- [x] **T10** — `FilterRail.tsx` — **server component**. Renders the groups in
      the order fixed by an exported constant: condition, size, brand, price,
      tread life, patched, run-flat.
      · files: `src/app/ui/sections/FilterRail/FilterRail.tsx` + test
      · check: test asserts the rendered order equals the constant, so the order
      cannot drift from the decision without failing.

- [x] **T11** — `BrandFacet.tsx` — **client component** (`'use client'`, it owns
      an input). The full brand list is rendered by the server; the input hides
      what does not match.
      · files: `src/app/ui/sections/FilterRail/BrandFacet.tsx` + test
      · check: type `mich`, assert the visible set, and assert **no navigation
      occurred** — the search must not touch the URL.

- [x] **T11b** — Pass the slider bounds from the server: `fetchTireRanges()`
      joins the `Promise.all` in `page.tsx` and the min/max arrive as props.
      · `RangeSlider` needs `min` and `max`. Today `useFilters` fetches them from
      `/api/ranges` on the client, and the rail does not use `useFilters` — so
      without this the range control has nothing to render against.
      · files: `src/app/(shop)/tires/page.tsx`
      · check: the bounds reach the component as props; no client fetch of
      `/api/ranges` happens on `/tires`.

- [x] **T12** — `RangeFacet.tsx` — **client component**. Buckets plus
      `RangeSlider`, both writing the same `minPrice`/`maxPrice` pair.
      · **One state.** The bucket shown as applied is *derived* from the numbers,
      never stored beside them. This is the whole safety argument for having
      accepted two controls.
      · files: `src/app/ui/sections/FilterRail/RangeFacet.tsx` + test
      · check: **round trip in both directions** — choosing `$100–149` sets the
      slider to that span; setting the slider to that span marks the bucket
      applied; and a hand-set $140–$185 marks **none**, because it is none.
      · **`RangeSlider` could not be used without a pointer.** Both thumbs were
      bare `<div>`s with mouse and touch handlers — no `role`, no `tabIndex`, no
      key handling — so the control was inoperable by keyboard and invisible to a
      screen reader. That is **WCAG 2.1.1, Level A**, and it was already live on
      `/tires`, `/dashboard` and the home page's "More filters". Found because
      the test looked for `role="slider"` and there was none. Fixed additively:
      `role`, `aria-value*`, `tabIndex`, arrow / Page / Home / End keys, thumbs
      that cannot cross. Pointer behaviour untouched; all three surfaces gain it.

- [x] **T13** — `AppliedFilters.tsx` — **server component**. A removable chip per
      applied filter plus Clear all, all built by `filterHref` (T6).
      · files: `src/app/ui/sections/FilterRail/AppliedFilters.tsx` + test
      · check: two filters applied → two chips; removing one leaves the other.

- [x] **T14** — `FilterRailMobile.tsx` — **client component**. `<details>` whose
      `<summary>` carries the active-filter count while closed.
      · files: `src/app/ui/sections/FilterRail/FilterRailMobile.tsx` + test
      · check: two filters applied → the closed summary says so.

## E. Wiring it into the page

- [x] **T15** — Restructure `/tires`: `page.tsx` fetches results and facets in
      `Promise.all`, owns `<main>`, the hero and the
      `lg:grid-cols-[15rem_1fr]` grid; `SearchResults` loses the hero,
      `TopFilters`, `FiltersMobile` and `BrowseFilters`.
      · `lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6rem)]
      lg:overflow-y-auto` — **`self-start` is load-bearing**: a grid item
      stretches to the row height by default and `sticky` then has nothing to
      move within, failing silently and invisibly.
      · `top-20` clears the site header, which is itself sticky at `top-14`.
      · **`BrowseFilters` is only removed from `/tires`.** `/tires/new`,
      `/tires/used` and `/tires/brands/[brand]` keep it — there it is their only
      navigation, not a filter.
      · files: `src/app/(shop)/tires/page.tsx`,
      `src/app/(shop)/tires/container/SearchResults.tsx`
      · check: `npm run build` green (**the only gate that sees a missing
      `'use client'`**); a test asserts `Dashboard.tsx` still renders
      `TopFilters`; and **an automated no-JavaScript test** — render the page
      component with a filter in `searchParams` and assert the markup is
      filtered, with no client hook involved. AC8 was manual-only before
      `/analyze`.

- [x] **T15b** — Pin `/tires` dynamic so the counts are never prerendered.
      · The route declares no caching directive while its three siblings all
      declare `revalidate = 3600`. Reading `searchParams` makes a route dynamic,
      but **bare `/tires` is exactly the case a build can prerender** — and it is
      the page whose counts matter most. FR5 must not rest on inference.
      · files: `src/app/(shop)/tires/page.tsx`
      · check: test asserts the route declares it; `npm run build` output shows
      `/tires` as dynamic (ƒ), not static (○).

- [x] **T16** — Drop `mx-auto max-w-3xl` from `TireResults` so the list takes the
      width the rail leaves.
      · Measured: 768 px → 944 px. The list does not shrink; it grows.
      · files: `src/app/ui/components/TireResults/TireResults.tsx`
      · check: manual — the list starts beside the rail with no gap.

- [x] **T17** — Add the "Browse all brands" index at the foot of `/tires`:
      server-rendered links to every brand landing page.
      · This is what keeps the `/clarify` decision's purpose after the carousel
      is gone.
      · files: `src/app/(shop)/tires/page.tsx` (or a small server component)
      · check: test asserts the page links to **every brand `fetchBrands()`
      returns** — measured against the live brand list, not against a snapshot of
      today's markup, which would only prove the markup did not change.

## F. Reading the results

- [x] **T18** — `TireTable.tsx` — the compact view: condition, size, name, price,
      remaining life, tread, patched, run-flat, stock.
      · **Adds a presentation; does not restyle `TireCard`.** That boundary is
      what keeps this out of the TireCard redesign.
      · Justified by measurement: **2.089 of 4.149 tires (50,3%) have no photo.**
      · files: `src/app/ui/components/TireTable/TireTable.tsx` + test
      · check: every listed field is present for a fixture tire; the table
      scrolls inside its own container rather than widening the page.

- [x] **T19** — `ViewToggle.tsx` — two links setting `?view=`, and
      `SearchResults` renders table or list accordingly.
      · files: `src/app/ui/components/ViewToggle/ViewToggle.tsx`,
      `SearchResults.tsx` + test
      · check: `?view=table` renders the table; applying a filter afterwards
      keeps `view=table` in the URL.

- [x] **T24** — Instrument the new controls with `data-track` /
      `-category` / `-label`.
      · `tech-stack.md` requires it on new interactive elements, and one
      delegated listener routes them to both sinks — there is no per-platform
      wiring to remember, only the attribute.
      · **Never a raw value that identifies a person**, and the label names what
      happened, not the click.
      · files: `FacetGroup.tsx`, `BrandFacet.tsx`, `RangeFacet.tsx`,
      `ViewToggle.tsx`, `AppliedFilters.tsx`
      · check: test asserts each interactive element carries a `data-track`
      attribute; `retiredEvents.guard.test.ts` still green.

## G. The empty state

- [x] **T20** — Extend `NoResultsFound` to accept
      `suggestions: { label, href, count }[]` and render them.
      · files: `src/app/ui/components/NotResultsFound/NoResultsFound.tsx` + test
      · check: renders one row per suggestion with its count.

- [x] **T21** — Feed it from the without-self counts already fetched in T4.
      · No extra query: "what removing this filter would return" is exactly the
      number the without-self query produced.
      · files: `src/app/(shop)/tires/page.tsx`
      · check: on a known-empty combination (`brands=PIRELLI&d=13`) the page
      names both filters with the count each removal returns, and following one
      returns exactly that many.

## H. Headings and closing

- [x] **T22** — Build the results heading from the applied filters, and extend
      `catalogHeadings.guard.test.ts` to cover it.
      · files: `SearchResults.tsx` or a heading helper,
      `src/app/utils/catalogHeadings.guard.test.ts`
      · check: with brand and rim applied the heading names them; the existing
      Miami-without-Orlando rule still passes.

- [x] **T23** — Accessibility pass: keyboard through the whole rail, visible
      focus, axe clean, and the sticky rail traps nothing.
      · check: **axe run in the page** (wcag2a + wcag2aa + wcag21a + wcag21aa).
      Two real contrast failures were found and fixed — counts at `text-gray-400`
      (2.85:1) and applied counts at `text-green-600` on `bg-green-50` (3.07:1),
      62 and 23 nodes. **Nothing this feature adds violates anything now**; the
      table view and the empty state are clean outright.
      · **20 pre-existing violations remain on `/tires`**, all the same thing:
      white text on `bg-green-600` — the brand green named in `tech-stack.md` —
      measures **3.21:1** against the 4.5:1 AA needs. Every "Add to Cart" button
      on the site. Not changed here: repainting the primary button is the owner's
      decision, not a side effect of a filter redesign. Recorded in results.md.
      · Keyboard: 67 controls in the rail, **0 unnamed**, sliders focusable and
      operable with the arrow keys.
      · My own heuristic reported 5 unnamed controls; all five were false
      positives — a labelled input it could not see the `<label>` of, and four
      `type="hidden"` fields. The accessibility tree is the authority, not a
      regex. Same lesson as the `029` review.

- [x] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` all green; tests added
      for new logic.
      · **Manual checks, and this feature is not done without them:**
        1. `/tires` on a real phone — **done by the owner, and it found three
           defects a desktop browser could not**: the page overflowed sideways
           (`min-width: auto` on a grid item), a second "Filters" button that
           opened the drawer this rail replaced, and the disclosure drawing two
           bordered cards so the control and its contents read as unrelated
           sections. All three fixed and re-checked.
           · The resize tool here reports success without changing the viewport;
           what finally worked was loading `/tires` in a **390 px `<iframe>`**,
           which gets its own viewport so the media queries actually fire.
        2. `/dashboard` filters still work — the shared components were not
           modified, but they were the biggest risk.
        3. `/tires/new`, `/tires/used`, `/tires/brands/pirelli` still show their
           browse strip.
        4. `/tires` with JavaScript disabled: a filter link still filters.

---

## Traceability

| Task | Acceptance criteria |
| --- | --- |
| T0 | **AC9** (makes T9's guard reachable) |
| T1 | — (groundwork for AC3) |
| T2 | AC15 |
| T3 | AC2, AC4, AC5 |
| T4 | AC3, AC12, AC20 |
| T5 | AC2 |
| T6 | AC7, AC19 |
| T7 | AC19 |
| T8 | AC2, AC9 |
| T9 | **AC9** |
| T10 | **AC21** |
| T11 | **AC6** |
| T11b | AC15 (the range control can render at all) |
| T12 | **AC15** |
| T13 | **AC7** |
| T14 | **AC10** |
| T15 | **AC1**, **AC8** |
| T15b | **AC14** |
| T16 | AC1 |
| T17 | **AC17** |
| T18 | **AC18** |
| T19 | **AC19** |
| T20 | AC12, AC20 |
| T21 | **AC12**, **AC20** |
| T22 | **AC11** |
| T23 | **AC13** |
| T24 | — (`tech-stack.md` requirement, not an AC) |
| T-DoD | AC8, AC10, AC14 (manual) |

Every criterion AC1–AC21 is covered. **AC16** (a brand link preserves the other
filters and keeps the buyer on `/tires`) is covered by **T6**, since after the
plan's revision a brand option is an ordinary filter and its href is built by
`filterHref` like every other.

---

_Recommend `/analyze` next. Do not start T1 before it is clean._
