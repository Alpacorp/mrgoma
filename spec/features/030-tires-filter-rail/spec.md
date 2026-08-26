# Spec — Filters that say how much is behind them

> Feature: `030-tires-filter-rail` · Status: Clarified · Created: 2026-08-25
> Roadmap: catalog UX (new entry) · Branch: `feat/030-tires-filter-rail`

## Why — problem & value

The mission's first experience pillar is **frictionless search**: find the right
tire in the fewest steps. `/tires` is where that promise is kept or broken, and
today it is broken in a specific way — **the filters never tell you what is
behind them.**

A buyer picks a brand, then a rim size, and the page answers **"No Tires
Found"** — then leaves every one of the 114 brand chips and every rim size on
screen, saying nothing about which would have worked. That is not an edge case:
of the 1.610 brand × rim combinations the page offers, **only 338 have stock.
Four out of five clicks lead nowhere.**

Meanwhile the opposite failure runs alongside it. The rim sizes are a fixed list
that no longer matches the warehouse: it offers **14"**, which has one tire,
and it omits **23", 24", 26" and 19.5"** — **102 tires that are in stock and
that no buyer can reach**.

Both faults have one cause: **the filters are written by hand instead of read
from the stock.** A filter built from the catalogue cannot offer what does not
exist, and cannot hide what does.

Three more things were measured on the running page and belong here because they
are the same page and the same visit:

- **There is no brand search.** 115 brands are presented as a horizontal
  carousel the buyer has to scroll sideways through.
- **The layout wastes the room the fix needs.** The results list is capped at
  768 px and centred inside a 1216 px container, leaving **224 px blank on each
  side**. A filter rail fits in that blank space, and the results end up
  **wider** than they are today, not narrower.
- **254 links on the page carry `aria-pressed`**, an attribute that belongs to
  buttons. The same defect in the sister project produced thirty axe violations;
  here it is eight times larger, against a WCAG 2.1 AA commitment.

The value is trust as much as speed: a count beside every option is the
**transparency-over-hiding** principle applied to navigation. The buyer stops
guessing.

## User stories

- As a **tire buyer**, I want to see **how many tires each option has** before I
  click it, so that I never land on an empty page.
- As a **tire buyer**, I want the filters to **stay beside the results while I
  scroll**, so that I can narrow things down without going back to the top.
- As a **buyer who knows the brand**, I want to **type its name**, so that I
  don't scroll sideways through 115 chips.
- As a **buyer looking for an unusual size**, I want **every size that is in
  stock to be reachable**, so that the catalogue I browse is the catalogue that
  exists.
- As a **buyer using a screen reader or keyboard**, I want the filters to be
  **announced correctly and reachable without a mouse**, so that the page is
  usable at all.
- As a **buyer on a phone**, I want the filters **out of the way but one tap
  away**, and I want to see **how many are active** while they are closed.

## Scope

- **In:** the filter controls on `/tires` — their placement, their counts, their
  markup, the brand search, the applied-filter summary, and the mobile
  equivalent.
- **In:** the layout of `/tires` insofar as the rail requires it (the results
  column stops being centred and takes the width the rail leaves).
- **In:** removing the duplicate ways to apply the same filter, so that a filter
  lives in exactly one place.
- **In:** a second way to read the results — a compact table for the **2.089 of
  4.149 tires (50,3%) that have no photo**, where the current row spends its best
  space on a placeholder.
- **Out:** the design of the existing tire row. **The TireCard redesign is a
  separate roadmap item** and stays there; this feature adds an alternative
  presentation beside the row, it does not restyle it.
- **Out:** the tire detail page, the home-page hero filters, and the dashboard
  filters.
- **Out:** new filter dimensions. This feature changes how the existing filters
  are presented and counted, not which facts a buyer can filter on.
- **Out:** the AI chat, which sets the same URL parameters and therefore keeps
  working unchanged.

## Functional requirements

- **FR1 — One place per filter.** Every filter is presented once. Brand and rim
  size are currently offered twice each (a chip row *and* a dropdown); after this
  feature each exists in exactly one place.
- **FR2 — The rail travels with the results.** On desktop the filters sit beside
  the results and remain visible while the buyer scrolls the list. When the
  filters are taller than the screen they scroll within themselves, never
  clipping the last group.
- **FR3 — Every option carries its count**, and the count reflects the other
  filters already applied.
- **FR4 — The options are the stock.** An option appears if and only if
  selecting it would return at least one tire. No value is hardcoded.
- **FR5 — Counts are current.** They are computed per request, and `/tires`
  states that it is dynamic rather than leaving it to inference. The sellable
  count moved by eight tires during a single working session; a figure fixed at
  build time would be wrong within hours, and the unfiltered page — the one whose
  counts matter most — is exactly the one a build can prerender.
- **FR6 — Brands are searchable** by typing part of the name, and the search
  narrows the visible list without a page load.
- **FR7 — What is applied is visible, and each part is removable** individually,
  plus a way to clear everything at once.
- **FR8 — Every filtered view is a real, shareable URL**, and applying a filter
  works without client-side JavaScript.
- **FR9 — Correct assistive markup.** A filter that navigates is announced as a
  link and marks its applied state with `aria-current`; `aria-pressed` does not
  appear on links anywhere on the page.
- **FR10 — Phones keep a compact entry point** that shows how many filters are
  active while closed.
- **FR11 — The heading describes the view.** A filtered result set does not
  present itself with the unfiltered page's heading.
- **FR12 — The empty result is not a dead end.** When a combination returns
  nothing, the page names the applied filters that could be removed **and how
  many tires each removal would return**, and offers to remove them.
- **FR13 — Price and tread life have two ways in, and one state.** A buyer can
  pick a named range with its count *or* set an exact span. **They are the same
  filter**: choosing a range moves the exact control, and moving the exact
  control updates which range reads as applied. There is one value in the URL,
  not two, so the two controls can never disagree.
- **FR14 — Brand options are ordinary filters.** They narrow `/tires`; they do
  not navigate to the brand landing pages.
  *(Twice revised. `/clarify` first sent brand clicks to the landing page — which
  has no filters, so following one threw the buyer out of the rail. `/plan`
  replaced that with a browse index at the foot of the page, which the owner then
  cut on sight: a wall of 115 links. **Measured before removing it**: the brand
  pages are linked from the sitemap (all 115) and from the browse strip on
  `/tires/new`, `/tires/used` and every brand page — 115 links each. `/tires` was
  one of four routes linking them, and it still links the brands of whatever it
  is showing through the tire cards.)*
- **FR15 — Two ways to read the results.** Beside the current row-with-photo
  list, a compact table shows more tires per screen without a photo. The choice
  is part of the URL, so a shared link opens the way the sender was reading it,
  and it persists while the buyer changes filters.
- **FR16 — Group order.** **Brand**, then condition, then the three parts of a
  size, then price, then tread life, then patched and run-flat.
  *(Revised: `/clarify` put condition first because it halves the catalogue.
  Seeing it built, the owner moved brand to the top — it is the filter buyers
  reach for, and it was sitting under three long size lists.)*
- **FR17 — A group must not cost more screen than it is worth.** Width, profile
  and rim hold 22, 17 and 14 values; drawn flat they were **53 rows** between the
  top of the rail and the price filter. They fold away, and open themselves when
  something in them is applied.
- **FR18 — Any group long enough to scroll gets its own search.** Brand, width,
  profile and rim. Every option stays in the markup — the search and the "show
  all" hide, they do not withhold — so the page works without JavaScript and a
  crawler sees the whole list.

## Acceptance criteria (testable)

- [ ] **AC1:** Given the unfiltered catalogue, when `/tires` is opened on a
      desktop width, then the filter groups render beside the results and remain
      on screen after scrolling past the first ten rows.
- [ ] **AC2:** Given any filter group, when the page renders, then every option
      shows a number, and that number equals the count of tires that selecting it
      would return.
- [ ] **AC3:** Given a brand is already applied, when the rim-size counts are
      read, then they reflect that brand — not the whole catalogue.
- [ ] **AC4:** Given the catalogue contains tires with 23", 24", 26" and 19.5"
      rims, when the rim group renders, then each of those values is offered.
- [ ] **AC5:** Given no sellable tire has a given rim size, when the rim group
      renders, then that value is absent — asserted over data rather than over a
      literal, so a future gap in stock is handled without a code change.
- [ ] **AC6:** Given the brand search is empty, when the buyer types `mich`, then
      only brands whose name contains it remain visible, with no navigation.
- [ ] **AC7:** Given two filters are applied, when the page renders, then both are
      shown as applied, each can be removed on its own, and removing one leaves
      the other in place.
- [ ] **AC8:** Given a filter is applied by opening its URL directly with
      JavaScript disabled, when the page renders, then the results are filtered.
- [ ] **AC9:** Given any filter is applied, when the page's accessibility tree is
      inspected, then the applied option is a link carrying `aria-current`, and
      **no link on the page carries `aria-pressed`**.
- [ ] **AC10:** Given a mobile width, when `/tires` is opened with two filters
      applied, then the filters are collapsed and the collapsed control shows
      that two are active.
- [ ] **AC11:** Given brand and rim are both applied, when the page's main
      heading is read, then it names what is being shown rather than the
      unfiltered catalogue.
- [ ] **AC12:** Given a combination with no stock, when the page renders, then it
      names at least one applied filter to remove, and removing it returns
      results.
- [ ] **AC13:** Given the page is operated with the keyboard only, when the
      buyer tabs through the rail, then every filter is reachable and its focus
      is visible.
- [ ] **AC14:** Given the catalogue changes, when `/tires` is requested again,
      then the counts change with it.
- [ ] **AC15:** Given the price range `$100–149` is chosen, when the exact
      control is read, then it shows that same span; and given the exact control
      is set to a span that matches a named range, then that range reads as
      applied. Asserted in both directions, because the risk of offering two
      controls is precisely that they drift apart.
- [ ] **AC16:** Given a brand plus a rim size, when the brand option is
      followed, then both filters survive and the buyer stays on `/tires` with
      the rail in place.
- [ ] **AC17:** Given a brand option is followed, then the buyer stays on
      `/tires` with the rail in place and the brand applied as a filter.
- [ ] **AC18:** Given the table view is chosen, when the page renders, then more
      tires fit on one screen than in the row view, and every fact the row shows
      that a buyer decides on — condition, size, name, price, remaining life,
      tread, patched, run-flat, stock — is still readable.
- [ ] **AC19:** Given the table view is chosen, when a filter is then applied,
      then the results are still shown as a table, and the URL still says so.
- [ ] **AC20:** Given a combination with no stock, when the page renders, then
      each applied filter is listed with the number of tires that removing it
      would return, and removing one returns exactly that many.
- [ ] **AC21:** Given `/tires` renders, when the filter groups are read in order,
      then they appear as **brand**, condition, width, profile, rim, price, tread
      life, patched, run-flat.
- [ ] **AC22:** Given nothing is applied, when the rail renders, then width,
      profile and rim are folded; and given one of them is applied, then that
      group is open and its summary names the applied value.
- [ ] **AC23:** Given JavaScript never runs, when the rail's markup is read, then
      **every** option of every group is present — including the rim sizes beyond
      the first few, which are the 102 tires this feature exists to reach.

## Non-functional / constraints

- **Accessibility is a requirement, not a nice-to-have** (WCAG 2.1 AA). This
  feature both fixes an existing violation and must not introduce another; a
  sticky rail must not trap focus or hide content behind the site header.
- **Mobile-first.** If the collapsed filter entry point is worse than today's on
  a phone, the feature is not done — regardless of how the desktop rail looks.
- **Performance is part of design.** Counting the facets must not make `/tires`
  slower to first paint. The measurement in the analysis says one grouped query
  answers all seven facets in ~218 ms and can run alongside the results query
  rather than after it; the plan must hold to that shape.
- **The page weight budget must not regress.** The current filter machinery is
  ~2.271 lines of client code; replacing dropdowns with links should reduce what
  ships to the browser, and `perf:budget` must stay green either way.
- **No change to the filter URL parameters.** The AI chat, the home-page hero and
  existing indexed links all set them; changing their names would break all
  three at once.
- **Voice.** Counts and empty-state copy in plain US English, written for a small
  screen.

## Decisions taken (`/clarify`, 2026-08-25)

| Question | Decision |
| --- | --- |
| Price and tread life: sliders or counted ranges? | **Both** — see FR13. One value in the URL, two ways to set it. |
| The brand carousel and rim-chip row above the results | **Removed.** The rail replaces them with counts, and they duplicate two dropdowns today. |
| A compact table view for the half of the catalogue with no photo | **In scope** — see FR15. |
| What an empty result should say | **Which filter to remove, and what removing it returns** — see FR12. |
| Where a brand option leads | **Stays a filter on `/tires`**; the landing-page links move to a browse index at the foot of the page — see FR14. Revised after `/plan` found the landing page has no filters. |
| Group order | **Condition → size → brand → price → tread life → patched → run-flat.** |

### What each decision costs, recorded rather than smoothed over

**Offering both a range and an exact control puts the same filter in two places,
which is the pattern removed elsewhere this month.** It is only safe because
FR13 makes them one filter with one state; if the plan ever gives them separate
URL values, this decision becomes the bug it resembles. AC15 asserts the
agreement in both directions.

**Removing the carousel removes 114 internal links** to the brand landing pages,
which the SEO work of blocks 0–4 built up. FR14 keeps them, and AC17 holds it
down by counting.

**The brand landing page cannot carry other filters today** — it accepts a route
parameter and no query string — so FR14 can only send a buyer there while brand
is the only thing applied. The plan has to say what happens on the second click.

**The table view widens the feature** into how results are read, next door to the
TireCard redesign. The boundary: this adds a presentation, it does not restyle
the existing row.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
_Grounded in [the read-only analysis](../../analysis/2026-08-25-tires-filter-rail.md)._
