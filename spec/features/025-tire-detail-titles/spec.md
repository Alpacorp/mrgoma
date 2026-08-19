# Spec — Titles that fit in a search result

> Feature: `025-tire-detail-titles` · Status: Implemented · Created: 2026-08-19
> Roadmap: SEO audit, path "C" of block 5 · Branch: `feat/025-tire-detail-titles`

## Why — problem & value

The tire detail page is the largest route on the site — **1,622 pages**, more than
every other route combined. It is also the only route whose title nobody has ever
seen in full.

Measured over **1,400 real units** from `/api/tires`:

| | today |
| --- | --- |
| titles longer than 60 characters | **1,400 of 1,400 — 100%** |
| median length | 96 characters (max 127) |
| titles whose price survives the cut | **43%** |
| titles where "Free Shipping" survives | **0** |

A rendered title reads:

```
Used BRIDGESTONE ALENZA A/S 02 RSC RFT 235/50/20 Tire in Miami | $135 | Free Shipping | MrGoma Tires
└────────────── what Google shows, ~60 chars ─────────────┘
```

Everything after `Tire in Mia…` is discarded — always "Free Shipping", and the
price on the 57% of pages whose brand and model are long enough to push it past
the cut. Both were added by feature `014` specifically to lift click-through, and
both are paid for on all 1,622 pages.

Three separate causes stack up:

1. **The differentiators are last.** Price and shipping sit at the end of the
   string, so they are the first thing truncation removes.
2. **The brand is printed twice.** The route returns `title` as a plain string, so
   the root layout's `%s | MrGoma Tires` template appends the brand on top of the
   one the string already ends with. This is the exact defect `021` removed
   everywhere else; the largest route was never converted.
3. **`Tire in Miami` costs 14 characters** of a 60-character budget on every page,
   while the model name — the longest, most variable piece — is allowed to run to
   51 characters unchecked.

**The audit's headline number is partly fictional.** It reports 1,622 pages with
1,140 unique titles and treats uniqueness as the goal. In the measured sample
there are 929 distinct titles — but only **707 distinct openings within the 60
characters Google renders**. So 222 titles differ only in text no searcher ever
sees. Counting whole strings measures a uniqueness that does not exist.

The descriptions have the same shape of defect, though **less severely than first
written here**: **70% exceed 160 characters** (median 187), and because the price
is appended by the caller *after* the builder returns, it survives the cut on only
**31%** of them. An earlier draft of this spec claimed 91% and "always cut"; that
came from measuring against `KindSaleId`, which is the run-flat flag — the
condition is `ProductTypeId`, and getting it wrong put new tires in the used
branch and lengthened every description that has no tread-life clause.

This is path **"C"** from the block-5 analysis — differentiate what searchers
actually see, without touching a single URL. It is deliberately the cheap,
reversible move that comes *before* the URL work.

## User stories

- As **someone searching "used 225/55/18 tires miami"**, I want the result to show
  me the brand, the size and the price before it runs out of room, so that I can
  tell two listings apart without opening both.
- As **the shop**, I want the price we compete on to reach the search result, so
  that the work done in `014` actually reaches a searcher.

## Scope

- **In:** `productTitle()` and `productDescription()` in `seo.ts`; the metadata
  block of `/tires/[slug]`; brand casing; a guard test over the length budget.
- **Out:** URL consolidation, sets of 4/2, and the tire-card redesign — all block
  5. No change to `<h1>`, page copy, images, or the Product JSON-LD. No change to
  any other route's titles (`021` already settled those).

## Functional requirements

- **FR1:** A detail-page title fits in **60 characters**, always.
- **FR2:** Within that budget the pieces are kept in a fixed order of priority:
  **condition, brand, size** are never dropped; then **model**, then **price**,
  then the **brand suffix** — the suffix is sacrificed first, the model last.
- **FR3:** The title is returned as `title: { absolute }`, so the root template
  cannot append the brand a second time.
- **FR4:** The brand is rendered in title case (`BRIDGESTONE` → `Bridgestone`) and
  trimmed. The **model is left exactly as the database spells it** — see
  *Constraints*.
- **FR5:** The description leads with the tire and its condition, states the price
  **within the first 160 characters**, and does not exceed 160.
- **FR6:** The Open Graph and Twitter titles are **not** subject to the 60-char
  budget — social cards render more — and keep the fuller form including the
  price and "Free Shipping".
- **FR7:** Both builders normalise their own whitespace. A record with no model or
  no size must not leave a gap where the value would have gone.

## Acceptance criteria (testable)

- [x] **AC1:** For **every fixture in the guard's table**, `productTitle()` returns
      a string of **≤ `TITLE_MAX` (60) characters**. The table is drawn from the
      catalog's worst real cases — including a 51-character model — plus the
      degenerate inputs (no price, no model, no size). *The 1,400-unit sweep is a
      measurement, not an assertion: it lives in AC8.*
- [x] **AC2:** `productTitle()` drops nothing that is **present**: for every
      fixture, each of condition, brand and size that was supplied appears in the
      returned string. Partial input is real — `mapTireRecordToSingleTire` leaves
      `size` and `model2` `undefined` when the record has none.
- [x] **AC3:** Given a brand+model+size that leaves room, the price is present;
      given one that does not, the **brand suffix is absent before the price is**.
      Asserted with one fixture per rung of the ladder.
- [x] **AC4:** `productMetadata()` returns `title: { absolute: … }` — not a plain
      string — and that title contains `MrGoma` **at most once**. Asserted on the
      returned object; that the built page's `<title>` agrees is the manual check.
- [x] **AC5:** `brandName()` returns `Bridgestone` for `'BRIDGESTONE'`,
      `Back Country` for `'BACK COUNTRY '` (trailing space, as stored) with no
      double space, and `BFGoodrich` for `'BFGOODRICH'`. A title built from any of
      them contains that spelling.
- [x] **AC6:** A model containing `A/S`, `RSC`, `RFT` or `XL` passes through with
      that spelling unchanged.
- [x] **AC7:** `productDescription()` — which now composes the price itself —
      returns ≤ `DESCRIPTION_MAX` (160) characters, and the substring `$` appears
      at an index < 160, for every fixture.
- [x] **AC8:** Measured over the same 1,400-unit sample, the number of **distinct
      first-60-character openings** is **higher than today's 707**. Recorded in
      `results.md` as a measurement, not asserted in the suite.
- [x] **AC9:** `openGraph.title` and `twitter.title` still contain the price and
      `Free Shipping` for a unit that has a price.
- [x] **AC10:** No title contains a double space. `fitTitle` selects by length and
      **does not normalise whitespace** — unlike `fitDescription`, which does — so
      any absent field would otherwise leave a gap where its value was.

## Non-functional / constraints

- **The 60-character budget is a convention, not a guarantee.** Google truncates
  by pixel width, not characters, and rewrites titles when it prefers its own. 60
  is the widely used proxy; this feature commits to it as a *budget we control*,
  and AC8 is stated as a measurement precisely because the outcome is not ours to
  assert.
- **Model names are not title-cased, deliberately.** The catalog holds **96
  distinct all-caps tokens of three letters or fewer** — `XL`, `RFT`, `RSC`,
  `MOE`, `A/S` — against a handful of real words spelled the same way (`ALL`,
  `NO`, `FIT`, `PRO`). Any length-based rule mangles one set or the other: a first
  attempt at this produced `Primacy ALL Season`. An allow-list would need 96
  domain judgements. The brand list is closed (**75 values**) and small enough to
  verify by eye, so casing is applied there and nowhere else.
- **This lowers the audit's own headline metric and that is expected.** Whole-string
  uniqueness falls (929 → ~905 in the sample) because shorter titles collapse some
  near-duplicates. Uniqueness *within the visible portion* rises (707 → ~905).
  The second number is the one that describes what a searcher sees; `results.md`
  must report both so the change is not later read as a regression.
- **The 140-character description floor is a preference here, not a rule.**
  `metadata.test.ts` asserts `DESCRIPTION_MIN` for every page `021` owns, and
  those pages have fixed copy. A product description is built from the record, so
  a tire with no tread-life reading and a short brand cannot reach 140 without
  padding it with words that say nothing. `fitDescription` already encodes exactly
  this preference — it takes the window when a candidate lands in it, and
  otherwise the longest that does not overflow. Measured after implementation: **58% land in 140–160,
  42% below, none above.** Product pages are therefore deliberately **not** added
  to the `metadata.test.ts` table, and AC7 asserts only the ceiling.
- No change to page weight: `seo.ts` is server-only and the route is already
  server-rendered. `npm run perf:budget` must not move.

## Open questions

None. The two decisions that could have blocked — how to case model names, and
whether to keep the brand suffix — are settled above against measured data.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
