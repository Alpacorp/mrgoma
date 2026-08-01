# Spec — SERP differentiators (win the click on Google)

> Feature: `014-serp-differentiators` · Status: Draft · Created: 2026-07-31
> Roadmap: Backlog — "SEO — phased plan" (follow-up to the WJM audit, phases 1–4
> already delivered) · Branch: `feat/014-serp-differentiators`

## Why — problem & value

We rank for the money query. We just don't **look** like the best option when we
get there.

A search for **"tires miami"** served from the US shows our home page like this:

> **MrGoma Tires: Buy New & Used Tires in Miami, FL**
> Shop new and used tires in Miami. Fast installation, multiple locations, and
> secure online ordering at MrGoma Tires.

Nothing in that snippet separates us from any other tire shop. "Multiple
locations" and "fast installation" are table stakes — every competitor on the
page could write the same sentence. Meanwhile the paid result above us leads with
"Up to 50% Off" and a 4.6★ / 73,398-review badge, and the Yelp aggregator
outranks us with a listicle.

The same query served from a different region surfaced a **different page of our
own site** — the `/tires` listing — and Google built a much stronger snippet from
it:

> **New & Used Tires in Miami**
> New & Used Tires in Miami · 4,342 tires in stock · Free shipping nationwide ·
> 7 locations Miami & Orlando · 30-Day Warranty. Browse by brand.

That second snippet is the proof of the mechanism: **Google assembled it from
text that is physically on the page**, not from a meta description. `/tires`
renders a trust strip with those exact four claims; the home page renders none of
them above the fold. Google rewrites most meta descriptions to fit the query, so
the reliable lever is not "write a better description" — it is **put the claims
in the page, high up, in plain readable text, and make the machine-readable data
say the same thing.**

The owner has now given us the claims that actually differentiate the business:

**Primary (lead with these):**

1. 30-Day Warranty on Like-New Used Tires
2. 15,000+ Tires in Stock
3. Florida's Largest Selection of Like-New Used Tires
4. New Tires • Like-New Used Tires • Complete Auto Care

**Secondary (trust / convenience):** Fast Installation · 7 Convenient Locations ·
Shop Online · Free Shipping Available · Trusted Since 2007 · Family-Owned
Business

**Brand positioning:** Drive with Confidence · Dealership-Level Service.
Independent-Shop Prices.

This feature makes the **search result** carry those claims — across the home
page and every commercial entry point — so a shopper comparing five blue links
has a reason to pick ours. It serves the mission directly: the mission says we
compete on *experience* and earn trust through *a clear condition standard and a
warranty on used tires*. Right now that promise is invisible until after the
click. This closes the gap between what we are and what Google shows.

It also fixes a related defect found while scoping: all seven store entries in
our machine-readable location data currently point at the site root instead of
their own location page, which weakens every local-search signal we emit.

## User stories

- As a **shopper comparing tire shops on Google**, I want the result for MrGoma
  to tell me up front that the used tires carry a 30-day warranty and that there
  are thousands in stock nearby, so that I click us instead of the aggregator
  listicle above us.
- As a **shopper searching from a phone**, I want the first screen of the home
  page to confirm what the search result promised, so that I don't bounce back to
  the results page.
- As the **business owner**, I want our real differentiators (warranty, selection,
  7 locations, since 2007, family-owned) to appear consistently wherever we show
  up, so that our marketing message and our website say the same thing.
- As a **local shopper searching "tire shop near me"**, I want Google to know
  which of the seven stores is which, with its own page, hours and address, so
  that I'm sent to the closest one.
- As the **team**, we want the differentiator copy to live in one place, so that
  a change to the warranty or the stock count doesn't require editing a dozen
  files and leaving three of them stale.

## Scope

### In

**1. On-page claims where Google can read them.**

- The home page gains a **trust strip above the fold** carrying the primary
  differentiators in plain text, following the pattern already proven on `/tires`.
- The home page **`<h1>` becomes descriptive** — it currently reads *"The Tires
  you need, The Price you want"*, a slogan with no connection to what people
  search for. Google uses the main visual heading as a source for the result
  title, so the h1 must state what the business sells and where, with the brand
  slogan demoted to a supporting line (kept, not deleted).
- The same claims are stated in readable prose somewhere on the page, not only as
  isolated badge words, so Google has a full sentence to lift.

**2. Titles and descriptions on the commercial entry points.**

Rewritten to lead with a differentiator instead of a category description, for:
`/` · `/tires` · `/tires/used` · `/tires/new` · `/tires/brands/[brand]` ·
`/tires/size/[size]` · `/locations` · `/locations/[location]`.

The copy is **centralised in one place** so the same claim can never drift
between pages, and so a wording change is a one-line edit.

The **site-wide fallback** title and description are updated in the same pass.
They are what any page without its own metadata inherits (`/contact`,
`/legal-policies`, `/checkout`, …), so leaving them generic would keep a long tail
of pages saying nothing. This is the only place the feature reaches beyond the
eight entry points above.

**3. Machine-readable business data (structured data) brought up to standard.**

- **Bug fix:** each of the seven stores must reference **its own location page**,
  not the site root, and carry a stable identity so Google can tell the seven
  apart.
- Each store gains the details a local search result is built from: **opening
  hours, map coordinates, a photo, a price range, and the areas it serves**.
- The organisation entry gains **phone, description, founding year, and slogan**,
  so the brand is a complete entity rather than a name and a logo.
- The listing pages declare **how many items they contain**, so the "N tires in
  stock" claim is backed by data and not only by a rendered string.
- Remove the site-search declaration that Google retired (the sitelinks search
  box) — it produces nothing and is dead weight.
- **Consolidate emission.** The site currently writes JSON-LD two different ways
  across nine files. Both happen to be safe today, but "happens to be" is not a
  guarantee, and one of the two does not neutralise a value that tries to close
  the script element — which matters because product markup carries database
  strings. All eighteen nodes move behind one component whose behaviour is pinned
  by a test.

**4. Social/preview image that survives being a thumbnail.**

The current preview image is a dark, text-dense card; Google renders it as an
unreadable black square next to our result. It gets reworked for legibility at
thumbnail size.

**5. An inventory story that doesn't contradict itself.**

Today the home page, `/about-us` and `/locations` claim "15,000+ tires in stock"
while `/tires` renders the live database count (4,342 at time of writing). Both
are visible to Google and to the shopper, and read together they look like an
exaggeration.

The two numbers describe different things, so the site will say so explicitly:

- **Network claim** — "15,000+ tires across our 7 locations". Used on the home
  page, `/about-us`, `/locations` and in snippets. This is the physical stock
  held across the stores.
- **Online claim** — the live count, always labelled as what it is: "N available
  to buy online". Used on `/tires` and the other listing pages.

Neither claim may be written in a way that implies the other. "15,000+ tires in
stock" with no qualifier is retired.

**6. A regression guard.**

An automated test that fails if a commercial entry point ships without a title,
without a description, or with a description that omits every primary
differentiator — so this work can't silently rot.

### Out

- **Star ratings in the search result.** The competitor's 4.6★ badge comes from
  Google's *seller ratings* on a paid ad, which require 100+ verified reviews per
  year collected through Google Customer Reviews or an approved partner. Google
  has ignored self-declared ratings on business/organisation markup since 2019,
  so **no amount of code in this repo can produce those stars.** It is a real
  opportunity, but it is an off-site programme for the owner, not this feature.
- **Google Business Profile work** for the seven stores (photos, posts, Q&A,
  categories, review responses) — off-site, owner-operated.
- **Local citations and directory listings** (Yelp, Yellow Pages, Bing Places) —
  already tracked as off-site work from the WJM audit.
- **Paid search.** Nothing here buys an ad slot.
- **New pages or new routes.** This is a strengthening pass over pages that
  already exist.
- **The review system with rating markup on `/tires/[slug]`** — still pending from
  the earlier SEO plan (phase 3.6), tracked separately.
- **Ranking position itself.** This feature targets what the result *says* and
  how often it is *clicked*; it does not promise to move us above Yelp.
- **Redesign.** Visual changes are limited to what the new content requires; this
  is not the TireCard redesign or a home-page overhaul.

## Functional requirements

- **FR1:** The home page states the primary differentiators in readable text
  within the first screen, on mobile and desktop.
- **FR2:** The home page's single `<h1>` describes what the business sells and
  where it operates, **focused on tires** — the broader service range is not
  named in it. The brand slogan remains on the page as supporting text.
- **FR3:** Every commercial entry point listed in scope has a title and a
  description that lead with a differentiator, stay within the lengths Google
  displays without truncating, and avoid formatting that invites Google to
  rewrite them.
- **FR4:** All differentiator copy resolves from a single shared source; no page
  hard-codes a claim that another page also states.
- **FR5:** Each of the seven stores is described as a distinct business entity
  with its own page reference, a stable identity, its address, phone, opening
  hours, coordinates, photo, price range and areas served.
- **FR6:** The organisation entity includes phone, description, founding year and
  slogan alongside the existing name, logo, address and social profiles.
- **FR7:** Listing pages (`/tires`, `/tires/used`, `/tires/new`, brand and size
  pages) declare their item count in machine-readable form, and that number
  agrees with what the page renders.
- **FR8:** The site emits no retired or non-functional structured-data
  declarations.
- **FR9:** The preview image is legible when rendered at search-thumbnail size.
- **FR10:** The site states exactly two inventory claims — the network claim
  ("15,000+ … across our 7 locations") and the online claim (live count, labelled
  as available online). Each is worded identically in every place it appears, and
  no unqualified "15,000+ tires in stock" survives anywhere.
- **FR11:** An automated test fails when a commercial entry point has a missing
  title, a missing description, or a description containing none of the primary
  differentiators.
- **FR12:** All structured data emitted by the site validates without errors
  against Google's Rich Results Test and the Schema.org validator. "All" means
  every node type the site emits — Organization, WebSite, local business,
  BreadcrumbList, ItemList and Product — not only the two on the home page.
- **FR13:** "Used tires" remains the product term in titles, headings and URLs.
  "Like-new" appears only as a qualifier inside differentiator strips and
  supporting copy, never as a replacement for the searchable term.
- **FR14:** JSON-LD leaves the codebase through exactly one emitter, so the
  serialization guarantee is verified once rather than assumed nine times.

## Acceptance criteria (testable)

- [ ] **AC1:** Given the home page on a 390px-wide phone viewport, when it first
  paints, then the 30-day warranty, the inventory claim and the number of
  locations are all readable without scrolling **and the tire search control is
  still visible** — the new content may not push it below the fold.
- [ ] **AC2:** Given the home page, when the heading outline is inspected, then
  there is exactly one `<h1>`, it names both the product ("new & used tires") and
  the market ("Miami" / "Florida"), it contains **no** non-tire service wording
  ("Complete Auto Care", "auto repair", …), and the brand slogan is still present
  at a lower heading level.
- [ ] **AC3:** Given each of the eight commercial entry points in scope, when its
  rendered `<title>` and meta description are read, then the title is ≤ 60
  characters, the description is 140–160 characters, and the description contains
  at least one primary differentiator.
- [ ] **AC3b:** Given the home page specifically, when its `<title>` and meta
  description are read, then they match the approved copy: title
  `Used & New Tires Miami — 30-Day Warranty | MrGoma`, description
  `15,000+ like-new used and new tires, every used tire backed by a 30-day
  warranty. 7 locations in Miami & Orlando. Free shipping. Since 2007.`
- [ ] **AC4:** Given a change to the warranty wording or the inventory figure in
  the shared copy source, when the site is rebuilt, then every page that states
  the claim shows the new wording — verified by an automated test, not by manual
  inspection.
- [ ] **AC5:** Given the seven store entries in the site's structured data, when
  they are inspected, then each references its own `/locations/[slug]` page, each
  carries a distinct stable identity, and no two entries share a page reference.
- [ ] **AC6:** Given any location page, when it is run through Google's Rich
  Results Test, then a local-business entity is detected with **zero errors**, and
  address, phone, opening hours and coordinates are all present.
- [ ] **AC7:** Given the home page, when it is run through the Rich Results Test,
  then the organisation entity is detected with zero errors and includes phone,
  description, founding year and slogan.
- [ ] **AC8:** Given all five listing pages — `/tires`, `/tires/used`,
  `/tires/new`, `/tires/brands/[brand]` and `/tires/size/[size]` — when their
  structured data is inspected, then each declares an item count that matches the
  count rendered on the page.
- [ ] **AC9:** Given the whole site, when the structured data is inspected, then
  no site-search-box declaration is emitted.
- [ ] **AC10:** Given the preview image at 96×96 px (search-thumbnail size), when
  viewed, then the brand mark is identifiable and no text is required to be read
  for the image to communicate the brand.
- [ ] **AC11:** Given a full-text search of the rendered site for any inventory
  figure, when every occurrence is listed, then each is either the network claim
  ("15,000+ … across our 7 locations") or the online claim (live count labelled as
  available online) — worded identically within its kind — and **no unqualified
  "15,000+ tires in stock" appears anywhere**.
- [ ] **AC12:** Given a commercial entry point stripped of its meta description,
  when the test suite runs, then the regression guard fails.
- [ ] **AC13:** Given the key routes before and after this change, when Core Web
  Vitals are compared, then LCP, INP and CLS stay within target — the new
  above-the-fold content introduces no layout shift and does not displace the LCP
  element.
- [ ] **AC14:** Given the new above-the-fold content, when navigated with a
  keyboard and a screen reader, then it is reachable, correctly announced, and
  meets WCAG 2.1 AA contrast against its background.
- [ ] **AC15:** `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
  and `npm run perf:budget` are all green (Definition of Done).
- [ ] **AC16:** Given the seven store entries, when their structured data is
  inspected, then each declares opening hours of Mon–Sat 8:00–18:00 and Sun
  10:00–16:00, and a latitude/longitude that resolves to within ~50 m of the
  store's street address.
- [ ] **AC17:** Given the organisation entity, when inspected, then its telephone
  is `+1 407 364 4016` and its founding date is 2007.
- [ ] **AC18:** Given the eight commercial entry points, when the branch is merged,
  then a Search Console baseline (impressions, clicks, average position, CTR for
  the 28 days prior) has been recorded for each — so the 4–6 week comparison has
  something to compare against.
- [ ] **AC19:** Given every page title, `<h1>` and URL on the site, when searched
  for the phrase "like-new", then it appears in none of them — the qualifier lives
  only in differentiator strips and body copy, and "used tires" remains the
  product term everywhere a search engine reads it as the page's subject.
- [ ] **AC20:** Given the whole codebase, when JSON-LD emission sites are listed,
  then every one of them renders through the shared `JsonLd` component — no page
  hand-writes a `<script type="application/ld+json">`.

## Non-functional / constraints

- **Truthfulness outranks marketing.** The mission's decision order is
  trust/correctness → accessibility → performance → scope. Any claim we cannot
  defend gets softened or dropped, no matter how well it would perform in a
  snippet. This principle already decided two calls below: the superlative was
  softened and the inventory figure was split into two honest claims. Apply the
  same test to any new copy that appears during implementation.
- **Mobile-first.** The above-the-fold strip is designed for a 390px viewport
  first; it must not push the search box off-screen on a phone. The mission
  ranks *frictionless search* as pillar 1 — the tire search must remain the first
  interactive thing a shopper reaches.
- **Performance.** LCP < 2.5s · INP < 200ms · CLS < 0.1 on `/`, `/tires` and
  detail must hold. New above-the-fold content is text; it must not become an
  image, a font load, or a client-side component.
- **Accessibility.** WCAG 2.1 AA: semantic markup for the new strip, sufficient
  contrast, no meaning conveyed by colour alone.
- **Voice.** US English, plain and honest, confident but not pushy. "Up to 50%
  Off"-style shouting is off-brand even though it is what the competitor does.
- **Reuse before creating.** The `/tires` trust strip, `locationsConfig` (already
  the single source of truth for store data) and the existing SEO helpers are the
  starting points; nothing here justifies a new pattern.
- **English-only.** No i18n layer.

## Resolved decisions (from /clarify, 2026-07-31)

- **Inventory — dual framing.** The 15,000+ figure and the live count describe
  different things, and the site will say so. Network claim: "15,000+ tires across
  our 7 locations" (home, `/about-us`, `/locations`, snippets). Online claim: the
  live database count, always labelled "available to buy online" (`/tires` and the
  other listing pages). Unqualified "15,000+ tires in stock" is retired.
- **Superlative — softened.** "Florida's Largest Selection" becomes **"one of
  Florida's largest selections of like-new used tires"**. Keeps nearly all the
  force without being a challengeable comparative claim that we'd have to evidence.
- **"Like-new" — qualifier only.** "Used tires" stays the product term in titles,
  headings and URLs, because that is what people actually search. "Like-new"
  appears as a qualifier inside the differentiator strips and supporting copy.
- **Home title & description — warranty-led.** The 30-day warranty is both the
  rarest differentiator and the one that answers the buyer's real fear. Approved
  copy:
  - Title (57 chars): `Used & New Tires Miami — 30-Day Warranty | MrGoma`
  - Description (152 chars): `15,000+ like-new used and new tires, every used
    tire backed by a 30-day warranty. 7 locations in Miami & Orlando. Free
    shipping. Since 2007.`
- **Free shipping — unconditional.** "Free shipping nationwide" is accurate and
  the checkout honours it always. It stays as-is in snippets and strips.
- **History — both confirmed.** Founding year **2007** goes into the organisation
  entity and the copy; **family-owned** goes into the trust copy. This also
  unblocks the `[YEAR]` placeholder still outstanding on `/about-us`.
- **Coordinates — captured now.** Latitude/longitude for all seven stores will be
  extracted from their Google Maps links into `locationsConfig` and handed to the
  owner for validation. Seven records, and one of the strongest local signals.
- **h1 — tires only.** The home `<h1>` and title stay focused on tires; "Complete
  Auto Care" appears in the differentiator strip and on `/services`, which already
  ranks on its own. Diluting our strongest query is not worth the extra keyword
  surface.
- **Opening hours — uniform and confirmed.** Mon–Sat 8:00–18:00, Sun 10:00–16:00,
  identical across the seven stores. Goes into the structured data and the
  location pages. *(The data structure still models hours per store, so a future
  divergence costs an edit, not a refactor.)*
- **Brand telephone — the WhatsApp line**, `+1 407 364 4016`. It is already the
  primary CTA on `/contact`, so the structured data now matches what the site
  actually pushes. The seven store numbers stay on their own entries.
- **Measurement — Search Console baseline confirmed available.** Impressions,
  clicks, average position and CTR for the eight affected pages are recorded
  before merge; compared again at 4–6 weeks. This is the only real proof the
  feature worked.

## Open questions

_None. Ready for `/plan`._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
