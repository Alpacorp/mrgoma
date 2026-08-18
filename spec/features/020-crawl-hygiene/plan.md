# Plan — Stop the crawl waste and recover the lost store URLs

> Feature: `020-crawl-hygiene` · Based on: [spec.md](./spec.md) · Created: 2026-08-18

## Technical approach

Four independent corrections, no shared machinery between them. None adds a
component, a route or a dependency; three are edits to files that already exist
and one extracts a helper the codebase was missing.

0. **The site root's two spellings (FR8)** — one line in `absUrl()`. The eight
   templates that emit a "Home" breadcrumb are not touched; they already pass
   `'/'`, and the helper starts answering it the way the canonical already does.

1. **`?_rsc=` (FR1)** — one more `disallow` entry in the existing `robots.ts`.
   Next serialises `MetadataRoute.Robots` verbatim, so this is a string in an
   array. **Two patterns, not the one the audit proposed** — see Amendment 1.

2. **Facet canonicals (FR2)** — `tiresMetadata()` in `seo.ts` already builds the
   canonical; the change is which parameters it is allowed to keep. The builders
   in `seo.ts` are documented as **pure — plain values in, `Metadata` out, no
   I/O** — precisely so `metadata.test.ts` runs with no database and no mocks.
   That constraint holds: the "is this size real?" lookup happens in the page's
   `generateMetadata` and arrives as an argument.

3. **Fabricated size pages (FR3, FR4)** — delete the fallback in `getSizeData`
   and call `notFound()`. The lookup it falls back from already consults the one
   source of truth (`fetchSizes()`), which is the same source `generateStaticParams`
   and the sitemap read, so FR4 and AC10 hold **by construction** rather than by
   a list we maintain.

4. **Legacy store redirects (FR5, FR6)** — four entries in the `redirects()` that
   already exists in `next.config.mjs`, placed **before** the host rule so the
   one-hop requirement is a consequence of ordering rather than of extra
   configuration.

Five existing files change. Four are new: one small server-side helper shared by
corrections 2 and 3 — because after this change two routes need the same question
answered, *is this a size we stock, and what is its slug?* — and three test files.

## Reuse first

| Existing thing | Used for | Instead of |
| --- | --- | --- |
| `robots.ts` (`MetadataRoute.Robots`) | FR1 | A hand-written `public/robots.txt` |
| `redirects()` in `next.config.mjs` | FR5, FR6 | Middleware, or a route-level redirect |
| `tiresMetadata()` in `seo.ts` | FR2 | A second canonical mechanism beside the builder |
| `absUrl()` in `seo.ts` | FR8 | Editing the eight templates that call it through `buildBreadcrumbJsonLd` |
| `pageMetadata()` (already called by `tiresMetadata`) | FR2 | Hand-assembling `alternates.canonical` |
| `fetchSizes()` in `tiresRepository` | FR3, FR4 | A hard-coded size list |
| `slugify()` in `tireSlug.ts` | FR2, FR3 | A second slug format |
| `getLocationBySlug()` in `locationsConfig.ts` | AC13 | Repeating the store slugs in a test |
| `metadata.test.ts` | AC3–AC7 | A new metadata test file |
| The `*.guard.test.ts` pattern (`retiredEvents`, `imageSizes`, `whatsapp`) | AC1, AC2, AC13 | Ad-hoc assertions |

The size route's `generateStaticParams` and `src/app/sitemap.ts` **both** already
call `fetchSizes()` and slug it with `slugify()`. That is the contract FR4 leans
on; nothing new is invented to satisfy it.

## Files to add / change

**Change**

- `src/app/robots.ts` — add `'/*?_rsc='` and `'/*&_rsc='` to `disallow`. Nothing
  else moves; `/api/`, `/checkout`, `/dashboard`, `/sellers/`, `/feed/`, `host`
  and `sitemap` stay exactly as they are.
- `next.config.mjs` — four legacy store redirects, **prepended** to the array
  returned by `redirects()`, with absolute `https://${CANONICAL_HOST}/…`
  destinations and no `has: host` condition, so they match on both hosts and
  resolve in one hop.
- `src/app/utils/seo.ts` — two changes, both in pure functions:
  - `tiresMetadata()` gains an optional `sizeSlug?: string | null` argument ("the
    landing page for this facet, if we publish one") and applies the canonical
    rule below.
  - `absUrl()` treats `'/'` as the site root and returns it without a trailing
    slash — `if (!pathOrUrl || pathOrUrl === '/') return site;`. One line, and it
    is the whole of FR8: the eight templates that pass `{ name: 'Home', url: '/' }`
    to `buildBreadcrumbJsonLd` keep passing it and start emitting the same string
    the canonical does. `organizationId()` and the `#website` `@id` build their
    slash literally, not through `absUrl`, so they are untouched — which is what
    FR8 requires.
- `src/app/(shop)/tires/page.tsx` — `generateMetadata` resolves `sizeSlug`
  **only when all three of `w`, `s`, `d` are present**, so plain `/tires` and
  every partial facet cost zero extra queries — and **behind a `.catch(() => null)`**.
  This is the one place this feature could make a live route worse. `/tires`
  survives a database outage today: `fetchTiresServer` catches and returns an
  empty page, `fetchBrands()` already has `.catch(() => [])`, and `tiresMetadata`
  is pure and cannot fail. An unguarded lookup here would be the only unprotected
  database call on the route, and in `generateMetadata` — where a throw takes the
  whole page down, not just the metadata. Caught, a failure yields `sizeSlug =
  null`, which emits the `/tires` canonical: the same output an unstocked size
  already produces, so the degradation is to a correct value rather than to an
  error page.
- `src/app/(shop)/tires/size/[size]/page.tsx` — `getSizeData` loses its
  slug-splitting fallback and returns `null` for a size we do not stock; the page
  already calls `notFound()` on `null`. Reads through the new cached helper so
  `generateMetadata` and the page body share one query per request.

**Add**

- `src/app/(shop)/tires/utils/sizeCatalog.ts` — the shared lookup, **split so the
  logic is testable without a database**. Lives beside the existing
  `fetchTiresServer.ts` in the same `tires/utils/` folder.
  - `matchSizeSlug(sizes: string[], slug: string): string | null` — **pure**. The
    whole of the matching rule, taking the size list as an argument. AC9 and AC10
    are properties of this function (*every slug derived from the list resolves
    back to its `RealSize`*) and need no `mssql`, no `vi.mock` and no request
    context — the same reason `metadata.test.ts` tests the `seo.ts` builders
    rather than the page modules.
  - `getStockedSizes` — `cache()`-wrapped `fetchSizes` (React's own
    request-scoped dedupe, no dependency). The only I/O in the module.
  - `resolveSizeSlug(slug)` and `sizePageSlug(w, s, d)` — three lines each,
    composing the two above. Covered by a thin wiring test with `fetchSizes`
    mocked, the pattern `src/app/api/brands/route.test.ts` already uses.
- `src/app/robots.guard.test.ts` — AC1, AC2.
- `src/app/(shop)/locations/legacySlugs.guard.test.ts` — AC13, and asserts the
  four rules sit ahead of the host rule (AC12's precondition).
- `src/app/(shop)/tires/utils/sizeCatalog.test.ts` — AC8, AC9, AC10 against a
  stubbed size list.

**Extend**

- `src/app/utils/metadata.test.ts` — AC3, AC4, AC5, AC6, AC7. **Two existing
  tests here assert today's behaviour and must be rewritten, not appended to:**
  - `'drops an incomplete size from the canonical URL'` currently expects the
    canonical to **contain `/tires?w=225`**. Its name already describes what FR2
    does; only the title dropped the partial size, the canonical kept it. The
    assertion becomes `/tires` exactly.
  - `'keeps the size filter and page in the canonical URL'` expects
    `/tires?w=225&s=40&d=18&page=3`. That stays correct under FR2 (complete size
    + page > 1 keeps its own canonical, Decision 3) — it is listed here so the
    rule is checked against it rather than assumed.
- `src/app/utils/seo.test.ts` — AC15a: `buildBreadcrumbJsonLd` with a `'/'` item
  emits the root with no trailing slash. The existing breadcrumb test asserts
  positions and names only, so it is extended rather than rewritten.

## Data & flow

### The canonical rule (FR2)

The canonical keeps **only the parameters that describe a page we publish**:

- `w`/`s`/`d` are kept **only** when all three are present **and** the size is
  one we stock. Any partial size is dropped — that is the whole of AC3 and AC4.
- `page` is kept whenever it is greater than 1 (Decision 3).
- When the size survives **and** `page` is 1, the facet collapses onto its
  landing page.

Which resolves to:

| Request | Canonical | Why |
| --- | --- | --- |
| `/tires?d=20` | `/tires` | Partial size — not a page we publish |
| `/tires?w=235&s=50` | `/tires` | Same |
| `/tires?w=&s=&d=` | `/tires` | The empty-string form the audit lists by name in T005. `tiresMetadata` already trims each param, so all three are falsy and the rule treats it as no size at all |
| `/tires?d=20&page=2` | `/tires?page=2` | Partial size dropped, pagination kept |
| `/tires?condition=new` | `/tires` | Unknown param — unchanged from today |
| `/tires?w=235&s=50&d=20` | `/tires/size/235-50-20` | The page we publish for it |
| `/tires?w=999&s=999&d=999` | `/tires` | Complete but not stocked — after FR3 the size page would 404, and a canonical must never point at one |
| `/tires?w=235&s=50&d=20&page=2` | unchanged (self-referential) | Page 2 of a facet is not the size page; folding it there hides what only page 2 lists (Decision 3) |
| `/tires?page=2` | `/tires?page=2` | Unchanged (AC7) |

### The size lookup (FR3, FR4)

`fetchSizes()` → `RealSize` values → `slugify()`. `generateStaticParams`, the
sitemap and the route all read that one list, so a slug resolves if and only if
the sitemap publishes it.

`dynamicParams` is deliberately **left at its default (`true`)**. Setting it to
`false` would make unknown slugs 404 with no code running at all — cheaper, and
tempting — but `generateStaticParams` already swallows a failure and returns `[]`,
so one bad database moment at build time would 404 **every** size page. It also
freezes the param list at build time, and this catalog gains sizes as stock
changes. The cost of keeping it dynamic is one `SELECT DISTINCT RealSize` for an
unknown slug — the same query a legitimate request already pays, so the NFR
("a 404 must stay cheap") is met by not regressing, and `cache()` halves today's
double call.

### The redirects (FR5, FR6)

Next matches `redirects()` in array order, first match wins. The existing rule is
`/:path*` conditioned on `has: host === ALTERNATE_HOST`. Prepending the four
legacy rules — unconditioned on host, with absolute destinations — means:

- `https://www.…/locations/miami-hialeah` → matches rule 1 → **one hop** to the
  destination.
- `https://mrgomatires.com/locations/miami-hialeah` → also matches rule 1 first
  (no host condition) → **one hop** straight to `https://www.…/locations/hialeah`,
  never touching the host rule.

Placed after the host rule instead, the bare host would cost two hops. The order
is the requirement, which is why a test asserts it.

No database, no API, no client state. Nothing in this feature runs in the browser.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | Two `_rsc` patterns appended to `disallow` in `robots.ts`; every existing entry untouched | `robots.guard.test.ts` calls the default export and asserts both patterns plus each of the five existing rules, `host` and `sitemap` |
| AC2 | `/_next/image` deliberately not added (Decision 4) | Same guard: asserts no `disallow` entry mentions `_next/image`, and that no entry is a prefix of a path the sitemap publishes |
| AC3 | Partial size dropped from the canonical | `metadata.test.ts`: `tiresMetadata({ d: '20' })` → canonical `…/tires` |
| AC4 | Same rule, all combinations | Table-driven over the six non-empty proper subsets of `w`/`s`/`d` |
| AC5 | Complete + stocked → `/tires/size/{slug}` | `metadata.test.ts`: `tiresMetadata({ w:'235', s:'50', d:'20', sizeSlug:'235-50-20' })` → canonical `…/tires/size/235-50-20`. That the URL answers `200` is AC9/AC10's job, from the same source |
| AC6 | Unknown params were never in the canonical | `metadata.test.ts`: unchanged assertion, kept as a regression guard |
| AC7 | `page` preserved when > 1 | `metadata.test.ts`: `tiresMetadata({ page: 2 })` → canonical `…/tires?page=2` |
| AC8 | Fallback deleted; `getSizeData` returns `null` → `notFound()` | `sizeCatalog.test.ts`: `resolveSizeSlug` returns `null` for `foo-bar-baz`, `999-999-999`, `235-50-r20` against a stubbed stocked list |
| AC9 | Exact match against `fetchSizes()` is unchanged | `sizeCatalog.test.ts`: every slug derived from the stub resolves back to its original `RealSize` — driven from the list, not from a literal |
| AC10 | Route and sitemap read the same list through the same `slugify` | `sizeCatalog.test.ts`: for a stub list, `slugify(size)` resolves for **every** entry — the property the sitemap depends on |
| AC11 | Four `redirects()` entries with absolute destinations | `legacySlugs.guard.test.ts`: imports `next.config.mjs`, awaits `redirects()`, asserts source, destination and permanence for each — see Amendment 2 |
| AC12 | Legacy rules prepended, no `has: host` | Same guard: asserts each legacy rule's index is lower than the host rule's, and that none carries a `has` condition. Confirmed against production in AC16 |
| AC13 | Destinations validated against the live store list | Same guard: every destination's final segment satisfies `getLocationBySlug()` |
| AC14 | `miami-north-441` deliberately absent | Same guard: asserts no rule has it as a source, with the reason in the test name |
| AC15a | `absUrl('/')` returns the site root unslashed, so all eight breadcrumb templates agree with the canonical | `seo.test.ts`: `buildBreadcrumbJsonLd([{ name:'Home', url:'/' }])` → `item` has no trailing slash; plus `absUrl('/') === absUrl('')` |
| AC15b | Both forms now derive from the same unslashed value | `metadata.test.ts`: the canonical of `homeMetadata()` and `absUrl('/')` are the same string. Confirmed end-to-end in AC16 by reading the rendered HTML |
| AC15c | `organizationId()` and the `#website` `@id` build their slash literally, never through `absUrl` | `seo.test.ts`: asserts both `@id` values still end `…com/#organization` and `…com/#website`, with the reason in the test name |
| AC15 | No client code added | `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, `npm run perf:budget` — the budget must read **166.0 KB / 617.2 KB**, byte-identical to `019` |
| AC16 | — | Manual, post-deploy: Search Console URL Inspection on one `?_rsc=`, one fabricated size URL and one redirected legacy URL; plus `curl -I` for hop count on both hosts |
| AC17 | — | Manual, pre-merge: Search Console → Performance → filter by page, for the four legacy URLs |

## Amendments to the spec

**Amendment 1 — `Disallow: /*?_rsc=` alone does not cover the case.** The audit's
T001 proposes exactly that pattern. It only matches when `_rsc` is the **first**
query parameter. Next appends the parameter to the href it is prefetching, so a
link that already carries a query is prefetched as `&_rsc=` — verified:
`/tires?w=235&s=50&d=20&_rsc=abc12` answers `200`. Under the audit's rule **every
prefetch of a filtered catalog link stays crawlable**, which is the highest-value
half of the problem. FR1 is met with both `'/*?_rsc='` and `'/*&_rsc='`. AC1 is
updated to require both.

**Amendment 2 — AC11 says `301`; this ships a `308`.** Next's `permanent: true`
emits **308**, and the host redirect already in this file returns 308 in
production today (verified). Google treats 301 and 308 identically for
consolidation, so the choice is between matching the audit's wording and matching
the file's existing idiom. **Matching the file wins** — one redirect mechanism
with two status codes is a trap for the next reader, and Next's `statusCode: 301`
escape hatch cannot be combined with `permanent` in the same entry. AC11 is
amended to *"a permanent redirect (`308`, consistent with the host rule already
in this file)"*.

## Tradeoffs / alternatives

**Middleware instead of `next.config.mjs` for the redirects.** Rejected.
Middleware runs on every request in the edge runtime to serve four static
redirects that `redirects()` handles at the routing layer for free. It would also
split redirect logic across two files.

**`dynamicParams = false` for the size route.** Rejected — see *Data & flow*. It
is the cheapest 404 available and the most fragile: it converts a build-time
database hiccup into a sitewide 404 of every size page, and freezes a list that
changes with stock.

**Making `tiresMetadata` do its own lookup.** Rejected. It would put I/O into a
module documented as pure and force `metadata.test.ts` — the regression guard for
every commercial entry point — to mock `mssql`. The lookup arrives as an argument
instead.

**Canonicalising a complete facet unconditionally to `/tires/size/{slug}`,
without checking stock.** Rejected. After FR3 an unstocked size 404s, so an
unchecked rule would emit canonicals pointing at 404s. The check costs one query,
and only on requests that carry all three size parameters.

**Fixing the `-r20` variant by canonicalising it to the `-20` page.** Rejected as
a misreading: `-r20` is not a second slug format we publish, it is one instance of
the fabrication bug. Deleting the fallback removes it along with the unbounded
rest, and a canonical rule would have left the other infinity of slugs alive.

**Redirecting fabricated size slugs to `/tires` instead of 404ing.** Rejected.
A 301 asserts "this thing moved"; nothing moved, and it would keep an unbounded
URL space alive as an unbounded redirect space.

**Adding the trailing slash instead of removing it, as audit T030 proposes.**
Rejected. The site already publishes the unslashed form in its canonical,
`og:url`, sitemap, `Organization.url` and `WebSite.url`, and `trailingSlash` is
`false`, so every non-root path is 308-redirected to the unslashed form.
Following T030 would mean changing five emitters to match one, and would put the
canonical at odds with the redirect the server performs. One emitter changes
instead.

**Fixing the eight templates instead of the helper.** Rejected. Eight edits that
must all agree, versus one line in the helper they all already call — and the
next template to add a breadcrumb would have to remember the convention.

**Also normalising the `@id` values.** Rejected, and made explicit in AC15c. An
`@id` is a stable key Google uses to merge an entity across pages and crawls;
changing it re-mints the entity. It is not a claim about a URL and nothing reads
it as one.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| The `robots.txt` pattern is broader than intended and blocks a real page | Low | AC2's guard asserts no `disallow` entry shadows a sitemap path; both patterns require the literal `_rsc=` |
| A stocked size stops resolving because its stored format does not survive `slugify` | Low — but it is the one way FR3 could remove a real page | AC9 and AC10 drive from the size list itself, not from examples; the sitemap and the route share one derivation, so a break shows in both. Verify a live sample of sizes after deploy |
| `cache()` is a pattern new to this repo | Low | It is React's own request-scoped memo, no dependency, and used in exactly one module. If it misbehaves the fallback is to call `fetchSizes()` twice, which is today's behaviour |
| A legacy redirect points at a store that is later renamed | Low | AC13 fails the build the moment a destination stops matching `locationsConfig` |
| The four legacy URLs have already dropped out of the index, so the redirect recovers little | Medium | AC17 measures it **before** merge; the redirect is still correct for the humans landing on those 404s |
| ~~`next.config.mjs` cannot be imported by Vitest~~ | **Resolved** | Probed during `/analyze`: Vitest imports it and `await redirects()` returns the rule array. No fallback needed |
| A newly stocked size 404s for up to an hour | Low | `notFound()` on a route with `revalidate = 3600` can be cached for the revalidate window. Today the fallback would have rendered such a page (with a fabricated size but real results), so this is a real if small behaviour change. Accepted: an hour's delay on a brand-new size is cheaper than an unbounded indexable URL space, and it is the same staleness window the route already has for its content |
| Removing the fallback breaks a URL a customer holds | Very low | Only fabricated sizes are affected; nothing links to them, and they were never in the sitemap |
| `absUrl('/')` is called somewhere that **wants** the trailing slash | Low | Only two callers exist: `pageMetadata` (where Next strips it anyway, so the output is unchanged) and `buildBreadcrumbJsonLd` (the one being fixed). A repo-wide check for `absUrl('/')` and for `url: '/'` is part of the task, and AC15c pins the `@id` values that must not move |

## Out of scope

- `X-Robots-Tag: noindex` on `?_rsc=` (audit T002) — dropped with reasoning, see
  spec Decision 1.
- `Disallow: /_next/image` (audit T001, second line) — deferred to the
  broken-image work (T003, T004, T106), see spec Decision 4.
- `/locations/miami-north-441` (audit T105) — blocked on the owner confirming the
  store.
- The double `fetchSizes()` call that `cache()` removes on the size route is a
  side-benefit, not a performance feature; no other route is audited for the same
  pattern here.
- Every other block of the audit: metadata and Open Graph, store titles,
  descriptions and H1s, the H1 spacing defect, structured data, and the
  `/tires/{id}-…` URL consolidation.

---

_The concrete steps live in [tasks.md](./tasks.md)._
