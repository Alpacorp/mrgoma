# Plan — Titles that fit in a search result

> Feature: `025-tire-detail-titles` · Based on: [spec.md](./spec.md) · Created: 2026-08-19

## Technical approach

**Almost nothing here is new.** The mechanism this feature needs already exists in
`seo.ts` and is used by every builder except the one that serves 1,622 pages.

`seo.ts:170` already holds the ladder the spec describes:

```ts
/** Picks the first candidate that fits Google's title width; hard-trims if none do. */
function fitTitle(...candidates: string[]): string {
  return (
    candidates.find(candidate => candidate.length <= TITLE_MAX) ??
    candidates[candidates.length - 1].slice(0, TITLE_MAX).trimEnd()
  );
}
```

`TITLE_SUFFIX` (`' | MrGoma'`), `TITLE_MAX` (60) and `DESCRIPTION_MIN/MAX`
(140/160) are already exported constants, and `fitDescription(head, tails)` at
`seo.ts:183` already picks the tail clause that lands in the display window. Eight
builders — `/tires`, brand, size, the seven stores, the eight services — go
through them.

The doc comment above that block states the rule this route breaks:

> Every title bypasses the root `%s | MrGoma Tires` template via
> `title: { absolute }` — the template costs 15 characters that the
> differentiator needs.

So the work is **migration, not invention**: put `productTitle` and
`productDescription` on the rails the rest of the site already runs on.

One genuinely new piece: `/tires/[slug]` composes its `Metadata` object **inline
in `generateMetadata`**, which is why nothing tests it. That same doc comment
explains why every other route was moved out:

> Three of the pages they serve build metadata inside a `generateMetadata` that
> also awaits database data, so testing the page modules would mean mocking
> `mssql`. Keeping the copy here means the regression guard in `metadata.test.ts`
> runs with no database and no mocks.

The product route is the last one still in that state. Extracting a pure
`productMetadata()` into `seo.ts` is what makes AC4 and AC9 testable at all,
rather than assertable only by grepping the route's source.

## Reuse first

| Existing | Used for |
| --- | --- |
| `fitTitle(...candidates)` — `seo.ts:170` | FR1, FR2 — the ladder itself |
| `fitDescription(head, tails)` — `seo.ts:183` | FR5 — description window |
| `TITLE_SUFFIX`, `TITLE_MAX`, `DESCRIPTION_MIN/MAX` | the budgets; no new constants |
| `WARRANTY`, `SHIPPING` — `brandClaims.ts` | description tails; no retyped claims |
| `absoluteTitle(meta)` — `metadata.test.ts:` helper | AC4; already throws on a plain-string title |
| `pageMetadata()`'s `images`/`locale` shape — `021` | keeps the product route's OG consistent |
| `absUrl()` | image URLs, unchanged |

Nothing new is created that an existing helper covers. The two additions are
`brandName()` (there is no casing helper today) and `productMetadata()`.

## Files to add / change

- **`src/app/utils/seo.ts`**
  - add `brandName(brand)` — trim, title-case, and a small exception map.
    `BFGOODRICH → BFGoodrich` is the only real exception in the catalog's 75
    brands; `'BACK COUNTRY '` (stored with a trailing space) is handled by the
    trim, which also removes a double space today's title emits.
  - rewrite `productTitle()` to return `fitTitle(...)` over six candidates.
  - add `productSocialTitle()` — the long form, for OG/Twitter (FR6).
  - rewrite `productDescription()` to compose through `fitDescription`, with the
    price in the **head** rather than appended by the caller.
  - add `productMetadata()` — pure, returns the whole `Metadata` object.
- **`src/app/(shop)/tires/[slug]/page.tsx`** — `generateMetadata` keeps the fetch,
  the `notFound` branch and the canonical-slug computation, then delegates to
  `productMetadata()`. The inline title/description/keywords/OG/Twitter block
  goes away. **No change to the JSON-LD path** — it uses `generateTireDescription`
  from `tireDescription.ts`, a different builder, and JSON-LD has no 160-character
  limit.
- **`src/app/utils/seo.test.ts`** — replace the two thin `productTitle` cases with
  a fixture table drawn from the real catalog, plus the description cases.
- **`src/app/utils/productMetadata.guard.test.ts`** *(new)* — the budget guard
  over every fixture, in the shape of the repo's other `*.guard.test.ts` files.

## Data & flow

No route change, no query-param change, no database read added or removed.
`generateMetadata` already awaits `fetchProduct(productId)`; the same object is
passed on.

The mapper (`mapTireRecordToSingleTire`) pins down what the builders actually
receive, and three of its guarantees matter:

- `condition` is **always** `'New'` or `'Used'` (`ProductTypeId === 1 ? …`) — never
  empty, so AC2's "condition is never dropped" is satisfiable.
- `brand` falls back to `'Unknown'`, never empty.
- `price` is `record.Price?.toString() || '-'` — **the `'-'` sentinel**, invisible
  to TypeScript. `Number('-')` is `NaN`, which today's `isFinite` check already
  handles; the rewrite must keep that check rather than assume a number.

**The title ladder**, most complete first:

```
1  {Cond} {Brand} {Model} {Size} — ${Price} | MrGoma
2  {Cond} {Brand} {Model} {Size} — ${Price}
3  {Cond} {Brand} {Model} {Size}
4  {Cond} {Brand} {Size} — ${Price} | MrGoma      ← added during implementation
5  {Cond} {Brand} {Size} — ${Price}
6  {Cond} {Brand} {Size}
```

The brand suffix is sacrificed first because it is the only piece that is
identical on all 1,622 pages; the model is sacrificed last because it is the piece
a searcher may have typed.

**Rung 4 was not in the first draft**, which went straight from "drop the price"
to "drop the model *and* the suffix". A test written from that draft failed
against the 51-character-model fixture and was right to: dropping a model that
long frees far more room than the suffix costs, so sacrificing both is waste.

Measured over the 1,400-unit sample, running the shipped builders:

**Nothing exceeds 60** (median 55, was 96), **92% keep the model**, **90% keep the
price inside the visible 60** (was 43%), **58% still carry the brand suffix**, and
distinct visible openings rise **707 → 905**.

**The description** puts the price in the head, then picks a tail:

```
head   {Cond} {Brand} {Model} {Size} tire in Miami for ${Price}.
       (falls back to dropping the model when the head passes 95 chars)
tails  used: "{life} tread life left, {patched}. {SHIPPING} and a {WARRANTY}. Buy online or visit us."
       new:  "Brand new, unused. {SHIPPING} and installation at {LOCATIONS_LABEL_LONG}."
       …each with shorter variants after it
```

Measured after implementation: **58% land inside 140–160**, **none exceeds 160**, and **100% show the
price before character 160**. Today: median 187, **70% truncated**, and the price
reaches **31%**. (An earlier draft said 91% and "always cut" — measured against
`KindSaleId`, the run-flat flag, instead of `ProductTypeId`. The defect is real
and smaller than first written.)

**`fitTitle` does not normalise whitespace and `fitDescription` does.** The latter
runs `.replace(/\s+/g, ' ')` over each candidate; the former only picks by length.
So `productTitle` must collapse its own spacing — with `model2` or `size`
`undefined`, rung 1 would otherwise render `Used Toyo  225/40/18 — $120 | MrGoma`
with a double space, and the hard-trim fallback could end on one.

`WARRANTY` is claimed **only for used tires** — `WARRANTY_LONG` is explicitly "on
Like-New Used Tires", so applying it to a new tire would make a claim the constant
does not support.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `fitTitle` returns the first candidate `≤ TITLE_MAX` | guard test: every fixture `.length <= TITLE_MAX` |
| AC2 | rungs 1–5 all begin `{Cond} {Brand}` and all carry `{Size}` when it exists | guard asserts each supplied field appears; the partial fixtures assert only what they supply |
| AC10 | `productTitle` collapses its own whitespace | guard: no fixture result matches `/ {2}/`, including the no-model and no-size cases |
| AC3 | candidate order drops the suffix before the price | one fixture per rung; assert suffix absent while `$` present |
| AC4 | `productMetadata` returns `title: { absolute }` | `absoluteTitle(meta)` — already throws on a plain string — plus a count of `MrGoma` occurrences ≤ 1 |
| AC5 | `brandName()` trims, title-cases, applies the exception map | direct unit cases for the three named brands |
| AC6 | the model is passed through untouched | fixture with `ALENZA A/S 02 RSC RFT`, assert exact substring |
| AC7 | price moved into `fitDescription`'s head | assert `length <= DESCRIPTION_MAX` and `indexOf('$') < 160` |
| AC8 | consequence of the ladder | **measured, not asserted** — recomputed over the sample and written into `results.md` |
| AC9 | `productSocialTitle()` feeds `openGraph`/`twitter` | assert both contain the price and `Free Shipping` |

## Tradeoffs / alternatives

- **Extracting `productMetadata()` vs. editing the route in place.** In-place is
  fewer lines, but leaves the route untestable without mocking `mssql` — the exact
  problem the `seo.ts` block was created to solve for every other page. Extracting
  costs one function and makes four ACs real assertions instead of source greps.
- **Dropping the brand suffix first vs. keeping it always.** Keeping it always
  costs 9 characters on every page and yields 826 distinct visible openings
  instead of 905; the suffix differentiates nothing, since all 1,622 pages carry
  the same one. Google also commonly appends the site name itself.
- **"Price always, model if it fits" vs. "model first".** Price-always reaches 100%
  price coverage but drops the model on 18% of pages. Model-first keeps 92% model
  and 90% price. A model name is a search term; a price is not. Chose model-first.
- **Title-casing model names — rejected**, with a worked failure. The rule tried
  first (`uppercase && length ≤ 3 → leave as-is`) produced `Primacy ALL Season`,
  because `ALL` is spelled like an acronym. The catalog has **96 such tokens**
  against a handful of real words, so any length rule mangles one set. Brands are
  a closed set of 75 and get the casing; models keep the manufacturer's spelling.
- **Keeping `Tire in Miami` in the title — dropped.** It costs 14 of 60 characters
  to repeat a city that the description, the H1, the breadcrumb and the JSON-LD all
  state. The size and brand are what people type.

## Risks

- **Google may ignore all of it.** It rewrites titles when it prefers its own, and
  truncates by pixel width rather than characters. This is why AC8 is a
  measurement and not an assertion, and why `results.md` must record both
  uniqueness numbers.
- **The whole-string uniqueness metric goes down** (929 → ~905). If someone later
  re-runs Screaming Frog and reads only that column, this looks like a regression.
  Mitigation: `results.md` states both numbers and which one describes a searcher's
  experience.
- **`productMetadata()` widens `seo.ts`.** The file is already large. Mitigation:
  the product builders go next to the existing `productTitle`/`productDescription`
  pair rather than into a new section, and nothing else moves.
- **A brand outside the sample cases badly.** `brandName()` is a pure transform
  with a fallback of `.title()`, so an unknown brand degrades to reasonable
  casing rather than throwing. The exception map is the only place needing an edit
  if a new brand arrives.
- **Regression on OG.** Feature `019` relies on the OG card for WhatsApp previews.
  FR6 exists for exactly this: the social titles keep the long form, so `019`'s
  preview is unaffected. AC9 guards it.

## Out of scope

- URL consolidation, sets of 4/2, and the tire-card redesign — **block 5**.
- The `Product` JSON-LD `name` field (`"(CODE) | BRAND | SIZE"`), which is an odd
  thing to call a product but is not a title and not what this feature measures.
- Every other route's titles — `021` settled those and `metadata.test.ts` guards
  them.

---

_The concrete steps live in [tasks.md](./tasks.md)._
