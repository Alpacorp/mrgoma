# Results — 021-page-metadata-og

> Recorded: 2026-08-18 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **927 passed** (baseline 650, **+277**) in 77 files (was 75) |
| `npm run build` | ✅ 450 static pages |
| `npm run perf:budget` | ✅ shared 166.0 KB / 180 · total **617.4** KB / 680 |

**The budget moved by 0.2 KB, and the plan said it would not.** No client
component imports `seo.ts`, and `Footer`/`FooterSection` are server components, so
this is not browser code the feature added — the likeliest cause is chunk-splitting
variation between builds. It is 0.03% of a limit with 9% headroom, and chasing it
further was not worth the time; recorded rather than rounded away.

The test count jumped by 277 because the structural rules are table-driven and the
table grew from the commercial entry points to **every page this feature owns** —
one assertion per page per rule.

## Verified against the production build

Run against `npm start` on the real database.

| Page | Len | `og:image` | `og:url` |
| --- | --- | --- | --- |
| `/` — `Used & New Tires Miami & Orlando — 30-Day Warranty \| MrGoma` | 59 | ✅ | own |
| `/tires` — `Shop Tires by Size & Brand — Used & New \| MrGoma` | 48 | ✅ | own |
| `/services` — `Auto Services in Miami & Orlando \| MrGoma` | 41 | ✅ | own |
| `/services/wheel-alignment` — `Wheel Alignment — Hunter HawkEye Elite®, Miami \| MrGoma` | 55 | ✅ | own |
| `/about-us` — `About MrGoma Tires — 7 Locations in Miami & Orlando` | 51 | ✅ | own |
| `/guides` — `Tire Guides: Buying, Safety & Maintenance \| MrGoma` | 50 | ✅ | own |
| `/guides/used-vs-new-tires` — `Used vs. New Tires: Cost, Safety & Lifespan \| MrGoma` | 52 | ✅ | own |
| `/contact` — `Contact Us — 7 Locations in Miami & Orlando \| MrGoma` | 52 | ✅ | own |
| `/legal-policies` — `Website Legal Policies \| MrGoma` | 31 | ✅ | own |
| `/instant-quote` — `Instant Tire Quote — Free, No Obligation \| MrGoma` | 49 | ✅ | own |
| `/locations/hialeah` — `Hialeah Tire Shop — 30-Day Warranty \| MrGoma` | 44 | ✅ | own |

Every one under 60, brand once, and an `og:image` where there were none.

**Stores share their own storefront** (AC15) — `hialeah` → `4040.webp`,
`cutler-bay` → `18200.jpg`, `east-orlando` → `575.jpg`. The test asserts each file
exists on disk, so a bad path fails the build instead of shipping a card that
silently fails to load.

**The guides are still articles** (the regression the plan caught in advance):
`og:type="article"`, `article:published_time="2026-05-15"`, plus the `og:locale`
they never had.

**`/instant-quote`** now serves `index, follow` and a canonical of its own, and
the footer links to it.

**All three guards were verified red**, not just green — each defect reintroduced
in turn:

```
× finds no plain `title:` containing MrGoma
  + "/src/app/(shop)/guides/page.tsx: title: 'Tire Guides & Tips | MrGoma Tires',"
× /instant-quote is not published as noindex
× /legal-policies declares itself canonical
```

## What the widened test set found in the new copy

Extending the assertions from the commercial entry points to every page caught
four defects **in work done during this feature**, before any of it shipped:

- **`/about-us` named the brand twice.** `About MrGoma Tires` already carries it,
  and appending `TITLE_SUFFIX` printed it again — the exact defect this feature
  exists to remove, reintroduced out of habit while removing it. It now takes no
  suffix, and the audit's T054 proposal turns out to have been right not to have
  one.
- **`/about-us` and `/contact` descriptions fell short of 140** characters, below
  the window Google shows in full.
- **`/services/flat-tire-repair`'s description was 165** — over the maximum. Not
  in the audit, whose description tickets stop at `/services`.
- **`/guides/how-to-buy-used-tires` was 163**, and two more guides fell short.

None of these would have been visible by reading the diff.

## Three things the plan did not anticipate

**The service titles needed three rewrites, not one.** The plan flagged
`/services/wheel-alignment` as the single title that overflows. Stripping the
brand and re-measuring showed `oil-change` (63) and `brake-service` (63) over the
limit too. All three were reworded rather than truncated.

**`fitTitle` was the wrong tool for the service pages.** With a single candidate
it hard-truncates — and truncating that particular title is precisely how
`Hunter HawkEye Elite®` gets lost. `serviceMetadata` appends the suffix without
it, so an over-long `metaTitle` fails `metadata.test.ts` loudly instead of
shipping a quietly cut title.

**`statesPrimaryDifferentiator` does not apply to every page.** Widening the table
made it fail on all eight service pages, `/legal-policies` and the guides — and
correctly so: a 30-day tire warranty is not a reason to pick an oil change, and
forcing tire copy into a policies page would be worse than leaving it out. The
table is now split into commercial entry points, service pages, guides and utility
pages; the structural rules apply to all four, the differentiator rule only to the
first.

## One change beyond the plan's file list

`FooterSection` gained a focus ring. The footer links relied on the browser
default, and `CookieSettingsLink` — two components away, in the same footer —
already had the house pattern (`focus-visible:ring-2 focus-visible:ring-[#9dfb40]`).
Reusing it makes AC12 verifiable rather than dependent on the user agent, and it
improves every footer link, not only the new one.

## Deliberately not changed

**`/tires/used`.** Audit T037's entire proposal was to spell the brand out in
full. `TITLE_SUFFIX` is deliberately the short form — `seo.ts` documents that it
exists so the differentiator gets the character budget — so the page already
satisfies the intent and needs no edit.

**The tire detail page.** Its title runs to 100 characters in production and is
the worst on the site, but 1.622 pages deserve their own baseline and folding
them in would make this feature's fifteen unattributable. Tracked on the roadmap.

## The pre-change baseline (T12 / AC18)

Captured from Search Console on **2026-08-18**, 3-month window, Web search, from
the Performance report's *Pages* export — before any title shipped. Source kept
locally as `gsc-baseline-2026-08-18.zip` (git-ignored).

| Page | Clicks | Impressions | CTR | Avg. pos |
| --- | ---: | ---: | ---: | ---: |
| `/` | 1.346 | 55.970 | 2,40% | 8,57 |
| `/tires` | 84 | 16.609 | **0,51%** | **5,09** |
| `/guides/used-vs-new-tires` | 14 | 5.364 | **0,26%** | 8,65 |
| `/guides/how-to-buy-used-tires` | 4 | 1.300 | 0,31% | 9,10 |
| `/legal-policies` | 0 | 486 | 0% | 11,02 |
| `/about-us` | 3 | 482 | 0,62% | 4,01 |
| `/services/tire-mounting-balancing` | 0 | 179 | 0% | 7,50 |
| `/services` | 0 | 154 | 0% | 5,59 |
| `/services/oil-change` | 1 | 121 | 0,83% | 15,16 |
| `/services/brake-service` | 1 | 112 | 0,89% | 41,37 |
| `/services/nitrogen-inflation` | 1 | 95 | 1,05% | 12,84 |
| `/guides/how-to-read-tire-size` | 0 | 83 | 0% | 46,06 |
| `/guides/used-tire-safety-checklist` | 0 | 63 | 0% | 8,83 |
| `/guides` | 0 | 37 | 0% | 21,73 |
| `/services/wheel-alignment` | 0 | 27 | 0% | 14,00 |
| `/contact`, `/instant-quote`, `/services/{flat-tire-repair,tire-rotation,tpms-service}` | — | **no data** | — | — |
| **Total** | **1.454** | **81.082** | **1,79%** | |

**1,79% aggregate CTR is the number to beat**, and the shape of the data says
more than the total does.

**`/tires` ranks fine and converts nothing.** Position **5.09** with a **0,51%**
CTR — roughly a tenth of what position five normally earns. Ranking is not the
problem on that page; the snippet is. It is also the page whose title differed
from the home's by the single word "in", which is what this feature changed. If
the diagnosis is right, this is where it should show first.

`/guides/used-vs-new-tires` is the same story at smaller scale: 5.364 impressions,
14 clicks, position 8,65.

**And it is not confined to these pages.** Audit item T034 recorded
`/locations/miami-airport` at 2.778 impressions and **1 click** in position 3,2 —
a working page. The four legacy store URLs `020` measured showed ~100 impressions
and **zero** clicks at position 3,4. Good positions with almost no clicks looks
like a site-wide pattern rather than fifteen separate copy problems, and this
feature is the first real test of whether metadata is the cause. If CTR does not
move on `/tires`, the answer is somewhere else — most likely the local pack
absorbing the clicks — and that finding is worth as much as the fix.

**Compare at 28 days after deploy**, not sooner: Google has to recrawl and GSC
lags 2–3 days. Compare **impressions and CTR**, not clicks — clicks move with
seasonality, CTR is what responds to a title.

## Still to verify (manual)

- [ ] **T13 / AC19 — after deploy.** Share a store, a brand page and a size page
      into a real WhatsApp chat and confirm a preview card renders, with the store
      showing **its own photo**. Use URLs not shared before — WhatsApp caches
      previews by URL.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
