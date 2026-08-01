# Search Console baseline — `014-serp-differentiators`

> Status: **NOT YET RECORDED — blocks merge (T28 / AC18)**
> Fill this in *before* merging. Once the new titles and descriptions are live,
> the "before" numbers are gone.

## Why this blocks the merge

CTR is the only real proof this feature worked. Everything else it changes —
titles, descriptions, on-page claims, structured data — is verifiable as
*correct*, but not as *effective*. Without a before/after there is no way to tell
whether the snippet rewrite earned clicks or just looked better to us.

## How to capture it

Search Console → **Performance → Search results**:

1. Date range: **Last 28 days**, ending the day before merge.
2. Filter: **Search type = Web**, **Country = United States** (the target market;
   the Colombia-served result that started this work is not representative).
3. Tab: **Pages**. Record impressions, clicks, average CTR and average position
   for each URL below.
4. Also record the **site total** row, so a sitewide traffic swing can be told
   apart from a per-page effect.

Re-run the identical query **4–6 weeks after deploy** and fill the second table.
Google needs to recrawl and re-render before anything moves; expect roughly two
weeks of noise first.

## Before (28 days ending ______)

| Page | Impressions | Clicks | CTR | Avg. position |
| --- | --- | --- | --- | --- |
| `/` | | | | |
| `/tires` | | | | |
| `/tires/used` | | | | |
| `/tires/new` | | | | |
| `/tires/brands/*` (aggregate) | | | | |
| `/tires/size/*` (aggregate) | | | | |
| `/locations` | | | | |
| `/locations/*` (aggregate) | | | | |
| **Site total** | | | | |

Query-level check, since "tires miami" is the query that prompted this work:

| Query | Impressions | Clicks | CTR | Avg. position |
| --- | --- | --- | --- | --- |
| `tires miami` | | | | |
| `used tires miami` | | | | |
| `tire shop near me` | | | | |

## After (28 days ending ______, ≥4 weeks post-deploy)

| Page | Impressions | Clicks | CTR | Avg. position | Δ CTR |
| --- | --- | --- | --- | --- | --- |
| `/` | | | | | |
| `/tires` | | | | | |
| `/tires/used` | | | | | |
| `/tires/new` | | | | | |
| `/tires/brands/*` (aggregate) | | | | | |
| `/tires/size/*` (aggregate) | | | | | |
| `/locations` | | | | | |
| `/locations/*` (aggregate) | | | | | |
| **Site total** | | | | | |

## Reading the result honestly

- **CTR up, position flat** — the snippet rewrite worked. That is what this
  feature was built to do.
- **CTR up, position also up** — partly the snippet, partly something else.
  Better engagement can lift position over time, but so can a dozen unrelated
  factors. Don't claim the whole gain.
- **CTR flat** — the claims aren't landing. The next lever is the off-site work
  this feature explicitly excluded: Google Business Profile, and a review
  programme for the seller-rating stars the competitor has.
- **CTR down** — revert the copy. The approved wording is one edit in
  `src/app/utils/brandClaims.ts` and `homeMetadata()` in `src/app/utils/seo.ts`.

Remember Google rewrites 60–70% of descriptions to fit the query. If the live
snippet doesn't match what we wrote, that's expected — it's why the claims also
went on the page, where Google builds the description from.
