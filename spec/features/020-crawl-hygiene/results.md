# Results — 020-crawl-hygiene

> Recorded: 2026-08-18 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **649 passed** (baseline 592, +57) in 75 files (was 73) |
| `npm run build` | ✅ 272 size pages prerendered, 113 brand pages |
| `npm run perf:budget` | ✅ shared 166.0 KB / 180 · total 617.2 KB / 680 |

**The JS budget did not move** — byte-for-byte the numbers from `019`. This
feature is configuration, a route guard and a metadata builder; nothing reached
the browser.

## Verified against the production build

Run against `npm start` on the real database, not a stub.

**The canonical table, all ten rows** (AC3–AC7):

| Request | Canonical served |
| --- | --- |
| `/tires` | `…/tires` |
| `/tires?d=20` | `…/tires` |
| `/tires?w=235&s=50` | `…/tires` |
| `/tires?w=&s=&d=` | `…/tires` |
| `/tires?condition=new` | `…/tires` |
| `/tires?w=235&s=50&d=20` | `…/tires/size/235-50-20` |
| `/tires?w=999&s=999&d=999` | `…/tires` |
| `/tires?page=2` | `…/tires?page=2` |
| `/tires?d=20&page=2` | `…/tires?page=2` |
| `/tires?w=235&s=50&d=20&page=2` | `…/tires?w=235&s=50&d=20&page=2` |

**The fabricated size space is closed** (AC8/AC9): `foo-bar-baz`, `999-999-999`,
`235-50-r20` and `a-b-c` all answer `404`; `235-50-20`, `155-80-13` and
`225-40-18` still answer `200`. The build prerendered **272** size pages, the
same number the sitemap publishes — AC10 confirmed against the database, not only
against a stub.

**The redirects** (AC11, AC14): all four answer `308` with the exact absolute
destination; `/locations/miami-north-441` still answers `404`.

**One spelling of the root** (AC15b): checked on all eight breadcrumb templates —
size, brand, `/tires/new`, `/tires/used`, a guide, a location, a service and a
tire detail. Every one now emits `"item":"https://www.mrgomatires.com"`. The home
has no breadcrumb, correctly.

**The generated `robots.txt`** (AC1, AC2):

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /checkout
Disallow: /dashboard
Disallow: /sellers/
Disallow: /feed/
Disallow: /*?_rsc=
Disallow: /*&_rsc=
```

**AC5b, the failure path**, tested by starting the app against an unroutable
database host: `/tires?w=235&s=50&d=20` still answered **`200`** with the
`/tires` canonical. The `.catch` holds and `/tires` keeps degrading gracefully
rather than 500ing.

## Two things the plan did not anticipate

**Splitting the pure function was not enough — the module was the problem.**
The plan put `matchSizeSlug` in `sizeCatalog.ts` so AC9 and AC10 could be tested
without a database. Its first run failed at import: `sizeCatalog.ts` pulls in
`tiresRepository` → `@/connection/db` → `constants.ts`, which **throws at module
load** when `SERVER_URL` is unset. A pure function inside an impure module is
still untestable.

So the rule moved to `src/app/utils/tireSlug.ts`, which has no imports at all and
already owns `slugify` — and it is the natural home, because matching a slug back
to its source is the inverse of the function beside it. It is now `matchSlug`,
generic over any slugged list.

**Which turned up a second copy of the rule.** `getBrandName` on
`/tires/brands/[brand]` was already doing exactly this —
`brands.find(b => slugify(b) === brandSlug) ?? null` — and doing it **correctly**;
the brand route never had the fabrication bug that the size route had. Rather
than leave a third copy, `getBrandName` now calls `matchSlug` too. That is one
file beyond the plan's list, changed for the reason `tech-stack.md` gives about
consent: two copies of a rule eventually disagree.

**A real size the old fallback would have rejected.** `31/10.50/15` slugifies to
`31-10-50-15` — four segments. The deleted fallback demanded exactly three, so it
would have refused a size we actually stock while happily inventing
`foo/bar/baz`. Exact matching gets both right; there is a test for it.

## Two audit tickets deliberately not implemented

Recorded here so neither reads later as an oversight.

**T002 — `X-Robots-Tag: noindex` on `?_rsc=` responses.** Dropped. Those URLs
already serve a canonical pointing at the real page, which is the strongest
duplicate signal Google accepts, so indexation was never the open problem. And a
URL disallowed in `robots.txt` is never fetched, so the header would never be
read. Spec Decision 1.

**`Disallow: /_next/image`.** Deferred to the broken-image work (T003, T004,
T106). Every product photo is served through the optimizer, so blocking it
removes the catalog from Google Images — a real cost, to treat an inventory
problem with a crawl rule. Spec Decision 4.

Two further deviations from the audit's wording are in [plan.md](./plan.md) →
_Amendments_: the prefetch rule needs **two** patterns, not one, and the
redirects emit `308` rather than `301` to match the rule already in the file.

## The pre-redirect baseline (T12 / AC17) — and what it changes

Captured from Search Console on **2026-08-18**, 3-month window (17 May – 18 Aug),
exact-URL filter, before anything shipped. Once the redirect is live this cannot
be reconstructed.

| Legacy URL | Clicks | Impressions | Avg. position |
| --- | --- | --- | --- |
| `/locations/miami-hialeah` | 0 | **0** | — |
| `/locations/miami-coral-gables` | 0 | **98** | 3.5 |
| `/locations/orlando-semoran` | 0 | **0** | — |
| `/locations/miami-south-us1` | 0 | **101** | 3.4 |
| `/locations/miami-north-441` (not redirected) | 0 | **101** | 3.4 |

**The totals are the less interesting half. The shape of the line is the finding:**
in all three URLs with data, every impression falls in a single spike around
**23 June**, and the series is flat at zero from then until today — roughly eight
weeks without one.

**So these URLs have already left the index, and the redirect will not recover
ranking.** This is the case the audit itself anticipated for T101–T104: *"if the
impressions stopped in June/July the URL has already left the index and the 301
recovers little."* Shipping it is still correct — it stops sending anyone holding
the link to an error page, and consolidates any residual signal on the next crawl
— but it should not be expected to move anything in Search Console, and it is not
the priority the audit's "Medio" rating implied. Two of the four
(`miami-hialeah`, `orlando-semoran`) have literally nothing to recover.

Two notes on the numbers:

- **`miami-south-us1` and `miami-north-441` report identical figures** (101 / 3.4)
  with the same spike. Re-checked and unchanged, but the filter chip truncates the
  URL, so identical-to-the-digit values for two different pages could not be
  ruled out visually. It does not change any decision: with everything at zero
  since June, `441` is not urgent whether it held 101 impressions or none.
- **0 clicks on ~100 impressions at position 3.4** is a 0% CTR. Partly explained
  by these being 404s, but the pattern closely resembles audit item **T034**
  (`/locations/miami-airport`: 2.778 impressions, 1 click, position 3.2, on a page
  that works). Worth carrying into the store-pages block — it may be the local
  pack absorbing the clicks rather than anything wrong with our markup.

## Post-deploy verification (T13) — and one correction to AC12

Run against production on **2026-08-18**, after the merge deployed.

- **The prefetch rules are live**: `robots.txt` serves both `/*?_rsc=` and
  `/*&_rsc=` alongside the five pre-existing rules.
- **The fabricated size space is closed in production**: `foo-bar-baz` and
  `235-50-r20` answer `404`.
- **No real size was lost**: eight sizes sampled across the sitemap's range
  (`155-80-13` … `305-40-20`) all answer `200`. This was the one way FR3 could
  have removed a real page.
- **One spelling of the root**: `/tires/size/…`, `/locations/hialeah` and a guide
  all emit `"item":"https://www.mrgomatires.com"` beside a matching canonical.
- **`miami-north-441` still answers `404`**, as intended.

### AC12 is only half met, and the missing half is not ours

AC12 asked for **one hop from either host**. Production:

| From | Hops |
| --- | --- |
| `https://www.…/locations/miami-hialeah` | **1** ✅ |
| `https://mrgomatires.com/locations/miami-hialeah` | **2** ❌ |

The extra hop is **Vercel's own apex→www domain redirect**, configured in the
dashboard and served at the edge before any application code runs. It is not our
`redirects()` host rule being out of order: `https://mrgomatires.com/locations/hialeah`
— a page that exists and was never renamed — is 308'd to `www` just the same, and
the response carries `server: Vercel` with no matched route.

So the ordering work this feature did is correct and does deliver the one hop
from `www`, which is the host that matters: it is what the canonical, the sitemap
and every internal link declare, and therefore what Google has indexed. The apex
is an edge case reached only by someone typing the bare domain.

Removing the second hop means retiring the platform redirect and letting
`next.config.mjs` handle apex→www instead — a Vercel dashboard change with wider
blast radius than this feature's scope, and **the same root cause as audit item
T008**, which was already out of scope here. AC12 is restated as: _one hop from
`www`; two from the apex, the first of which belongs to the platform._

## Still to verify (manual)
- [ ] **AC16, the Search Console half.** URL Inspection on one `?_rsc=` URL, one
      fabricated size URL and one redirected legacy URL, to confirm Google sees
      what we intended. Needs an account with access; everything else in T13 is
      done and recorded above.

## Known limitation

`notFound()` on a route with `revalidate = 3600` can be cached for the revalidate
window, so a size that enters stock may answer `404` for up to an hour before its
page appears. Accepted during `/analyze`: an hour's delay on one new size is
cheaper than an unbounded indexable URL space, and it is the same staleness window
the route already has for its content.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
