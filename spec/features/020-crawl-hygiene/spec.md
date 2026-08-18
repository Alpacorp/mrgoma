# Spec — Stop the crawl waste and recover the lost store URLs

> Feature: `020-crawl-hygiene` · Status: Implemented — awaiting manual verification
> Created: 2026-08-18 · Clarified: 2026-08-18 · Amended during `/plan`: 2026-08-18
>
> Two acceptance criteria were amended while planning, both recorded in
> [plan.md](./plan.md) → _Amendments to the spec_: **AC1/FR1** now require the
> prefetch parameter to be blocked in both the positions it occurs (the audit's
> single pattern misses every prefetch of a filtered link), and **AC11** now
> expects a `308` rather than a `301`, matching the redirect already in the same
> file.
> Roadmap: Backlog (SEO — Screaming Frog audit, block 0) · Branch: `feat/020-crawl-hygiene`

## Why — problem & value

A Screaming Frog crawl of the whole site on 2026-08-18 returned **2.106 real HTML
pages and 37.296 URLs that are not pages at all**. Google is spending its time on
this site walking copies.

The copies come from a feature we want. Next.js prefetches a link the moment the
cursor touches it, and it fetches that link by appending `?_rsc=<hash>` to the
URL. Every hover mints a new address. The home page alone has generated **7.657
variants** of itself; `/legal-policies`, a page nobody needs to find, has
generated **5.923**. Each one answers `200 OK` with the full HTML of the real
page and is reachable by anything that follows links.

Crawl budget is finite and it is not spent evenly. Every request Google makes to
`/?_rsc=8f2a1` is a request it does not make to a tire that came into stock this
morning. The catalog is the part of this site that changes daily and is the part
that sells; it is competing for attention with seven thousand copies of the front
door.

The same crawl surfaced two more leaks with the same shape, and verifying them
turned up a third the audit never saw. All of them are signal we pay to produce
and then throw away.

### The filter URLs argue against themselves

`/tires` accepts filter parameters. Ask it for rim size 20 and you get
`/tires?d=20`, which tells Google — in its own canonical tag — that it is an
original page worth indexing on its own. It is not. It carries **the same title
as `/tires` itself**, and there are 47 variants making the same claim.

The site is not even consistent about it. `/tires?condition=new` correctly points
at `/tires`; `/tires?d=20` points at itself. That looks arbitrary from outside,
and inside it is a single mismatch: the canonical is built from whichever of `w`,
`s` and `d` are present, while the title only treats a size as distinct when
**all three** are present. So a partial size gets a generic title and a unique
canonical — the exact combination that produces duplicates.

A *complete* size — `/tires?w=235&s=50&d=20` — is a different case. It does have a
title of its own, and we already publish a proper landing page for it at
`/tires/size/235-50-20`, one of **272 size pages already in the sitemap**. Two
addresses for the same result, and the weaker one is claiming to be the original.

### `/tires/size/` will mint a page for anything you ask it for

Checking that last point turned up something bigger than the audit reported.
`/tires/size/foo-bar-baz` answers **`200`**, with
`<title>foo/bar/baz Tires in Miami — 30-Day Warranty</title>` and a canonical
pointing at itself. So does `/tires/size/999-999-999`. So does
`/tires/size/235-50-r20`, which is why the site appears to publish two URLs for
every size.

The route looks the slug up among the sizes we actually stock, and when it finds
nothing it **fabricates a size** by splitting the slug into three parts instead of
returning a 404. Any three-segment slug is therefore a live, indexable,
self-canonicalising page. This is the `?_rsc=` disease with no ceiling: one broken
link, one typo or one scraper mints a new page that will then claim to be an
original.

It is isolated. `/tires/brands/foobrand` correctly answers `404` — only the size
route fabricates.

### The site states its own address two different ways

Audit item T030 says the home's canonical omits a trailing slash the real URL
carries, and asks us to add one. Checked against production, the canonical is
fine — and looking for why the auditor saw an inconsistency turned up a real one
somewhere else.

`absUrl('/')` returns `https://www.mrgomatires.com/`, with the slash. That value
takes two different exits:

- as `alternates.canonical` and `og:url` it passes through Next's metadata
  resolver, which strips the slash because `trailingSlash` is `false` — published
  as `https://www.mrgomatires.com`;
- as the `item` of the **`BreadcrumbList` "Home" entry** it goes straight into
  JSON-LD, which Next does not touch — published as
  `https://www.mrgomatires.com/`.

So a single page's `<head>` tells Google the site is `…com` in its canonical,
`og:url`, `Organization.url` and `WebSite.url`, and `…com/` in its breadcrumb.
**Eight page templates** emit that breadcrumb. Google resolves the two forms as
the same address, but this is the site disagreeing with itself in its own
structured data, and it is one line to make it agree — in the direction the site
already publishes everywhere else.

### Five store pages have been returning 404 since a rename

Five location URLs were indexed after the May migration, ranked in **positions
3–4**, and then a later deploy renamed them without leaving a redirect. Google
still shows them. Anyone who clicks lands on an error page, and the ranking those
pages earned is being discarded rather than inherited by the pages that replaced
them.

Four of the five map to a current store with confirmed confidence. The fifth,
`/locations/miami-north-441`, does not: no current address is on that road, and
a redirect pointed at the wrong store is worse than the 404 it replaces. It stays
out of this feature.

### Why this slice, and why first

The mission ranks **trust/correctness above performance above scope**, and asks
for *small, verifiable changes*. This is the cheapest block in the audit and the
only one that is almost purely subtractive: it removes waste, removes a
contradiction, and restores four addresses that already worked. Except for the
fabricated size pages — which stop existing, as they should — **nothing a real
visitor sees changes.** That makes it safe to ship ahead of the metadata, content
and URL-architecture work that follows, all of which do change what people see.

It is also the block that stops getting worse. Every day of crawling adds prefetch
variants, every fabricated size URL that gets linked becomes permanent, and every
day a renamed store URL stays a 404 is a day of inherited ranking decaying.

## User stories

- As **Google's crawler**, I want the site to spend my visit on pages that exist,
  so that new tires are discovered the day they are listed rather than weeks
  later.
- As **someone who found a MrGoma store in a search result**, I want the link to
  open that store's page, so that I get an address and opening hours instead of
  an error.
- As **the site owner**, I want each filtered view to point at the page we
  actually publish for it, so that the ranking earned by a size or a store
  accumulates in one place instead of being split across near-copies.
- As **the site owner**, I want the site to refuse to invent pages for sizes we do
  not stock, so that our indexable surface is something we chose rather than
  something anyone can add to.
- As **a visitor**, I want none of this to change how the site behaves, so that
  prefetching, filtering and paging keep working exactly as they do today.

## Scope

**In:**

- Keeping the Next.js prefetch URLs (`?_rsc=`) out of the crawl.
- Making `/tires` filter URLs point their canonical at the page we publish for
  that view.
- Making `/tires/size/{slug}` answer `404` for any size we do not stock, closing
  the unbounded URL space.
- Making every emitted form of the site root URL agree, **without a trailing
  slash** — the form the canonical and `og:url` already publish.
- Permanent redirects for the **four confirmed** legacy store URLs
  (`miami-hialeah`, `miami-coral-gables`, `orlando-semoran`,
  `miami-south-us1`), on both the `www` and the bare host.
- Regression tests that keep each of these from silently coming back.

**Out:**

- **`X-Robots-Tag: noindex` on `?_rsc=` responses (audit T002).** Deliberately
  dropped — see Decision 1.
- **`Disallow: /_next/image` (the second line of audit T001).** Deferred to the
  broken-image work — see Decision 4.
- **Pagination canonicals.** `/tires?page=N` keeps declaring itself canonical —
  see Decision 3.
- `/locations/miami-north-441` (audit T105) — the destination is unconfirmed and
  the audit is explicit that a wrong redirect is worse than the current 404. It
  returns once the owner confirms which store "441" was.
- Every other finding in the audit: metadata and Open Graph (T023–T029,
  T038–T046), the store pages' titles, descriptions and H1s (T047–T053,
  T063–T069, T085–T091), the H1 spacing defect (T072–T084), structured data
  (T009–T022) and the URL-architecture consolidation (T006, T007, T017). Each is
  its own feature.
- The 278 broken product images (T003, T004, T106) — an inventory-provider
  problem, not a code change.
- Any change to what the filters do, what the catalog shows for a real size, or
  how prefetching behaves for a visitor.

## Decisions taken during `/clarify`

**Decision 1 — `?_rsc=`: block the crawl, do not add a `noindex` header.**
The audit asks for both (T001 and T002) and calls the header "the seatbelt". They
do not stack: a URL disallowed in `robots.txt` is never fetched, so its header is
never read. Verification settled which one matters — **every `?_rsc=` URL already
serves a clean canonical pointing at the real page** (checked on `/`,
`/legal-policies` and `/tires`), which is the strongest signal Google accepts that
these are duplicates. Indexation is therefore already handled; the unsolved
problem is purely crawl waste, and `robots.txt` is the tool for that. Adding the
header as well would leave it inert by definition, and a query-matched `noindex`
carries a real risk of catching a page we want indexed. **T002 is dropped, with
this reasoning recorded so it is not re-raised as an oversight.**

**Decision 2 — a complete size facet points at the size page, and the fabricated
variants stop existing.** The audit's blanket rule (all facets → `/tires`) would
discard the 272 size pages we already publish and list in the sitemap. Instead a
complete size consolidates onto its landing page, in the slug format the sitemap
already uses (`235-50-20`, no `r`). The `-r20` variant is not a second format to
canonicalise — it is the fabrication bug, and it disappears when the route stops
inventing sizes.

**Decision 3 — pagination is left exactly as it is.** `/tires?page=2` declares
itself canonical today, which is what Google recommends: folding page 2 into
page 1 hides everything only page 2 links to. The audit's blanket rule would
change this; we are not applying it there.

**Decision 4 — `/_next/image` is not blocked in this feature.** It rides along in
T001 but is a separate decision with a real cost: the product photos rendered on
the site are served through that path, so blocking it removes the catalog from
Google Images. Social previews would survive — the detail pages' `og:image`
points straight at `usedtires.online`, not through the optimizer — but that is not
the reason to block it. The audit's justification is crawl waste from the **278
broken images** (T003, T004, T106), which is an inventory problem being treated
with a crawl rule. It is decided alongside the work that fixes the cause.

**Decision 5 — all redirects live in one place.** The four legacy store redirects
go where the existing bare-host → `www` redirect already lives, so every redirect
on this site is readable in one file, with a test validating each destination
against `locationsConfig` (AC12).

## Functional requirements

- **FR1:** The prefetch URLs Next.js generates (`_rsc=…`) must not consume crawl
  budget, **in both the positions the parameter occurs** — first in the query
  string, and appended to a URL that already carries one (Amendment 1). Real
  pages must remain fully crawlable — the rule must not widen beyond the prefetch
  parameter.
- **FR2:** A `/tires` URL carrying filter parameters must declare as canonical
  **the page we actually publish for that view**:
  - an **incomplete** size (any subset of `w`/`s`/`d` short of all three) is not
    a page we publish → `/tires`;
  - a **complete** size → its size landing page, in the sitemap's slug format;
  - filter parameters we do not build pages for (`condition`, brand, price) →
    `/tires`, which is already the behaviour and must not regress;
  - **pagination** keeps its current self-referential canonical (Decision 3).
- **FR3:** `/tires/size/{slug}` must render a page **only for a size we actually
  stock**. Any other slug must answer `404`. The route must not fabricate a size
  from the shape of the slug.
- **FR4:** FR3 must not remove a page for any size we do stock. Whatever the
  fallback is genuinely covering today — a size whose stored format does not
  survive slugification — must keep working, or be shown not to exist.
- **FR5:** Each of the four confirmed legacy store URLs must answer with a
  **permanent** redirect to its current page, and must do so on both hosts:
  | From | To |
  | --- | --- |
  | `/locations/miami-hialeah` | `/locations/hialeah` |
  | `/locations/miami-coral-gables` | `/locations/coral-gables` |
  | `/locations/orlando-semoran` | `/locations/east-orlando` |
  | `/locations/miami-south-us1` | `/locations/cutler-bay` |
- **FR6:** A redirected legacy URL must reach its destination in **one hop**. The
  bare host already redirects to `www`; a legacy URL on the bare host must not
  spend one redirect becoming `www` and a second becoming the new slug.
- **FR7:** Nothing a visitor can see or do changes, with the single intended
  exception of FR3. Prefetching still prefetches, every filter still filters,
  every real page still renders the same content.
- **FR8:** Every URL the site emits for its own root — in canonical tags,
  `og:url`, the sitemap and **structured data** — must be the same string, with
  **no trailing slash**. That is already what the canonical, `og:url`, the
  sitemap and `Organization.url` publish; the breadcrumb must join them rather
  than the other way round. The `@id` identifiers (`…com/#organization`,
  `…com/#website`) are **excluded**: they are opaque, stable entity keys Google
  has already learned, not claims about a URL, and re-minting them is a cost with
  no benefit.
- **FR9:** Each correction is covered by a test that fails if it is undone —
  following the guard-test pattern already used for the WhatsApp number and the
  retired event names.

## Acceptance criteria (testable)

- [ ] **AC1:** Given the published `robots.txt`, when it is fetched, then it
      disallows the prefetch parameter in **both** the positions it occurs —
      `?_rsc=` when it is the first query parameter and `&_rsc=` when it is not
      (see Amendment 1) — and still contains every rule it has today (`/api/`,
      `/checkout`, `/dashboard`, `/sellers/`, `/feed/`), the `Host` line and the
      `Sitemap` line.
- [ ] **AC2:** Given the published `robots.txt`, when it is fetched, then it does
      **not** disallow `/_next/image` (Decision 4) and does not disallow any route
      that appears in the sitemap.
- [ ] **AC3:** Given `/tires?d=20`, when the page is rendered, then its canonical
      is `https://www.mrgomatires.com/tires`.
- [ ] **AC4:** Given any `/tires` URL with one or two of `w`, `s`, `d` (and not
      all three), when the page is rendered, then its canonical is
      `https://www.mrgomatires.com/tires`. Tested across the combinations, not one
      example — **including `/tires?w=&s=&d=`**, the empty-string form the audit
      names in T005, where all three parameters are present but none has a value.
- [ ] **AC5:** Given `/tires?w=235&s=50&d=20`, when the page is rendered, then its
      canonical is `https://www.mrgomatires.com/tires/size/235-50-20`, and that
      URL answers `200`.
- [ ] **AC6:** Given `/tires?condition=new`, when the page is rendered, then its
      canonical is `https://www.mrgomatires.com/tires` — unchanged from today.
- [ ] **AC7:** Given `/tires?page=2`, when the page is rendered, then its canonical
      is still `https://www.mrgomatires.com/tires?page=2` — deliberately unchanged
      (Decision 3), so that changing it later is a decision rather than a
      side-effect.
- [ ] **AC8:** Given `/tires/size/foo-bar-baz`, `/tires/size/999-999-999` and
      `/tires/size/235-50-r20`, when each is requested, then each answers `404`.
- [ ] **AC9:** Given a size the catalog actually stocks, when its size page is
      requested, then it answers `200` and renders the same content it does today.
      Tested against sizes read from the same source the sitemap is built from,
      not a hard-coded example.
- [ ] **AC10:** Given every entry the sitemap publishes under `/tires/size/`, when
      each is resolved, then none of them 404. FR3 must not shrink the sitemap's
      own promises.
- [ ] **AC11:** Given each of the four legacy URLs in FR5 on `https://www.…`, when
      requested without following redirects, then the response is a **permanent
      redirect (`308`, consistent with the host rule already in this file — see
      Amendment 2)** and the `Location` header is the exact destination in the
      table.
- [ ] **AC12:** Given each of the same four URLs on the bare host
      `https://mrgomatires.com`, when requested following redirects, then the
      final URL is the `www` destination and **exactly one** redirect was
      followed.
- [ ] **AC13:** Given the redirect table in the code, when a test compares it
      against the store slugs published in `locationsConfig`, then every
      destination is a slug that exists. A future store rename that orphans a
      redirect fails the build.
- [ ] **AC14:** Given `/locations/miami-north-441`, when requested, then it still
      answers `404`. Deliberately unchanged, so that shipping it later is a
      decision rather than an accident.
- [ ] **AC5b:** Given the size lookup fails (the database is unreachable), when
      `/tires?w=235&s=50&d=20` is requested, then it still answers `200` and
      declares the `/tires` canonical. `/tires` degrades gracefully today and must
      keep doing so — this feature must not turn a database blip into a 500 on the
      catalog.
- [ ] **AC15a:** Given a breadcrumb whose first item is the site root, when the
      JSON-LD is built, then its `item` is `https://www.mrgomatires.com` — no
      trailing slash — matching what the canonical and `og:url` already publish.
- [ ] **AC15b:** Given any page that emits both a canonical and a breadcrumb, when
      both are read from the rendered HTML, then the two forms of the site root
      are byte-identical. Checked on the home and on one page from each of the
      eight templates' families.
- [ ] **AC15c:** Given the `@id` values in the Organization and WebSite nodes,
      when the page is rendered, then they are **unchanged** (`…com/#organization`,
      `…com/#website`) — deliberately excluded from FR8, so that changing an
      entity identifier is a decision rather than a side-effect.
- [ ] **AC15:** Given the full test suite, build and performance budget, when run,
      then all are green and the JS budget is unchanged — this feature adds no
      client code.
- [ ] **AC16 (manual, after deploy):** Search Console → URL Inspection on one
      `?_rsc=` URL, one fabricated size URL and one redirected legacy URL confirms
      Google sees what we intended.
- [ ] **AC17 (manual, measurement, before merge):** The four legacy URLs are
      checked in Search Console (Performance → filter by page) to record whether
      impressions still arrive today. This does not gate the redirect — a 301 is
      correct either way — it records what the redirect is expected to recover.

## Non-functional / constraints

- **No visible change, with one intended exception.** Only the fabricated size
  pages change behaviour, and they change to the behaviour they should always
  have had. If anything else renders differently, something is wrong.
- **No client JavaScript.** All of it is configuration, a route guard and a
  metadata builder. The performance budget must come out byte-identical.
- **Reuse before creating.** The canonical logic belongs in the existing `seo.ts`
  builder that already produces it, not in a new mechanism beside it. The store
  slugs already live in `locationsConfig`; the redirect table must derive its
  validity from that list rather than repeating it. The set of real sizes already
  has one source — the same one `generateStaticParams` and the sitemap read.
- **Reversible.** Every part of this can be undone by deleting a rule or
  restoring a fallback. Nothing here migrates data or changes a URL a visitor
  holds.
- **A wrong redirect is worse than a 404.** Confidence in the destination is a
  precondition for shipping any redirect, not a detail to settle afterwards.
- **A 404 must stay cheap.** FR3 turns an unbounded space into 404s; that path
  must not run an expensive query per request for URLs that will never be real.

## Open questions

_None. All five markers were resolved during `/clarify` — see **Decisions taken**
above. Two items are explicitly deferred rather than unknown: `/_next/image`
(Decision 4) and `/locations/miami-north-441`, which is blocked on the owner
confirming which store "441" refers to and is tracked in the audit's own
validation list._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
