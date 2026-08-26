# Analysis — moving the `/tires` filters into a left rail

> 2026-08-25 · Groundwork for the filter redesign
> Read-only study: SQL `SELECT`s and DOM measurements. Nothing was changed.

## The ask

Move every filter from the top bar into a left rail that stays with the results
as you scroll, give brands a text search, and take the FME catalogue as the
reference.

## Part 0 — What the browser corrected

Three claims in the first draft of this document were wrong. They were caught by
opening the page, which is why the figures below are measured rather than
reasoned.

| Claimed | Actually |
| --- | --- |
| 14" has **0** tires | 14" has **1** (`215/75/14`, Power King, $120) |
| **12** distinct rim sizes | **14** — the draft missed 14" and 19.5" |
| The top filter bar scrolls away | It is already `sticky top-14 z-30` |
| Results are a 4-column card grid | Results are a **single column, 768 px wide** |

The last one is not a detail. It changes the answer to "is there room?".

## Part 1 — What FME actually does

The reference is on disk, so this is what it does rather than what it looks like.

**Every filter is a `<Link>`.** No form, no client component, no JavaScript for
filtering at all. Its own comment states the consequence: the listing works with
JavaScript disabled or still downloading, and every filtered view is a real URL a
buyer can send to someone else.

**Counts are always shown**, with the reason written down: *"A facet without a
count makes the user guess whether clicking it will empty the page."*

**Applied facets carry `aria-current`, not `aria-pressed`** — they are links, and
`aria-pressed` belongs to a button role. axe reported thirty invalid ARIA
attributes before that change. **`/tires` renders 254 links carrying
`aria-pressed`** — measured in the page — from four sites in `BrowseFilters.tsx`
(lines 53, 67, 98, 221). The same defect as FME's, eight times the size.

**The rail is sticky**, and the comment flags the trap: `self-start` is
load-bearing, because a grid item stretches to the row height by default and
`sticky` then has nothing to move within — it silently does nothing.

```
grid gap-8 lg:grid-cols-[15rem_1fr]
  └ aside  lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto
  └ results
```

**On a phone the rail becomes a `<details>` disclosure** whose summary carries the
active-filter count, so it says something useful while closed.

## Part 2 — Is there room? There is 448 px of it, unused

Measured in the page at a 1512 px viewport:

| | px |
| --- | ---: |
| Content container (`max-w-7xl`) | **1216** |
| Results list (`mx-auto max-w-3xl`) | **768** |
| Blank gutter, left | **224** |
| Blank gutter, right | **224** |

The results are a `<ul class="space-y-6">` of full-width rows — not cards in a
grid. That list is capped at `max-w-3xl` and centred, so **448 px of the
container is empty on every desktop view**, and has been all along.

A 240 px rail plus a 32 px gap needs 272 px. The left gutter already gives 224 of
those.

**Verified live rather than calculated.** I injected the proposed rail into the
running page and re-measured:

```
before   rail —      list 768 px at x=365   (224 px blank each side)
after    rail 240    list 944 px at x=413   (0 px blank)
```

**The results list did not shrink. It grew by 176 px.** The four-stat footer on
each row — LIFE / TREAD / PATCHED / RUN FLAT — and the price/Add-to-Cart block
both read better with the extra width.

So the rail is not paid for by the results. It is paid for by whitespace.

## Part 3 — Can we afford the counts? Yes, and this corrects an earlier answer

The block-5 study measured facet counts at 1.8 s and concluded they needed
indexes or caching. **That measurement was of the wrong query shape.**

Seven facets — brand, condition, run-flat, patched, rim, width, sidewall —
measured server-side with `SET STATISTICS TIME`:

| shape | unfiltered | with a brand filter |
| --- | ---: | ---: |
| seven `GROUP BY` passes joined with `UNION ALL` | **876 ms** | — |
| **one pass with `GROUPING SETS`** | **218 ms** | **80 ms** |

Seven passes over a fifteen-table view cost seven scans. `GROUPING SETS` does the
same work in one. **No schema change, no index, no cache** — a four-fold
difference that comes entirely from asking properly.

The results query itself is ~100 ms server-side and independent, so the two can
run in `Promise.all` and the page pays the slower of the two rather than the sum.

**Facet counts are affordable.** That is the finding this design rests on.

They must also be computed per request: the sellable count moved from **4.157 to
4.149 during this session**. Stock changes hourly; a build-time count would be
wrong by morning.

## Part 4 — What the current filters get wrong

All of it visible to a buyer today.

**The rim sizes are hardcoded.** `BrowseFilters.tsx:85` declares
`RIM_SIZES = [13 … 22]`. Against the catalogue's 14 real values:

- **14" is offered and has exactly 1 tire.** 13" has 2.
- **23" (92), 24" (7), 26" (2) and 19.5" (1) are in stock with no way to browse
  to them** — **102 tires unreachable**, 23" alone bigger than 15", 24", 26",
  13" and 14" combined.

A facet built from the data cannot make this mistake. It is the clearest argument
for counts: the list *is* the stock.

**79% of filter combinations lead to an empty page.** Only **338** of the
115 × 14 = 1.610 brand × rim combinations have stock. Confirmed live at
`/tires?brands=PIRELLI&d=13`:

> Showing **0** of **0** results — **No Tires Found**

and the page still offers all 114 brand chips and every rim size, with nothing
saying which of them would have helped.

**115 brands, no search** — 114 chips render into the DOM as a horizontal
carousel. This is the ask.

**The same filter exists in two places.** Brand is in the carousel *and* in the
`Brands` dropdown; rim is in the chip row *and* inside `Tire Size`. That is the
pattern removed elsewhere this month.

**The heading never responds.** With brand and rim both applied, the `<h1>` still
reads "New & Used Tires in Miami & Orlando" and the section heading still reads
"All tires".

**The remaining-life slider spans 0–100%.** The storefront rule already excludes
anything under 50%, and only **5 tires of 4.149** sit below 60%. Three quarters
of the control's travel selects nothing.

**2.271 lines of client filter machinery** across `SearchResults` (509),
`TopFilters` (381), `useFilters` (601), `FilterBody` (226), `FilterMobileContent`
(292) and `BrowseFilters` (262), all shipped to the browser to do what links do.

**What the bar does well, and should be kept**: it is already
`sticky top-14 z-30 hidden lg:block`, so it does follow the scroll. What it
cannot do is show state — eight closed dropdowns look identical whether nothing
or everything is filtered.

## Part 5 — The distributions the design uses

Price falls into five near-even tiers, which is unusually kind:

| under $100 | $100–149 | $150–199 | $200–299 | $300+ |
| ---: | ---: | ---: | ---: | ---: |
| 416 | 1.341 | 1.024 | 949 | 419 |

Remaining life has three real tiers and a fourth that barely exists:

| 90%+ | 75–89% | 60–74% | 50–59% |
| ---: | ---: | ---: | ---: |
| 2.060 | 1.021 | 1.063 | **5** |

Condition splits **2.698 used / 1.451 new**.

Rim, from the data rather than a constant: 20" (837), 21" (807), 18" (690),
19" (647), 22" (513), 17" (304), 16" (215), 23" (92), 15" (31), 24" (7),
26" (2), 13" (2), 14" (1), 19.5" (1).

Brands are a long tail: Pirelli 964, Bridgestone 444, Continental 419,
Yokohama 399, Goodyear 340, Michelin 303 — six of 115 covering 69% — and
**32 brands have a single tire**.

## Part 6 — The proposed design

```
┌─────────────┬──────────────────────────────────────────────┐
│  Filters    │  Pirelli ×   20" ×              Clear all    │
│             ├──────────────────────────────────────────────┤
│ CONDITION   │  4.149 tires        Sort: Price ↑            │
│  Used 2.698 ├──────────────────────────────────────────────┤
│  New  1.451 │  ┌────────────────────────────────────────┐  │
│             │  │ [photo]  New  215/55/17                │  │
│ SIZE        │  │          Prinx Hicity HH2 All Season   │  │
│  width  ▾   │  │          $125          [Add to Cart]   │  │
│  profile ▾  │  │ LIFE 99% · TREAD 10.0 · PATCHED · RTF  │  │
│  rim    ▾   │  └────────────────────────────────────────┘  │
│             │  ┌────────────────────────────────────────┐  │
│ BRAND       │  │ …                                      │  │
│ [search 🔍] │  └────────────────────────────────────────┘  │
│  Pirelli 964│                                              │
│  Bridge  444│                                              │
│  Contin  419│                                              │
│  + 111 more │                                              │
│             │                                              │
│ PRICE       │                                              │
│  <$100   416│                                              │
│  100-149 1341                                              │
│             │                                              │
│ TREAD LIFE  │                                              │
│  90%+   2060│                                              │
│             │                                              │
│ PATCHED     │                                              │
│ RUN-FLAT    │                                              │
└─────────────┴──────────────────────────────────────────────┘
   240 px            944 px (was 768, centred in 1216)
   sticky, scrolls internally when taller than the screen
```

**Order is by how people actually shop**: condition first (New or Used splits the
catalogue in two), then size (what most arrive knowing), then brand, then price,
then the condition details.

**Everything that can be a link, is one**, with `aria-current` rather than
`aria-pressed`. Counts come from the `GROUPING SETS` query, so a value with no
stock never appears and the 14"/23" problem cannot recur.

**Price and tread life become bucketed links, not sliders.** The tiers above are
even enough to be useful, they carry counts, and they survive with no JavaScript.

**The brand search stays client-side.** All 115 render server-side; a small input
filters what is already there, exactly like the shelf-code search built for the
dashboard. Instant, and it degrades to the full list without JS.

**Two implementation details the live test surfaced.** The results column must
drop `mx-auto max-w-3xl`, or it stays 768 px centred inside its track and leaves
a gap between rail and results. And the rail's `top` has to clear the site header
(`top-14` today) — otherwise it pins under it.

**Mobile is a `<details>` disclosure** carrying the active-filter count, as FME
does.

**What stays a client component**: the brand search input and the mobile
disclosure's open state. That is all.

## Part 7 — What needs deciding before building

1. **Retiring the sliders for buckets.** Price and tread life become tiers with
   counts. It is a real change in how the page is used: a buyer can no longer ask
   for "$140 to $185". The tiers are even and countable; a slider is neither.
2. **The brand carousel and rim chips above the results.** The rail makes them
   redundant, and today they duplicate the `Brands` and `Tire Size` dropdowns.
   Removing them frees **218 px** above the fold (measured, brand label to filter
   bar); keeping them means the same filter lives in two places.
3. **The `<h1>` on a filtered view.** It says "New & Used Tires in Miami &
   Orlando" no matter what is applied.
4. **A table view.** **2.089 of 4.149 tires — 50.3% — have no photo.** A row
   built around a photo spends its best space on a placeholder for half the
   catalogue, which is what makes a compact table worth more here than it looks.

---

_Measured against the live catalogue and the running page on 2026-08-25.
No data and no code were changed._
