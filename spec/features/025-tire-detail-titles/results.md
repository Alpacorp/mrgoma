# Results — 025-tire-detail-titles

> Recorded: 2026-08-19 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.120 passed** (baseline 1.045, +75) in 84 files (was 83) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ unchanged |

## Measured over the 1.400-unit sample

Produced by running **the shipped builders** over the sample, not by
re-implementing them — the distinction matters, because re-implementing them is
exactly what produced the two wrong figures corrected below.

```
── titles ──────────────────  BEFORE          AFTER
over TITLE_MAX (60)           100%            0%
median length                 96              55
max length                    127             60
price inside the visible 60   43%             90%
model kept                    100%            92%
carries the brand suffix      100%            58%
unique, whole string          929             905
unique, first 60 chars        707             905
double space                  4               0
── descriptions ────────────
over DESCRIPTION_MAX (160)    —               0%
median length                 187             142
inside the 140-160 window     —               58%
price before char 160         31%             100%
```

## AC8, stated as the trade it is

**Whole-string uniqueness falls, 929 → 905.** Shorter titles collapse some
near-duplicates, and on the audit's own headline column this reads as a
regression.

**Uniqueness within the rendered portion rises, 707 → 905** — and the two numbers
are now the same, which is the real result. Before, 222 titles differed only in
characters Google never drew; the uniqueness the audit counted did not exist on
screen. Every title now fits, so what is distinct is distinct where it is seen.

Anyone re-running Screaming Frog should read the second row, not the first.

## Three of my own figures were wrong, and how

| Claimed | Actual | Cause |
| --- | --- | --- |
| descriptions: 91% over 160, price "always cut" | **70% over, price reached 31%** | measured against `KindSaleId` — the **run-flat** flag. The condition is `ProductTypeId`, and the mix-up put new tires in the used branch |
| titles: price survives on **0** | **43%** | asserted, never measured. A short brand and model leave room; it is "Free Shipping" that never survives |
| descriptions: 85% would land in the window | **58%** | predicted from a draft whose tail clauses were longer than the ones implemented |

All three came from modelling the code instead of running it. The final table
above is generated from `productTitle`/`productDescription` themselves.

## Two defects found while implementing, neither in the spec

**`fitDescription` contradicted its own comment.** The fallback says it prefers
"the longest candidate that at least doesn't overflow" and returned
`underMax[underMax.length - 1]` — with `tails` ordered longest-first, that is the
**shortest**. It had never mattered: every fixed-copy page lands in the 140–160
window, so the branch was dead. `025` is the first feature whose descriptions
reach it, and the first symptom was a new tire described as
`New Bridgestone … for $145. Free shipping nationwide.` with the "Brand new,
unused" clause dropped. Now `underMax[0]`.

**Four titles in the sample already carried a double space.** `'BACK COUNTRY '` is
stored with a trailing space, and `fitTitle` — unlike `fitDescription` — does not
normalise what it selects. This was found by `/analyze` cross-checking the plan
against the helper, before any code was written, and became AC10.

## The ladder gained a rung during implementation

The spec described five. A test written from it failed on the 51-character-model
fixture, expecting ` | MrGoma` and getting a title without it — and the test was
right. Dropping a model that long frees far more room than the suffix costs, so
sacrificing both was simply waste. The suffix is now restored at that level:

```
1  {Cond} {Brand} {Model} {Size} — ${Price} | MrGoma
2  {Cond} {Brand} {Model} {Size} — ${Price}
3  {Cond} {Brand} {Model} {Size}
4  {Cond} {Brand} {Size} — ${Price} | MrGoma     ← added
5  {Cond} {Brand} {Size} — ${Price}
6  {Cond} {Brand} {Size}
```

Brand-suffix coverage went from 50% to **58%** as a result.

## A candidate that could never win

A longer description tail ending in `…visit any of our 7 locations in Miami &
Orlando, FL.` was added to lift the 140-window rate, then removed: measured, it
overshoots 160 by two characters in the *best* case and is never selected. A
candidate that cannot win reads like an option to whoever edits this next.

The window rate stays at 58%, and that is accepted rather than engineered around
— the spec declares the 140 floor a preference for this route (§Constraints),
because a description built from a record cannot always reach it without padding
that says nothing. **The ceiling, which is what truncation acts on, holds at 100%.**

## The guard was verified red

Reverted `productTitle` to its pre-`025` shape and ran
`productMetadata.guard.test.ts`:

```
× typical used tire stays inside TITLE_MAX          expected 75  ≤ 60
× longest model in the catalog (51 chars)           expected 112 ≤ 60
× second longest, on a new tire                     expected 110 ≤ 60
× brand stored with a trailing space … no gap
× …16 assertions failing in total
```

Restored, green. A guard that has never failed proves nothing.

## Deliberately not done

- **URL consolidation, sets of 4/2, the card redesign** — block 5. This is path
  "C": it changes what searchers see without touching a single URL.
- **The `Product` JSON-LD.** It uses `generateTireDescription`, a different
  builder, and JSON-LD has no 160-character limit — shortening it would lose
  detail for no gain.
- **Product pages are not added to `metadata.test.ts`.** That table asserts the
  140 floor, which this route deliberately does not meet.

## Still to verify (manual)

- [ ] **A real product page.** View source on `/tires/{id}-{brand}-{size}`:
      `<title>` is ≤ 60 characters and contains `MrGoma` **at most once** (some
      pages will not contain it at all — that is the ladder working, not a bug).
- [ ] **The WhatsApp preview.** Send a tire link through `019`'s enquiry button
      and confirm the card still shows the price and "Free Shipping" — that copy
      moved to `og:title` rather than being deleted.
- [ ] **Search Console, ~28 days.** The CTR comparison for `/tires/*`. As with
      `021` and `022`, a flat result is a finding, not a failure: it would say the
      local pack is taking these clicks and redirect effort to `017`.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
