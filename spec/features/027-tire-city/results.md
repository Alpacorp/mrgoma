# Results — 027-tire-city

> Recorded: 2026-08-24 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.216 passed** (baseline 1.172, +44) in 93 files |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 166.0 KB / 180 · 619.7 KB / 680 — **unchanged** |

## Verified against the reported tire

`/tires/299189-bridgestone-245-50-19` — warehouse `Clifton`:

```
visible   Available at MrGoma Tires in Orlando, FL.
meta      Used Bridgestone DUELER H/P SPORT AS XL 245/50/19 tire in Orlando for $155…
og:title  Used Bridgestone … 245/50/19 Tire in Orlando | $155 | Free Shipping
JSON-LD   Available at MrGoma Tires in Orlando
```

And a `Hialeah` tire still reads `Available at MrGoma Tires in Miami, FL.` — the
fix had to be checked in both directions, not just the reported one.

## The Google Merchant feed

```
HTTP 200 · 4.157 items
  say Orlando       793
  say Miami       3.364
  warehouse leaks     0
```

793 + 3.364 is every item. That took a second fix — see below.

## The second defect, found while testing the first

Asked to check a tire whose `Description` column is populated, the column turned
out not to hold descriptions at all. It holds **internal purchase notes**:

```
$71 advance  ·  45.95  ·  62 Advance  ·  64.95 ADVANCE  ·  175 TR
```

All **985** non-empty values are 40 characters or fewer. And `merchantFeed.ts`
**preferred** that column over the generated sentence, so:

- **985 Google Shopping items** carried `45.95` or `$71 advance` as the product
  description — useless to a shopper, and plausibly a Merchant Center quality
  problem;
- it **published what reads as the shop's cost** beside its retail price, so a
  competitor could infer the margin;
- and on the detail page the note sat in the serialized React payload, visible in
  view-source on 985 listings.

Nothing in the UI ever read it — `ProductDescription` renders the *generated*
text — which is why it went unnoticed. Confirmed with the owner: the field is not
used, the description is produced another way.

**Fixed by removing it from every public path**: the feed query no longer selects
`Description`, the feed always generates, and the mapper no longer copies it into
the object sent to the browser.

| | before | after |
| --- | ---: | ---: |
| feed items containing `advance` | 348 | **0** |
| feed descriptions that were only a number | ~600 | **0** |
| `79 TGI` in the tire page HTML | 1 | **0** |
| **feed items saying Orlando** | 401 | **793** |
| feed items with a real description | 3.172 | **4.157** |

The last two rows are the part worth noticing: **the city fix only reached 76% of
the feed until the notes stopped covering it.** 793 now matches the Orlando
sellable count exactly.

## The aggregate pages named one city too

A tire page was the report, but brand and size landing pages had the same fault
from the other direction: they aggregate stock from every warehouse and their
title said `Tires in Miami`. **19 sizes and 8 brands have stock only in Orlando**
— `225/60/16` has 30 units, every one of them there — so those pages competed for
a city with none of that stock in it.

Now `Tires Miami & Orlando`, which is true of the business at all times in a way
no per-page rule could be.

**The preposition paid for the second city.** Measured against the longest real
brand and size names:

| wording | longest | over the 60-char budget |
| --- | ---: | ---: |
| `Tires in Miami — 30-Day Warranty` *(before)* | 54 | 0 of 15 |
| `Tires in Miami & Orlando — 30-Day Warranty` | 64 | **13 of 15** |
| `Tires Miami & Orlando — 30-Day Warranty` *(chosen)* | 61 | **1 of 15** |
| `Tires in FL — 30-Day Warranty` | 51 | 0 of 15 |

Dropping `in` was not style. Keeping it would have overflowed on 13 of 15 names
and sacrificed the warranty `014` put there as the differentiator. The one name
that still overflows falls to the rung below — losing the warranty, never the
cities, which is asserted directly.

`in FL` fits everywhere and is never wrong, and was rejected anyway: it drops
"Miami" from titles for the **147 sizes and 55 brands whose stock is Miami-only**.
Trading a real error on 27 pages for weaker targeting on 202 is a bad trade.

## The visible headings were missed on the first pass

Reported after the metadata fix shipped: filtering to `225/60/16` still showed

> **225/60/16 Tires in Miami**

in poster-sized type. The `<title>` and the `<h1>` are written in different places
— `seo.ts` and the page components — and the review that produced the fix read
only the first. The metadata was right and the page still said the wrong city.

Four visible surfaces carried it:

| Where | Was |
| --- | --- |
| `/tires/size/[size]` `<h1>` | `{size} Tires in Miami` |
| `/tires` `<h1>`, filtered | `Tires in Miami` |
| `/tires` `<h1>`, unfiltered | `New & Used Tires in Miami` |
| `/tires` screen-reader `<h2>` | `Used & New Tires in Miami` |

`/tires` was contradicting itself on screen: the eyebrow directly above the
heading already read **"Miami & Orlando, FL"**.

Also corrected: the PWA manifest description, which said Miami alone.

**`catalogHeadings.guard.test.ts` now holds it down** — per line, in the three
catalog page files, Miami may not appear without Orlando. Comment lines are
exempt so a note explaining the old wording does not fail. Verified red by
restoring the size page's heading, and it named the exact line.

The rule is deliberately narrow rather than repo-wide: `Built in Miami.` on the
About page is a true sentence about where the company started.

## Two smaller things fixed while there

**Dead metadata on `/checkout`.** `layout.tsx` exported a title that named the
brand twice once the root template appended it, and a description naming only
Miami. Both were unreachable — `page.tsx` exports `checkoutMetadata()` and a
page's metadata wins over its layout's. `021` moved the real copy and left this
behind.

**`Free shipping nationwide nationwide on every order.`** Found by reading the
rendered `/checkout` description rather than the source: `SHIPPING` already ends
in "nationwide" and the template appended it again. One word, live on the page.

## Why the defect survived

Nothing varied. One literal, in one file, in a function that was never passed the
warehouse — so no input existed that could contradict it, and no test could have
caught it by accident.

That shaped the tests. **AC2 is written over variation, not wording**: each
builder is asked for the same tire in both cities and the two answers must
differ. A builder that hardcodes a city passes every other test in this
repository and fails that one. Verified by reverting `tireDescription.ts` to the
old literal:

```
× the visible description names Orlando for an Orlando tire
× gets the reported tire right, end to end from the warehouse name
```

Restored, green.

## The design decision worth recording

`VaultName` is the **internal** warehouse name — `Clifton`, `441`, `27th Ave` —
and the codebase already keeps it away from customers in two places:
`pickTireListFields` for the public list API, and the `GmcItem` whitelist for the
feed.

So the mapper exposes a **city**, not a store. `SingleTire.city` is
`'Miami' | 'Orlando'`; the warehouse name never crosses the boundary. A test
asserts the mapped object contains no `Clifton` anywhere, and another asserts the
same of a serialized feed item.

The feed's query does now select `VaultName` — it has to, to derive the city —
and the whitelist is what keeps it from leaving.

## Two things left as they are

**The Miami fallback is the same shape as the bug.** An unrecognised warehouse
reads as Miami. A warehouse opening in Kissimmee would be wrong in exactly the
way this feature just fixed, and no test can catch it because the suite cannot
reach the database. Mitigation is legibility rather than automation: all ten
warehouses are named explicitly in `storeCity.ts`, both lists, so the whole set
is visible in one screen.

**`Pembroke WH` says Miami**, and Pembroke Pines is Broward County. Confirmed with
the owner as intentional — the metro area is what a buyer recognises — rather than
overlooked.

## Still to verify (manual)

- [ ] **The reported page after deploy.** `/tires/299189-bridgestone-245-50-19`
      should say Orlando.
- [ ] **The WhatsApp preview** for an Orlando tire — that card comes from
      `og:title` and now names the city.
- [ ] **The live feed**, once deployed: `/feed/google-merchant.xml?key=…` should
      show Orlando items and **no purchase notes**. Google refetches roughly
      daily, so Shopping data corrects itself within a day or two rather than
      immediately.

---

_Spec: [spec.md](./spec.md)_
