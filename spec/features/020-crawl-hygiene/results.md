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

## Still to verify (manual)

- [ ] **T12 / AC17 — before merge.** Search Console → Performance → filter by
      page, for the four legacy URLs. Records whether they still receive
      impressions today. It does not gate the redirect, which is correct either
      way, but once the redirect ships the "before" number is gone.
- [ ] **T13 / AC16 — after deploy.** A live sample of real sizes still answers
      `200`; `curl -I` a legacy URL on **both** hosts and confirm one hop each;
      Search Console URL Inspection on one `?_rsc=` URL, one fabricated size URL
      and one redirected legacy URL.

## Known limitation

`notFound()` on a route with `revalidate = 3600` can be cached for the revalidate
window, so a size that enters stock may answer `404` for up to an hour before its
page appears. Accepted during `/analyze`: an hour's delay on one new size is
cheaper than an unbounded indexable URL space, and it is the same staleness window
the route already has for its content.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
