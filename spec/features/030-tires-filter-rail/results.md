# Results — 030-tires-filter-rail

> Started 2026-08-25 · Status: in progress

## Found while implementing, and NOT fixed here

**1.127 priced, in-stock tires never appear on the storefront** because
`RemainingLife` is blank, not because their life is low.

Measured against the live catalogue:

| | tires |
| --- | ---: |
| Priced, not sold, not local, not trashed | 5.322 |
| Of those, hidden by the life rule | **1.128** |
| …because life is **blank** | **1.127** (952 used, **175 new**) |
| …because life is genuinely below 50% | **1** |

So the rule reads as "at least half its life left" and behaves as "**someone
recorded a life value**". The 175 new tires are the sharpest case: a new tire's
remaining life is not in doubt, and they are excluded from the catalogue, the
sitemap, the Google Merchant feed and every facet count in this feature.

**Not changed here.** What the shop is allowed to sell is a business rule and a
question for the owner, not a side effect of a filter redesign — and it would
move the feed, the ads and the indexed page count at the same time. Recorded so
the decision is deliberate.

**Two questions for the owner:**

1. Should a tire with no recorded remaining life be sellable — at least when it
   is **new**?
2. If yes, what should its listing say where used tires show a percentage?

## The 500 that every gate missed

`FilterRail` (server) passed a `format` function to `RangeFacet` (client).
Functions cannot cross that boundary, and React says so **at request time**:

```
Functions cannot be passed directly to Client Components
  <... format={function}>
```

`npx tsc --noEmit`, `npm run lint`, `npm run build` and **1.427 tests were all
green while `/tires` answered 500.** None of them renders a server component
into a client one — the build compiles the boundary, it does not cross it.

Fixed by passing a name instead of a function (`unit="currency"`), which is
serialisable. The lesson is the same one `026` learned about a missing
`'use client'`, one level further out: **the Definition of Done cannot see a
server/client boundary. Loading the page is the only gate that can.**

## What the rail costs, measured rather than assumed

`npm run perf:budget` passed unchanged (621.6 KB of 680 KB client JS) — it
measures JavaScript, and this feature adds almost none. It does not see HTML.

Fetched from the running page, before and after:

| | raw | gzipped |
| --- | ---: | ---: |
| `/tires` before | 363 KB | **32.7 KB** |
| `/tires` after | 485 KB | **43.8 KB** |

**+11.1 KB compressed, +34%.** Most of it is the rail being in the markup twice
— once in the desktop `<aside>`, once inside the mobile `<details>` — because the
two need different elements and both must be server-rendered for the filters to
work without JavaScript.

**Not optimised away, on purpose.** A single render is possible with
`details::details-content { content-visibility: visible }` to force the
disclosure open on desktop; it was tested here and works, and
`CSS.supports('selector(details::details-content)')` returns true in this
browser. But it is a recent feature, the legacy fallback path cannot be
exercised in this environment, and **only Chrome is available to verify it**. The
constitution orders correctness and accessibility above performance, so an
11 KB saving does not justify shipping a layout trick that might collapse the
filters entirely on an engine nobody here can test. Recorded as a follow-up
rather than guessed at.

## The exhaustive pass

Run against the live catalogue, on the running site.

### Every count was checked against what its own link returns

A count is a promise: *"pick this and you will see 825 tires."* So every option
the rail renders was followed, and the result compared with the number beside it.

| starting view | options checked | mismatches |
| --- | ---: | ---: |
| unfiltered | 76 | 0 |
| `?d=20` | 60 | 0 |
| `?brands=PIRELLI` | 50 | 0 |
| `?condition=used` | 67 | 0 |
| `?minPrice=100&maxPrice=149` | 60 | 0 |
| `?w=225` | 57 | 0 |
| `?brands=PIRELLI&d=20` | 37 | 0 |
| `?view=table&d=23` | 40 | 0 |
| `?patched=no&kindSale=no` | 70 | 0 |
| **total** | **517** | **0** |

The empty state's promises were checked the same way: *"Remove 13" → 957 tires"*
leads to a page showing exactly 957.

### 42 behaviours, including the ones nobody types on purpose

Filter combinations, sort, pagination, page size, the view toggle, unknown
parameters, `?view=nonsense`, `?d=abc`, negative and impossible prices, a crossed
range, an unknown brand, `?brands=PIRELLI' OR 1=1--` and
`?brands=<script>alert(1)</script>`. **Every one answers 200** with a sensible
count; the injection attempts return no rows and render as inert text.

## Four defects found by testing, and fixed

### 1. One tire was taking down whole pages — and it was not this feature

**`next/image` throws during render for a host it is not configured for.** It
does not fall back, and `onError` never fires, because nothing ever loads.

Exactly **one tire of 4.129** carries an eBay-hosted photo. It was enough to:

- make its own detail page answer **500** (`/tires/405630-pirelli-285-40-22`);
- make **every filtered view containing it** render the loading skeleton forever
  instead of results. A buyer asking for new Pirellis saw no tires at all.

Confirmed against the pre-change code: same 500, same blank views. **This was
live before this feature and would have been read as the rail breaking the site.**

Three components each had their own answer to "is this URL usable", and **none of
them looked at the host**: one parsed the URL, one checked the prefix, and
`ProductImageZoom` — the one that 500ed — did not check at all. There is now one
`isOptimisableImage`, `next.config.mjs` and the source share a single host list
held together by a guard, and an unknown host degrades to the placeholder.

An existing test asserted that **any** absolute URL was accepted. It was green
while the bug was live; it now asserts the opposite, with the reason.

### 2. The counts described the option, and the link did something else

With Pirelli applied, the Bridgestone option read **"Bridgestone 440"**. Clicking
it returned **1.397** — brands combine with OR, so the click adds rather than
replaces. Both numbers are true. The presentation was not: a plain link with a
number beside it promises that number.

**Found by clicking it**, not by reading the code, and every test passed
throughout.

Fixed by making the addition visible: the four additive groups — brand,
condition, patched, run-flat — now render a checkbox, as the filters this rail
replaced already did. Size does not: a tire has one width, one profile, one rim.

### 3. The rail disagreed with the AI chat about what was applied

The catalogue stores brands in capitals and the rail writes them that way. **The
AI chat emits what a person typed** — `brands=Michelin`.

Compared exactly, the results filtered correctly (294 Michelins), the heading and
the chip both said Michelin, and **the rail showed Michelin unticked**. Clicking
it appended a second spelling: `brands=Michelin,MICHELIN`.

Values are now compared without regard to case, which is how SQL matches them.

### 4. "Clear all" was rendered twice

Both the rail's header and the applied-filter chips drew one, four lines apart.
Neither a type nor a test could see it — it only appears when both are on screen.

## Accessibility, measured with axe rather than by eye

`axe-core` in the page, `wcag2a + wcag2aa + wcag21a + wcag21aa`:

| | violations from this feature |
| --- | ---: |
| `/tires` unfiltered | 0 |
| `/tires` filtered | 0 |
| `?view=table` | **0 of any kind** |
| empty state | **0 of any kind** |

Two real contrast failures were found **and fixed**: counts at `text-gray-400`
(2.85:1, 62 nodes) and applied counts on the green chip (3.07:1, 23 nodes).

**20 pre-existing violations remain**, all the same one: white on `bg-green-600`
— the brand green named in `tech-stack.md` — measures **3.21:1** against the
4.5:1 AA requires. Every "Add to Cart" on the site. **Not changed here**:
repainting the primary button is the owner's decision.

`RangeSlider` had no `role`, no `tabIndex` and no keyboard handling — **WCAG
2.1.1, Level A**, live on `/tires`, `/dashboard` and the home page. Fixed
additively; all three surfaces gain it.

My own heuristic reported five unnamed controls in the rail. **All five were
false positives** — a labelled input whose `<label>` it could not see, and four
`type="hidden"` fields. The accessibility tree is the authority, not a regex.

## What still cannot be verified here

**Mobile.** The resize tool in this environment reports success without changing
the viewport, so `/tires` on a phone has not been seen. The markup is right — the
collapsed control reads "Filters · 2 active", all nine groups, the brand search
and both sliders are inside a native `<details>` — but **that is structure, not a
look at it.** It needs a real device before merge.

## The redesign round

Three changes asked for after seeing it built, plus one the second of them
exposed.

### The brand index at the foot of the page is gone

It was a wall of 115 links. **Checked before removing it**, not after: the brand
landing pages are linked from the **sitemap** (all 115) and from the browse strip
on `/tires/new`, `/tires/used` and every brand page — **115 links each**. `/tires`
was one of four routes linking them, and it still links the brands of whatever it
is currently showing, through the tire cards. Removing it orphans nothing.

### Brand is now the first filter

It had been under condition and three long size lists — the control buyers reach
for, furthest from the top.

### The three size groups fold away, and the long groups have their own search

Width, profile and rim hold 22, 17 and 14 values: **53 rows** between the top of
the rail and the price filter, in a 240 px column, for lists most buyers never
open because they already know their size and type it.

They are now native `<details>` — folding without JavaScript — that open
themselves when something in them is applied and name the applied value while
folded. Measured: **45 px each, down from ~700 px between them.**

Brand, width, profile and rim each have a search box, generalised out of the
brand one into `SearchableFacet`.

| | height |
| --- | ---: |
| Rail before this round | ~2.100 px |
| Rail after | **1.434 px** |
| Brand + condition + all three size groups | **~650 px** — above the fold |

The exact-range sliders inside Price and Tread life were folded too. **That one
saved less than predicted**: 68 px across both, not the ~160 px estimated,
because the "Set an exact range" line costs nearly what it hides. Kept — the
bands are the filter and the slider is the escape hatch — but the number is
recorded rather than rounded up. A hand-set range opens the disclosure itself,
since no band would show it.

### The regression the search boxes introduced, and how it was caught

Making a group searchable meant rendering **eight** options and a "Show all"
button. It looked identical. It was not:

```
rim sizes in the raw HTML:  13 14 15 16 17 18 19 19.5
```

**23" (93 tires), 24" (7) and 26" (2) had vanished** — the exact 102 tires this
rail was built to make reachable, put back out of reach behind a button that
needs JavaScript to work. A crawler saw eight rim sizes.

Caught by the count verification: coverage dropped from 517 options to 381, and
the missing ones were the point of the feature.

The component's own comment already claimed *"the whole list is rendered, then
hidden"* — **the comment was right and the code was not.** Now every option
reaches the markup and the overflow is hidden with CSS.

Re-verified afterwards: **1.010 options checked across nine filter states, 0
mismatches** — nearly double the earlier coverage, because everything is in the
markup again.

### What it costs

| | raw | gzipped |
| --- | ---: | ---: |
| `/tires` before the feature | 363 KB | 32.7 KB |
| `/tires` now | 621 KB | **50.7 KB** |

**+18 KB compressed.** Rendering every option of every group is most of it, and
it is not optional: withholding them is the regression above. The rail also
appears twice — desktop `<aside>` and mobile `<details>` — which remains the
single largest saving available, and is still declined for the reason recorded
earlier: the CSS that would allow one render can only be verified in Chrome here.

`npm run perf:budget` passes unchanged (623.5 KB of 680 KB) — it measures
JavaScript, and this is HTML.

Accessibility re-run after all of it: **0 violations from anything this feature
adds**, on the unfiltered page, a filtered page, the table view and the empty
state.

## Mobile, finally seen

The resize tool in this environment reports success without changing the
viewport, so mobile had gone unverified through the whole feature. It was checked
in the end by loading `/tires` inside a **390 px `<iframe>`** — an iframe gets its
own viewport, so the media queries actually fire, which resizing the window never
did here. Worth remembering.

The owner's phone screenshot showed the real thing first, and it found two
defects a desktop browser could not.

### The page overflowed sideways

The header and the hero rendered at screen width while the cards ran off the
right, and the browser zoomed out to fit — the whole page half the size it should
be.

**Cause: `min-width: auto`.** A grid item refuses to shrink below its content's
intrinsic width, and this feature made the results column a grid item for the
first time. `max-w-3xl` had never prevented it; there had simply never been a
grid. One class — `min-w-0` — and the document is 390 px wide again, measured
inside the iframe.

### Two controls called "Filters", one of them dead

`ResultsHeader` still rendered the green button that opened the mobile filter
**drawer** — the thing the rail replaced. On a phone it sat one screen below the
rail's own disclosure, and tapping it opened a panel that is no longer part of
the page.

Gated rather than deleted: `/dashboard` still uses that drawer, and
`ResultsHeader` is shared with it.

### And the panel repeated its own summary

Tap "Filters", and the panel that opens says "Filters" again four lines down. The
title is now dropped inside the disclosure; Clear all stays.

## The skeleton was narrower than the cards

`ResultsSkeleton` kept `mx-auto max-w-3xl` when `TireResults` lost it in T16, so
the placeholders drew at 768 px, centred, and the real cards replaced them at
944 px, wider and shifted left. **The page jumped at the exact moment the buyer
starts reading it.**

Measured after the fix: skeleton **1022 px**, list **1022 px**, same left edge.

`resultsWidth.guard.test.ts` now compares the two wrappers class for class, since
a skeleton's only job is to be the shape of what replaces it. Verified red by
restoring the cap.

### The disclosure looked like two unrelated sections

Reported from the phone: a wide gap between "Filters" and the panel it opens,
reading as two independent blocks rather than one control and its contents.

The summary and the panel each drew their own `rounded-xl border bg-white` card,
with `mt-3` between them. The card now belongs to the `<details>`, the summary
and panel are bare inside it, and a rule under the summary appears only when the
panel is open.

Measured after: gap **0 px**, same left edge, **0** bordered boxes nested inside.

