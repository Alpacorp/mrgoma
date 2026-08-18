# Tasks — Stop the crawl waste and recover the lost store URLs

> Feature: `020-crawl-hygiene` · Based on: [plan.md](./plan.md) · Created: 2026-08-18

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**592 tests in 73 files, green.**

**Ordering rule — the suite must be green after every task.** One task breaks that
if split: T6 changes what `tiresMetadata` puts in the canonical, and two tests in
`metadata.test.ts` currently assert the old behaviour. The change and the rewrite
of those two tests are **one task**, never two.

The four groups (A–D) are independent of each other and can be done in any order.
Inside a group, order matters.

---

## A. The site root's two spellings

- [x] **T1** — Make `absUrl()` treat `'/'` as the site root:
      `if (!pathOrUrl || pathOrUrl === '/') return site;`. The eight templates that
      pass `{ name: 'Home', url: '/' }` to `buildBreadcrumbJsonLd` are **not
      touched** — they keep passing `'/'` and start emitting the string the
      canonical already publishes.
      · **Do not touch `organizationId()` or the `#website` `@id`.** They build
      their slash literally rather than through `absUrl`, and an `@id` is a stable
      key Google uses to merge an entity across crawls — changing it re-mints the
      entity for no gain.
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`,
      `src/app/utils/metadata.test.ts`
      · check: `npm test` — `absUrl('/') === absUrl('')`;
      `buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }])` emits an `item` with
      no trailing slash; `homeMetadata().alternates.canonical` equals `absUrl('/')`;
      both `@id` values still end `…com/#organization` and `…com/#website`.
      · note: the existing `'canonicalises to the site root'` test uses a regex
      that accepts both forms, so it stays green — tighten it to the exact string
      rather than leaving it permissive.

- [x] **T2** — Sweep for any other caller that wants the slashed root.
      · files: repo-wide read-only check for `absUrl('/')`, `absUrl("/")` and
      `url: '/'`
      · check: the only callers are `pageMetadata` (where Next strips the slash
      anyway, so its output is unchanged) and `buildBreadcrumbJsonLd`. Record the
      result — if a third caller exists, it decides whether T1 is safe as written.

## B. Keep the prefetch URLs out of the crawl

- [x] **T3** — Add `'/*?_rsc='` **and** `'/*&_rsc='` to the `disallow` array.
      **Both patterns, not just the first**: `?_rsc=` only matches when the
      parameter leads the query string, and Next appends it to the href it is
      prefetching, so every prefetch of an already-filtered link arrives as
      `&_rsc=` (verified: `/tires?w=235&s=50&d=20&_rsc=abc12` → `200`).
      · **Do not add `/_next/image`** — spec Decision 4 defers it to the
      broken-image work.
      · files: `src/app/robots.ts`
      · check: `npm run build` then read the generated `robots.txt`; the five
      existing rules, `Host` and `Sitemap` are all still there.

- [x] **T4** — Guard the robots rules.
      · files: `src/app/robots.guard.test.ts` (new)
      · check: `npm test` — both `_rsc` patterns present; `/api/`, `/checkout`,
      `/dashboard`, `/sellers/`, `/feed/` still present; `host` and `sitemap`
      still set; **no entry mentions `_next/image`**; no `disallow` entry is a
      prefix of a path the sitemap publishes.

## C. Stop inventing size pages, and point the facets at real ones

- [x] **T5** — Create the shared size lookup, **split so the rule is testable
      without a database**:
      - `matchSizeSlug(sizes, slug)` — **pure**, the whole matching rule, size
        list as an argument;
      - `getStockedSizes` — `cache()`-wrapped `fetchSizes` (React's own
        request-scoped dedupe, no dependency; it also removes today's double call
        on the size route). The module's only I/O;
      - `resolveSizeSlug(slug)` and `sizePageSlug(w, s, d)` — thin compositions of
        the two.

      All of it resolves through the **same** `slugify()` the sitemap and
      `generateStaticParams` already use — that shared derivation is what makes
      AC10 true by construction rather than by a list we maintain.
      · files: `src/app/(shop)/tires/utils/sizeCatalog.ts` (new),
      `src/app/(shop)/tires/utils/sizeCatalog.test.ts` (new)
      · check: `npm test` — AC8, AC9 and AC10 test `matchSizeSlug` directly, with
      **no `vi.mock` and no `mssql`**: `foo-bar-baz`, `999-999-999` and
      `235-50-r20` resolve to `null`, and **every** slug derived from a stub list
      resolves back to its original `RealSize` (driven from the list, not from
      literals). A separate thin test mocks `@/repositories/tiresRepository` — the
      pattern `src/app/api/brands/route.test.ts` uses — to prove `resolveSizeSlug`
      and `sizePageSlug` are wired to it.

- [x] **T6** — Delete the fallback in `getSizeData` that splits an unknown slug
      into three parts and fabricates a size from it. Return `null` instead; the
      page already calls `notFound()` on `null`. Read through T5's cached helper.
      · **Leave `dynamicParams` at its default.** Setting it to `false` is the
      cheapest possible 404 and the most fragile: `generateStaticParams` already
      swallows a failure and returns `[]`, so one bad database moment at build
      time would 404 **every** size page, and it freezes a list that changes with
      stock.
      · files: `src/app/(shop)/tires/size/[size]/page.tsx`
      · check: `npm run dev` — `/tires/size/foo-bar-baz` and
      `/tires/size/235-50-r20` return `404`; a size the catalog actually stocks
      still renders exactly as before.

- [x] **T7** — Apply the canonical rule in `tiresMetadata()`: keep `w`/`s`/`d`
      **only** when all three are present and a `sizeSlug` was supplied; keep
      `page` whenever it is > 1; when the size survives and `page` is 1, collapse
      onto `/tires/size/{slug}`. Add the optional `sizeSlug?: string | null`
      argument — the lookup stays **out** of `seo.ts`, which is documented as pure
      so `metadata.test.ts` runs with no database and no mocks.
      · **Rewrite, in this same task**, the two existing tests that assert
      today's behaviour: `'drops an incomplete size from the canonical URL'`
      currently expects the canonical to *contain* `/tires?w=225` (only the title
      dropped the partial size) and must now expect `/tires` exactly; `'keeps the
      size filter and page in the canonical URL'` stays correct under Decision 3
      and is re-checked against the new rule rather than assumed.
      · files: `src/app/utils/seo.ts`, `src/app/utils/metadata.test.ts`
      · check: `npm test` — the eight rows of the plan's canonical table, driven
      as a table, including all six non-empty proper subsets of `w`/`s`/`d`.

- [x] **T8** — Wire the lookup into the route: `generateMetadata` resolves
      `sizeSlug` via `sizePageSlug()` **only when all three of `w`, `s`, `d` are
      present**, so plain `/tires` and every partial facet cost zero extra
      queries.
      · **It must be `.catch(() => null)`.** This is the only way this feature
      could make a live route worse. `/tires` survives a database outage today —
      `fetchTiresServer` catches, `fetchBrands()` already has `.catch(() => [])`,
      and `tiresMetadata` is pure — so an unguarded lookup would be the route's
      only unprotected database call, and a throw inside `generateMetadata` takes
      the whole page down, not just the metadata. Caught, it degrades to the
      `/tires` canonical, which is the same value an unstocked size already gets.
      · files: `src/app/(shop)/tires/page.tsx`
      · check: `npm run dev` — `/tires?w=235&s=50&d=20` renders
      `canonical=…/tires/size/235-50-20` and that URL answers `200`;
      `/tires?w=999&s=999&d=999` renders `canonical=…/tires`; plain `/tires` is
      unchanged. Then, with the database made unreachable, `/tires?w=235&s=50&d=20`
      still renders `200` with the `/tires` canonical — **not** a 500.

## D. Give the renamed store URLs their addresses back

- [x] **T9** — Prepend four redirects to the array returned by `redirects()`,
      **before** the existing host rule and with **no `has: host` condition**, so
      each matches on both hosts and resolves in one hop. Destinations are
      absolute `https://${CANONICAL_HOST}/locations/…`.
      | From | To |
      | --- | --- |
      | `/locations/miami-hialeah` | `/locations/hialeah` |
      | `/locations/miami-coral-gables` | `/locations/coral-gables` |
      | `/locations/orlando-semoran` | `/locations/east-orlando` |
      | `/locations/miami-south-us1` | `/locations/cutler-bay` |
      · **Do not add `/locations/miami-north-441`.** No current address is on
      that road; the audit is explicit that a wrong redirect is worse than the
      404 it replaces.
      · `permanent: true` (→ `308`), matching the host rule already in this file —
      see plan Amendment 2.
      · files: `next.config.mjs`
      · check: `npm run dev` — each legacy URL 308s to its destination.

- [x] **T10** — Guard the redirect table.
      · files: `src/app/(shop)/locations/legacySlugs.guard.test.ts` (new)
      · check: `npm test` — imports `next.config.mjs` and awaits `redirects()`;
      every legacy rule's index is **lower** than the host rule's; none carries a
      `has` condition; every destination's final segment satisfies
      `getLocationBySlug()`; **no rule has `miami-north-441` as a source**, with
      the reason in the test name.

## E. Close it out

- [x] **T11** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget`, all green.
      · check: the budget must read **166.0 KB / 617.2 KB** — byte-identical to
      `019`. This feature adds no client code, so any movement means something
      reached the bundle that should not have.

- [x] **T12** — Manual, **before merge**: record whether the four legacy URLs
      still receive impressions today (Search Console → Performance → filter by
      page, exact URL). This does **not** gate the redirect — a 301/308 is correct
      either way — but after the redirect ships the "before" number is gone.

- [ ] **T13** — Manual, **after deploy**: verify against production.
      · a live sample of real sizes from `/tires/size/` still answers `200` —
      this is the one way T6 could remove a real page, if a stored size format
      does not survive `slugify`;
      · `curl -I` a legacy URL on **both** hosts and confirm one hop each;
      · the canonical and the breadcrumb `item` are byte-identical on the home
      **and on one page from each of the eight breadcrumb templates** — a tire
      detail, a brand, a size, `/tires/new`, `/tires/used`, a guide, a location
      and a service (AC15b's breadth; the unit test only proves the helper);
      · Search Console → URL Inspection on one `?_rsc=` URL, one fabricated size
      URL and one redirected legacy URL.

---

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC15a, AC15b, AC15c |
| T2 | AC15a (safety check) |
| T3 | AC1, AC2 |
| T4 | AC1, AC2 |
| T5 | AC8, AC9, AC10 |
| T6 | AC8, AC9, AC10 |
| T7 | AC3, AC4, AC5, AC6, AC7 |
| T8 | AC5 (end-to-end), AC5b |
| T9 | AC11, AC12, AC14 |
| T10 | AC11, AC12, AC13, AC14 |
| T11 | AC15 |
| T12 | AC17 |
| T13 | AC9, AC12, AC15b, AC16 |

Every criterion in `spec.md` appears at least once. AC5, AC9, AC12 and AC15b are
covered twice on purpose: once by a unit test against a stub, once against
production, because the stub cannot prove the database agrees with it.

---

_Implementation follows in `/implement`._
