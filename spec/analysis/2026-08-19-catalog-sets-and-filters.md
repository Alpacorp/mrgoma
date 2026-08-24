# Analysis — the catalog, its sets, and the filter menu

> Read-only study · 2026-08-19 · Feeds block 5 and the `/tires` filter redesign
> **No data was changed.** Every query below is a `SELECT`. No `UPDATE`, `DELETE`,
> `ALTER` or `DROP` was issued at any point, and nothing was written to the
> database.

## What this is for

Two questions, and they turn out to be the same question:

1. **Block 5 — sets.** Can we group identical tires into sets of 4 or 2, and give
   the buyer a way to build one?
2. **The filter menu.** Can `/tires` get the treatment the FME project got —
   counts on every option, a two-level brand → model selector, a SORT/VIEW bar?

Both come down to: *what does the inventory actually contain, and what can be
derived from it honestly?*

## Scale

| | units |
| --- | ---: |
| rows in `View_Tires` | 29.843 |
| not trashed | 17.285 |
| **sellable on the storefront today** | **4.226** |

"Sellable" is the site's own rule (`STOREFRONT_SELLABLE_WHERE`): not local, not
trashed, not sold, ≥50% life, price ≠ 0. **Everything below is measured on those
4.226 units**, because that is the catalog a customer can actually filter.

Those 4.226 units are **1.613 distinct products** (brand + model + size).

---

# Part 1 — Sets

## How the inventory is shaped

| group size | groups | units |
| --- | ---: | ---: |
| 1 — a lone tire | 1.149 | 1.149 |
| 2 | 228 | 456 |
| 3 | 93 | 279 |
| 4–5 | 92 | 403 |
| 6–9 | 73 | 524 |
| **10+** | **78** | **1.415** |

Two things stand out. **1.149 products are a single tire** — a third of the
catalog can never be a set. And at the other end, **78 products hold ten or more
units**, which is a third of the catalog sitting in a few very deep piles.

## Identical is rarer than "same product"

Same brand, model and size does not mean interchangeable. Comparing price, tread,
remaining life and patched status within each group:

| | groups | units |
| --- | ---: | ---: |
| single-unit products | 1.149 | 1.149 |
| multi-unit, **all units identical** | 177 | 1.236 |
| multi-unit, **units differ** | **387** | **1.841** |

So of the products where a set is even conceivable, **69% contain units that
differ** — different price, different remaining life, different tread. This is
the finding that killed the audit's original "just consolidate the duplicate
URLs" proposal, and it holds on the full sellable catalog, not just the sample.

## The set flags exist — and they are not the truth

`View_Tires` has `Single`, `SetOf2` and `SetOf4` as `bit` columns. They look like
the answer. They are not, and this is the decisive finding of this study.

Checking each flag against what the inventory actually holds:

| flag | inventory | units |
| --- | --- | ---: |
| marked `SetOf4` | **fewer than 4 exist** | **123** |
| marked `SetOf4` | 4 or more exist | 638 |
| *not* marked `SetOf4` | **4 or more exist** | **1.704** |
| marked `SetOf2` | **only 1 exists** | **147** |
| *not* marked `SetOf2` | 2 or more exist | 1.577 |

**270 units are marked as a set that cannot be assembled**, and **thousands that
could be are not marked**. The flags also overlap freely — 149 units carry all
three at once — which suggests they were meant as *sale options* ("can be sold
singly, or as a pair") rather than as a statement about stock.

Read that way they are intent, not inventory, and intent maintained by hand on
some records and not others.

**`Amount` is not a quantity either.** 2.797 of the 4.226 sellable units have
`Amount = 0`, 1.318 have `1`, and 111 have `2`. Nothing in the schema counts
stock.

**Consequence:** a set must be **derived** from the inventory — counting the
matching units — and the flags can at most be a hint or an override. Building on
them directly would ship 123 sets of four that do not exist.

## The shelf is a real signal

Grouping by store + shelf code + product, the physical layout tells us something
the flags do not:

| units of one product on one shelf | occurrences |
| ---: | ---: |
| 1 | 2.478 |
| **2** | **403** |
| 3 | 96 |
| **4** | **66** |
| 5–15 | 53 |

**403 shelves hold exactly two of the same tire; 66 hold exactly four.** That is
staff behaviour showing through the data: sets get stored together. It is a
much better signal than the flags — though still a signal, not a guarantee, and
it only exists for the 3.2k units that have a shelf code at all.

## What this means for block 5

A set should be derived from **product identity + comparable condition +
availability**, with the shelf as corroboration and the flags as an optional
override. That is buildable and honest. What is *not* buildable is reading
`SetOf4` and believing it.

The open question is not technical. It is: **when the owner marks `SetOf4`, what
do they mean?** Everything above is consistent with "this tire may be sold as
part of a four", and inconsistent with "this tire is part of one specific set of
four". That has to be answered by the person maintaining it before anything is built on
top.

---

# Part 2 — The filter menu

## Every dimension, and how big it is

Measured on the 4.226 sellable units:

| dimension | distinct values | what the UI can be |
| --- | ---: | --- |
| `Model2` | **1.037** | never a list — search, or second level under a brand |
| `RealSize` | 273 | the existing width → sidewall → diameter cascade |
| `Brand` | 115 | top brands + search; not a flat list |
| `loadIndex` | 60 | search or range |
| width | 22 | list |
| sidewall | 17 | list |
| diameter | 14 | list |
| `speedIndex` | 10 | list |
| store | 10 | list (dashboard only) |
| run-flat | 2 | toggle |
| condition | 2 | toggle |
| **`TireType`** | **0** | **empty column — not a filter at all** |

## The long tails are extreme

**Brands:** 6 brands cover 2.918 of 4.226 units (69%). At the other end, 32
brands have exactly one unit each.

```
PIRELLI 993 · BRIDGESTONE 449 · CONTINENTAL 416 · YOKOHAMA 406
GOODYEAR 351 · MICHELIN 303 · HANKOOK 153 · GROUNDSPEED 123 …
```

**Sizes:** 18 sizes cover 1.625 units (38%); 59 sizes have exactly one.

A flat alphabetical list treats `PIRELLI` (993 units) and a brand with one unit
as equals. That is the problem counts solve.

## The strongest argument for FME-style counts

Of every possible **brand × diameter** combination, only **340 of 1.610 have any
stock**.

> **79% of filter combinations lead to an empty page**, and nothing in the
> current interface warns you before you click.

This is what "counts on every option" actually buys here: not decoration, but the
difference between a catalog that answers and one that dead-ends four times out
of five.

## Can we compute the counts?

Yes — all facets in **one** query. It took **1.8 s** as written, unindexed, which
is too slow to run per keystroke and fine as a cached, per-filter-change call.

So it is feasible but not free. It needs either indexes on the filter columns or
a short-lived cache, and that should be decided before the UI is designed around
it rather than after.

## Two things that shape the visual design

**Half the catalog has no photo.** 2.119 of 4.226 sellable units have no image.
Any grid or card view has to be designed for a placeholder as the *common* case,
not the exception. (The FME reference uses Rows / Grid / Table — a **Table** view
is the one that does not care about photos, and here that matters.)

**The real ranges are narrow.** Price runs 70–2.002 (mean 186), tread 5.3–10,
remaining life 53–99. Note the life floor: the storefront rule already excludes
anything under 50%, so a "remaining life" slider that starts at 0 is offering a
range that does not exist.

| | under $100 | $100–199 | $200+ |
| --- | ---: | ---: | ---: |
| units | 421 | 2.388 | 1.417 |

---

# Part 3 — What the database needs

Asked before taking the questions to the owner: *is the database even able to do
this?* Partly. Nothing is blocked by permissions; the obstacles are structural.

## Permissions: no blocker

The application's login holds `db_ddladmin`, `db_datareader`, `db_datawriter`
and `db_backupoperator`. It can create indexes, views, tables and procedures.
Whatever we decide to build, we are allowed to build it.

## `View_Tires` is a fifteen-table join

This is the root of the performance problem. It is not a table — it joins
`Tires` to `ProductInfo`, `Vaults`, `Brands`, `Size`, `Height`, `Width`,
`Treads`, `Status`, `Condition`, `ProductTypes`, `Amount`, `Models`, `TireType`,
`KindSale`, `LoadIndex`, `SpeedIndex`, `LocalCodes` and `OfferUp`.

Three consequences, in order of severity:

**1. `RealSize` is computed inside the view.**

```sql
CONVERT(varchar(50), Height.HeightValue) + '/' +
CONVERT(varchar(50), Width.WidthValue)  + '/' +
CONVERT(varchar(50), Size.Wheel)        AS RealSize
```

The site filters sidewall with `RealSize LIKE '%/55/%'`. That is a wildcard
search against a string concatenated from three joined tables, evaluated row by
row. **No index can ever help it**, no matter what we add.

**2. `Price` and `RemainingLife` live in `ProductInfo`** — 199.386 rows, the
largest table in the database — reached through an outer join. Every price filter
pays for that.

**3. `Amount` is a join to a lookup table** (`Tires.Amount = Amount.AmountId`,
returning `AmountValue`). That settles the earlier finding: it was never a stock
count, it is a foreign key.

## Almost nothing is indexed

`dbo.Tires` has exactly two indexes: the clustered primary key on `TireId`, and
one non-clustered index on `KindSaleId` whose name is the literal placeholder
`<Name of Missing Index, sysname,>` — someone pasted a tuning suggestion without
renaming it.

**No index exists on any column the storefront filters by.**

## What that costs today — measured properly, and a correction

**An earlier draft of this document said every visit to `/tires` pays about a
second and a half. That was wrong**, and the error is worth stating because it
changes the recommendation completely.

Those first numbers were wall-clock from a laptop, first run, cold. They folded
in the round trip to a shared host in Phoenix. Measured against `SELECT 1`, that
round trip alone is **225 ms**, and no index will ever touch it.

Server-side execution time, from `SET STATISTICS TIME`:

| query | CPU | server elapsed | wall clock from here |
| --- | ---: | ---: | ---: |
| count the sellable catalog | 94 ms | **100 ms** | 331 ms |
| filter by brand | 47 ms | **54 ms** | 289 ms |
| filter by sidewall (`RealSize LIKE`) | 62 ms | **65 ms** | 294 ms |
| all facet counts in one query | 297 ms | **304 ms** | 561 ms |
| *(pure network, `SELECT 1`)* | — | — | *225 ms* |

**The database is not the bottleneck.** A filter query costs 54 ms on the server
and 225 ms in transit — the network is four times the query.

The one number with real weight is the facet count at **304 ms**, and that is the
query the FME-style filter menu actually needs.

## What is missing for sets, structurally

1. **There is no quantity anywhere.** Not on `Tires`, not in `ProductInfo`.
   Availability can only be derived by counting rows.
2. **There is no set entity.** No table, no id, nothing that says "these four
   tires are one set". The three `bit` flags are per-tire intent, and unreliable
   (Part 1).

So a set is either *derived at query time* (no schema change, needs the
performance work below) or *recorded* (a small new table, and someone has to
maintain it). That is a product decision, not a technical one.

## What would make this work — revised after measuring

The order below changed once the timings were taken honestly. Two of the items
were premised on a slowness that is not there.

**1. Indexes — not yet.** `Tires` has no index on any filter column, and adding
them is permitted and cheap. But a 54 ms query hidden behind 225 ms of latency
has nothing visible to gain. Worth doing when the catalog grows or when a
specific query is measured slow, not on principle.

**2. Filtering by ids instead of the computed string — not urgent, still right.**
`RealSize LIKE '%/55/%'` cannot use an index and never will; `Tires` already
carries `HeightId`, `WidthId`, `SizeId` as integer keys. Today it buys about
10 ms. It remains the correct shape and the prerequisite for any indexing later,
so it belongs in the filter rework rather than in a performance push of its own.

**3. Facet counts are the real question.** 304 ms server-side, per filter change,
on top of 225 ms of latency. That is the one place where work is justified — and
the answer is more likely caching or a materialised projection than an index,
because the cost is the fifteen-table join being evaluated four times over.

**4. Round trips, not query time.** At 225 ms each, the number of sequential
database calls a page makes matters more than what any one of them costs. That is
where a page-level win would come from.

**5. Fix the types at the source, eventually.** `RemainingLife` is `varchar`
holding `'99%'`; `Tread` is text; `Local` is `varchar` holding `'0'`/`'1'`. Every
numeric comparison is a cast. Deepest fix, most invasive, roadmap material.

**Not a driver:** ten units out of 4.228 carry light-truck sizes with decimals
(`35/12.50/22`). Worth handling, not worth designing around.

# Defects found (recorded, not fixed)

This was an analysis; nothing was changed. Two things are worth a ticket.

**1. `RemainingLife >= '50%'` is a string comparison** — `STOREFRONT_SELLABLE_WHERE`
compares text, not numbers. Today it is harmless: the two readings return the
same 4.226 units and **no value diverges**, because no tire is recorded at
`'100%'`. The day one is, `'100%' >= '50%'` is **false** as text and that tire
disappears from the storefront. Latent, not active.

**2. The price slider's initial bounds are `[10, 50]`** while the real catalog
starts at **70**. The bounds are replaced when `/api/ranges` resolves, so this is
a flash of an impossible range rather than a broken filter — but it is the first
thing a visitor sees.

# What needs an answer before building

1. **What does `SetOf4` mean to whoever sets it?** A sale option, or a claim
   about specific tires? The data says option; the person maintaining it should
   confirm. Everything in block 5 rests on this.
2. **Do we want facet counts badly enough to index for them?** 1.8 s says the
   feature is real work, not a query change.
3. **Does a set need to be four *identical* tires, or four *compatible* ones?**
   387 groups have units that differ. If "compatible" is acceptable — same size,
   similar life — the number of offerable sets rises sharply. If it must be
   identical, sets are a small feature: 177 products qualify.

---

_Method: direct read-only queries against `dbo.View_Tires` via a temporary script
using the repo's own credentials, deleted after use. Figures are as of
2026-08-19._
