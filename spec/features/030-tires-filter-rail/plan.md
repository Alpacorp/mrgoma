# Plan — Filters that say how much is behind them

> Feature: `030-tires-filter-rail` · Based on: [spec.md](./spec.md) · Created: 2026-08-25

## What exploring the code changed

Three things found in the codebase that the spec could not have known, each of
which changes the work.

**1. The filter machinery is shared with the dashboard and the home page.**
`TopFilters`, `useFilters`, `FilterBody`, `FiltersMobile` and
`FilterMobileContent` are consumed by `/dashboard` (`Dashboard.tsx`) and by
`HomeMoreFilters` as well as by `/tires`. **None of them may be deleted.** The
feature stops `/tires` from *using* them; the dashboard keeps them untouched.
This turns "remove 2.271 lines" into "stop rendering them on one route" — a
smaller and far safer change than the analysis implied.

**2. `BrowseFilters` is on four routes, and on three of them it is not a
filter.** `/tires/new`, `/tires/used` and `/tires/brands/[brand]` are
server-rendered landing pages that fetch a fixed `fetchTires(0, 24, …)` and
offer no filtering at all. There, the brand carousel is the page's **only**
navigation. So the removal decided in `/clarify` applies **to `/tires` only**;
the three landing pages keep it.

**3. The brand-link decision has a consequence I did not put in front of you.**
`/clarify` chose "a brand leads to its landing page", described as *"the same as
today's carousel"*. That is true, and I left out what follows from it: **the
landing page has no filters.** A buyer who picks Pirelli in the rail would be
thrown out of the filtering UI onto a page where the rail does not exist and
cannot come back except with the Back button.

The two halves of that decision — keep the 114 internal links, and let brands
behave like the carousel — can be separated, and the recommendation below keeps
the half that was actually the point. **This needs your confirmation; it is the
one open item in this plan.**

## Technical approach

**Filtering becomes navigation.** Every facet is a `<Link>` to a URL that differs
only in its query string. `/tires` already server-renders its first result set
(`fetchTiresServer(sp)` in `page.tsx`), so a link navigation produces correct,
filtered HTML with no client JavaScript — FR8 is satisfied by the rendering path
that already exists, not by new machinery.

**Re-measured at T3 with the query that actually shipped**: 320 ms server-side
for nine grouping sets, against 244 ms for seven — about **35 ms per set either
way**. So the cost is roughly linear in the number of facets, not free; the win
over seven `UNION ALL` passes (876 ms, ~125 ms per set) is that they all ride a
single scan of a fifteen-table view. Worth stating plainly rather than implying
extra facets are free.

**The counts come from one grouped query per distinct filter set.** A facet group
must be counted with every *other* filter applied but not its own, otherwise
selecting Pirelli reports zero for every other brand. That means one query for
the groups with no filter of their own, plus one more per **active** group —
typically one to three, never seven.

Measured against the live database (server elapsed via `SET STATISTICS TIME`,
wall clock from this machine over the internet, so it includes ~225 ms of
round-trip each way):

| | server | wall |
| --- | ---: | ---: |
| All seven facets, one `GROUPING SETS` query | 244 ms | 443 ms |
| **All nine facets (as built), one query** | **320 ms** | — |
| Same, with brand and rim applied | — | 594 ms |
| **Three facet queries + the results query, in parallel** | — | **330 ms** |

The last row is the one that matters: **four queries in parallel cost less wall
clock than one**, because they overlap instead of queueing. The page pays the
slowest, not the sum.

**The rail renders on the server.** Only three things need the client: the brand
search box, the mobile disclosure's open state, and the fine range control.

**The slider's bounds come from the server too.** `RangeSlider` requires `min`
and `max`; today they are fetched client-side from `/api/ranges` by `useFilters`,
which the rail does not use. `fetchTireRanges()` — a single MIN/MAX pass —
joins the same `Promise.all` and the bounds arrive as props. Without this the
range control cannot render at all on the server, which is why it is called out
rather than assumed.

**`/tires` must stay dynamic.** The route declares no caching directive today
while its three siblings all declare `revalidate = 3600`. Reading `searchParams`
makes a route dynamic, but **bare `/tires` with no parameters is exactly the
case a build can prerender** — and it is the page whose counts matter most.
FR5 is therefore pinned explicitly on the route, not left to inference.

**Layout.** The results list is `mx-auto max-w-3xl` inside `max-w-7xl`, leaving
224 px blank on each side (measured). The page becomes a two-column grid; the
list drops `mx-auto` and takes the width the rail leaves — going from 768 px to
944 px. Verified by injecting the rail into the running page: the list did not
shrink.

To put the rail beside the results, the hero must move out of `SearchResults`
into `page.tsx`, which then owns the grid. The hero is static apart from the
online-inventory count, which `page.tsx` already has as
`initialData.totalCount`.

## Reuse first

| Reuse | For |
| --- | --- |
| `RangeSlider` (`value: [number, number]`, `onChange`) | the fine price / tread-life control of FR13 |
| `buildTireFilters`, and every param name it reads (`w`, `s`, `d`, `brands`, `condition`, `patched`, `kindSale`, `minPrice`/`maxPrice`, `minRemainingLife`/`maxRemainingLife`, `sort`) | no URL vocabulary changes, so the AI chat and the home hero keep working |
| `buildFiltersClause` in `tiresRepository.ts` | the facet query's WHERE, so facets and results can never disagree about what a filter means |
| `STOREFRONT_SELLABLE_WHERE` | the definition of a sellable tire |
| The `fetchX` / `fetchDashboardX` + shared `fetchXInternal` pattern | `fetchTireFacets` follows it |
| `logQuery` | the facet query is observable like every other |
| `Disclosure` | the mobile collapsed filters |
| `NoResultsFound` | extended rather than replaced |
| `TireCard`, `ResultsHeader`, `useGenerateFixedPagination` | untouched |
| `data-track` attributes + `InteractionTracker` | facet clicks are instrumented declaratively, no per-platform wiring. **`tech-stack.md` requires this on new interactive elements**, so it is a task (T24), not a note |

**One duplication to remove while here:** `fetchBrands` re-types
`STOREFRONT_SELLABLE_WHERE` as a string literal instead of using the constant the
file already imports. Two copies of the sellable rule is the shape of defect this
project has fixed three times this month.

## Files to add / change

### Data

- **`src/repositories/tiresRepository.ts`** — export `buildFiltersClause`;
  replace the duplicated sellable literal in `fetchBrands` with the constant.
- **`src/repositories/tireFacets.ts`** *(new)* — `fetchTireFacets(filters)`:
  one `GROUPING SETS` query over `dbo.View_Tires` returning counts for brand,
  condition, patched, run-flat, rim, **width, sidewall**, price bucket and
  tread-life bucket — **nine grouping sets**, measured at **320 ms** server-side
  against the live catalogue, with every group summing exactly to the total. Parameterized through `buildFiltersClause`; no string concatenation of
  user input.
- **`src/app/utils/facetBuckets.ts`** *(new)* — the bucket definitions
  (`PRICE_BUCKETS`, `LIFE_BUCKETS`: `{ id, label, min, max }`) as the **single**
  source. The SQL `CASE` expression and the UI labels are both generated from
  them, so a tier cannot be renamed in one place and not the other.

### URL

- **`src/app/utils/filterHref.ts`** *(new)* — pure functions that add, remove and
  toggle one facet value on a query string, always resetting `page` to 1 and
  always preserving everything else. Every link in the rail comes from here.
  This is the file that decides whether removing one filter keeps the others, so
  it carries the heaviest tests in the feature.
- **`src/app/utils/filterUtils.ts`** — read the new `view` parameter.

### UI — new

- `src/app/ui/sections/FilterRail/FilterRail.tsx` — server; renders the groups in
  the agreed order (condition → size → brand → price → tread life → patched →
  run-flat).
- `FilterRail/FacetGroup.tsx` — server; one group of counted links.
- `FilterRail/BrandFacet.tsx` — **client**; the full list rendered server-side,
  the input filters what is already in the DOM.
- `FilterRail/RangeFacet.tsx` — **client**; buckets plus `RangeSlider`, one
  state (FR13).
- `FilterRail/AppliedFilters.tsx` — server; removable chips plus Clear all.
- `FilterRail/FilterRailMobile.tsx` — **client**; `<details>` carrying the active
  count.
- `src/app/ui/components/TireTable/TireTable.tsx` — the compact view.
- `src/app/ui/components/ViewToggle/ViewToggle.tsx` — two links, `?view=`.

### UI — changed

- **`src/app/(shop)/tires/page.tsx`** — fetches results **and** facets in
  `Promise.all`; owns `<main>`, the hero and the two-column grid.
- **`src/app/(shop)/tires/container/SearchResults.tsx`** — loses the hero,
  `TopFilters`, `FiltersMobile` and `BrowseFilters`; renders list or table;
  keeps pagination and sort. Expected to lose roughly half its 509 lines.
- **`src/app/ui/components/TireResults/TireResults.tsx`** — drops
  `mx-auto max-w-3xl` so the list can take the rail's leftover width.
- **`src/app/ui/components/NotResultsFound/NoResultsFound.tsx`** — accepts
  suggestions (`{ label, href, count }[]`) and renders them.

**Not touched:** `TopFilters`, `useFilters`, `FilterBody`, `FiltersMobile`,
`FilterMobileContent`, `HomeMoreFilters`, `Dashboard.tsx`, `TireCard`,
`/tires/new`, `/tires/used`, `/tires/brands/[brand]`, `/tires/size/[size]`.

## Data & flow

```
GET /tires?brands=PIRELLI&d=20&view=table
        │
        ├─ buildTireFilters(searchParams)          ← unchanged vocabulary
        │
        └─ Promise.all
             ├─ fetchTiresServer(sp)               ~440 ms  results + total
             ├─ fetchTireFacets(all filters)                groups with nothing applied
             ├─ fetchTireFacets(filters − brand)            so brand can be re-picked
             ├─ fetchTireFacets(filters − rim)              so rim can be re-picked
             └─ fetchTireRanges()                  ~ MIN/MAX, the slider's bounds
                                                    ────────
                                          measured   330 ms wall, in parallel
        │
        └─ page.tsx
             ├─ hero (totalCount)
             └─ grid lg:grid-cols-[15rem_1fr]
                  ├─ <FilterRail>       server, links only
                  └─ <SearchResults>    results, pagination, view
```

**Empty results (FR12).** When the result set is empty, the facet queries already
in flight hold the answer: the count for each applied filter *without itself* is
exactly "what removing it would return". No extra query.

**Sticky.** `lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6rem)]
lg:overflow-y-auto`. `self-start` is load-bearing — a grid item stretches to the
row height by default and `sticky` then has nothing to move within, failing
silently. `top-20` clears the site header, which is itself sticky at `top-14`.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified |
| --- | --- | --- |
| AC1 | Two-column grid in `page.tsx`; sticky rail | Unit test on the class list asserting `self-start` accompanies `sticky`; manual scroll check |
| AC2 | `FacetGroup` renders `{label, count}` from `fetchTireFacets` | Component test with a fixed facet payload |
| AC3 | One extra facet query per active group, that group's own filter removed | Repository test asserting the brand filter is absent from the rim query's params |
| AC4 | Rim options come from the query, not a constant | Test over data: every rim the fixture contains is offered |
| AC5 | Same | Test with a rim absent from the fixture: it is not offered |
| AC6 | `BrandFacet` filters the rendered list on input | Component test: type `mich`, assert visible set, assert no navigation |
| AC7 | `AppliedFilters` chips built by `filterHref.remove` | `filterHref` unit tests: removing one preserves the rest, resets `page` |
| AC8 | Filters are `<Link>`s; `page.tsx` renders server-side | **Automated**: render the page component with a filter in `searchParams` and assert the returned markup is filtered, with no client hook involved. Plus a manual check with JS disabled |
| AC9 | `aria-current="true"` on applied links | **Repo-wide guard test: no `aria-pressed` on any `<a>`** — the same shape as `catalogHeadings.guard.test.ts` |
| AC10 | `FilterRailMobile` `<details>` with a count in its `<summary>` | Component test with two filters applied |
| AC11 | Heading built from the applied filters | Unit test on the heading builder; extends `catalogHeadings.guard.test.ts` |
| AC12 | `NoResultsFound` suggestions from the without-self counts | Component test; integration test on a known-empty combination |
| AC13 | Links are natively focusable; `focus-visible:ring` as elsewhere | Manual keyboard pass; axe run |
| AC14 | `/tires` pinned dynamic; counts computed per request | Test asserting the route exports the dynamic directive **and** that no `revalidate`/`unstable_cache` reaches the facet path — an assertion about what the route *does*, not only about what it lacks |
| AC15 | One `minPrice`/`maxPrice` pair; buckets write it, `RangeSlider` reads it | **Round-trip test in both directions** — bucket → slider, slider → bucket |
| AC16 | Brand options are ordinary filters; the foot-of-page brand index carries the landing-page links | Unit test: a brand link preserves other filters; index test asserts 115 links |
| AC17 | Brand links preserved | Test asserts the page links to **every brand `fetchBrands()` returns** — measured against the live brand list, not against a snapshot of today's markup |
| AC18 | `TireTable` renders the decision facts | Component test asserting each field is present |
| AC19 | `view` is a URL param that `filterHref` preserves | `filterHref` test: applying a filter keeps `view` |
| AC20 | As AC12 | Same |
| AC21 | Group order from one exported constant | Test asserting the rendered order equals the constant |

## Tradeoffs / alternatives

**One query per active group, not one for everything.** A single query is
cheaper but produces the classic facet bug: with Pirelli applied, every other
brand counts zero and the buyer can never switch brands. Rejected.

**Not caching the counts.** FR5 requires it, and the catalogue moved by eight
tires during one working session. The parallel measurement makes caching
unnecessary.

**Rewriting `SearchResults` completely, rejected.** It also owns pagination,
sorting and the post-SSR client refetch. This feature removes what it should not
own and leaves the rest; the client refetch is redundant once filters navigate,
but removing it is a separate change with its own risk.

**Buckets and slider as one state (FR13), not two.** The alternative — a
`priceBucket` param beside `minPrice`/`maxPrice` — is what makes two controls
drift apart. One pair of numbers in the URL; the bucket is *derived* from them
for display. AC15 asserts the round trip in both directions.

**Deriving the SQL `CASE` from the bucket constants** rather than writing it
twice. Slightly more code, and it makes a silent divergence between the label and
the SQL impossible.

## Resolved — brand links

> Confirmed 2026-08-25: the recommendation below is what gets built.

**Chosen:** brand options in the rail are ordinary filters
(`?brands=PIRELLI`), like every other facet, **and** `/tires` gains a
server-rendered "Browse all brands" list at the foot of the page carrying all
115 links to the brand landing pages.

This keeps what the `/clarify` answer was for — **no brand page loses an inbound
link from `/tires`** (AC17 still passes, by counting) — while avoiding the
consequence I failed to state: that following a brand into a landing page leaves
the buyer on a page with no filters and no way back into them.

**The alternative that matches the letter of the decision** is to send brand
clicks to `/tires/brands/{slug}` and give that route the rail as well. It is
coherent, and it is a materially larger feature: the route accepts a route
parameter and no query string today, so it would need filter parsing, facets,
pagination and the table view — effectively a second catalogue page — and
`/tires/new` and `/tires/used` would then be inconsistent with it.

This replaces the `/clarify` answer's *mechanism* while keeping its *purpose*.
The spec's FR14 and AC16 are restated to match.

## Risks

| Risk | Mitigation |
| --- | --- |
| Touching shared filter components breaks `/dashboard` | Nothing shared is modified; a test asserts `Dashboard.tsx` still renders `TopFilters` |
| `sticky` silently does nothing without `self-start` | Named in the plan, asserted in a test, checked manually |
| The rail hides behind the sticky site header | `top-20` against the header's `top-14`; manual check |
| Facet counts and results disagree | Both go through `buildFiltersClause`; a test runs one filter through both paths |
| Removing the hero from `SearchResults` breaks the `<h1>` or its metadata | `catalogHeadings.guard.test.ts` already covers the city wording; AC11 extends it |
| Mobile regression | **`/tires` mobile has not been verifiable in this environment** — the resize tool reports success without changing the viewport. This needs a real device check before merge, and the feature is not done without it |
| The table view drifts into the TireCard redesign | Boundary stated in the spec: add a presentation, do not restyle the row |
| A hand-written SQL `CASE` drifts from the bucket labels | The `CASE` is generated from `facetBuckets.ts` |
| `/tires` gets prerendered and serves yesterday's counts | Pinned dynamic on the route, asserted by test (AC14) |
| The range control cannot render server-side without bounds | `fetchTireRanges()` joins the `Promise.all` |
| `BrowseFilters` keeps 254 `aria-pressed` links alive on three landing pages | Fixed at the source (T0), which repairs those routes too |

## Out of scope

- `/tires/new`, `/tires/used`, `/tires/brands/[brand]`, `/tires/size/[size]` —
  they keep `BrowseFilters`.
- `/dashboard` and the home-page filters.
- Removing `TopFilters` / `useFilters` from the codebase.
- Removing the post-SSR client refetch in `SearchResults`.
- The TireCard redesign.

## A note on process

`CLAUDE.md` requires the **`modern-web-guidance`** skill before building a new
interface. **It is not installed in this environment** — the name resolves to
nothing. The UI decisions here are instead grounded in the sister project's
`FilterRail`, which is on disk and was built for this purpose, and in the
measurements taken from the running page. Worth installing before `/implement`.

---

_The concrete steps live in [tasks.md](./tasks.md)._
