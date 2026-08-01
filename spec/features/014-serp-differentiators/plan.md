# Plan — SERP differentiators (win the click on Google)

> Feature: `014-serp-differentiators` · Based on: [spec.md](./spec.md) · Created: 2026-07-31

## Technical approach

Four moves, in dependency order. Each one is independently shippable, and the
first is what makes the rest testable.

### 1. One copy module, imported by both the UI and the metadata

Today the same claim is retyped in eleven files. `"15,000+ tires in stock"`
appears in `Home.tsx`, `AboutUs.tsx`, `guides/page.tsx`, `guides/[slug]/page.tsx`,
`locationsConfig.ts` and `locations/page.tsx`; `"Free shipping nationwide"` and
`"30-Day warranty"` are scattered across five listing pages. That is why the site
already contradicts itself on inventory.

A new `src/app/utils/brandClaims.ts` becomes the single source: the primary and
secondary differentiators, the two inventory claims (network vs. online), the
warranty, the shipping promise, the location count and the founding year. Both
the rendered UI and the page metadata import from it. Changing the warranty
wording becomes a one-line edit, and **FR4 becomes mechanically testable**.

### 2. Pure metadata builders, so the regression guard doesn't need a database

The eight commercial entry points build their `Metadata` inline, and three of them
(`/tires`, brand, size) do it inside a `generateMetadata` that also awaits DB
data. A test that imports those page modules would need `mssql` mocked.

So the metadata construction is extracted into **pure functions in `seo.ts`** —
`homeMetadata()`, `tiresMetadata({size, page})`, `usedTiresMetadata()`,
`brandMetadata(brandName)`, `sizeMetadata(sizeLabel)`, … — each taking plain
values and returning `Metadata`. The pages become thin callers. The regression
guard (FR11/AC12) then tests the builders directly: no DB, no mocks, fast.

These builders share one internal helper that assembles canonical + OpenGraph +
Twitter, killing the boilerplate currently duplicated across the eight files.

**Title-template detail:** the root layout declares
`template: '%s | MrGoma Tires'`, which spends 15 of the 60 available characters.
The approved home title (`Used & New Tires Miami — 30-Day Warranty | MrGoma`,
57 chars) already carries its own brand suffix, so the commercial entry points
use `title: { absolute: … }` to bypass the template, with the shorter `| MrGoma`
suffix. Everything else keeps the template.

### 3. Above-the-fold content on the home page

Two changes to the hero, both server-rendered:

- **The `<h1>` moves out of `SearchContainer`** (a `'use client'` component) into
  the server-rendered `Home.tsx`. Three reasons: it is static content sitting in
  a client bundle; it currently renders inside a mount transition that paints it
  at `opacity-0` until React hydrates; and the main visual heading is one of the
  sources Google uses to build the title link, so it should be unconditional HTML.
  `BrandHeadline` stays exactly where it is, demoted to `as="h2"` — the slogan is
  kept, as the spec requires, and the component already supports the prop.
- **A trust strip** is rendered between the `<h1>` and the search tabs. The
  pattern is not invented: `SearchResults.tsx:307–320` already renders exactly
  this on `/tires`, and it is the thing Google turned into the good snippet. That
  markup gets **extracted into a shared `TrustStrip` component and used by both
  pages**, so `/tires` and `/` stop drifting.

Per the `modern-web-guidance` HTML guide, the strip is a real `<ul>`/`<li>` list
(list content gets list semantics), not a row of `<span>`s, and carries no ARIA —
native semantics only. It is plain text: no images, no new font, no client
component, so it costs nothing in JS and cannot shift layout.

### 4. Structured data: fix what's wrong, then add what's missing

Three defects first:

- **Every store points at the site root.** `seo.ts:226` sets `url: site` for all
  seven `AutoPartsStore` nodes. Seven businesses claiming one URL is worse than
  no markup. Each gets its own `/locations/[slug]` URL and a stable `@id`.
- **All seven stores are emitted on every page** by the root layout, while
  `/locations/[location]/page.tsx` *also* emits its own — so a location page ships
  its store twice. Correct model: Organization + WebSite stay global; the seven
  stores render on `/locations`; each store renders on its own page. One canonical
  home per entity.
- **JSON-LD is emitted two different ways across nine files** — eleven nodes as a
  script child (`<script …>{JSON.stringify(x)}</script>`) and five via
  `dangerouslySetInnerHTML`. They are not equivalent, and the safer one is the
  one that looks riskier.

  Verified against the repo's React 19.2.1: React treats `<script>` as a raw-text
  element, so a text child is **not** HTML-escaped — `&` survives intact and the
  JSON parses. It also neutralises a `</script>` breakout by emitting
  `</script>`, which is still valid JSON and cannot close the element.
  `dangerouslySetInnerHTML` does neither check: a value containing `</script>`
  escapes the element verbatim. That matters here because `/tires/[slug]` renders
  database strings (brand, model, description) into its `Product` node.

  So the fix is the **opposite** of "switch everything to
  `dangerouslySetInnerHTML`": standardise on the child form, and convert the two
  files that currently use `dangerouslySetInnerHTML`
  (`locations/[location]/page.tsx`, `services/[service]/page.tsx`). A tiny shared
  `<JsonLd>` component makes that the only way JSON-LD leaves the codebase, and
  makes the guarantee unit-testable.

Then the additions: opening hours, coordinates, photo, price range, areas served
and telephone per store; telephone, description, slogan and founding date on the
organisation; `ItemList` counts on the listing pages; and removal of the
`potentialAction` search-box declaration, which Google retired.

### 5. Preview image

`opengraph-image.tsx` currently renders near-black with 16px pill text — legible
at 1200×630, an unreadable dark square at search-thumbnail size, which is what
the US result shows today. It gets reworked around a dominant brand mark and one
short line, so the 96×96 rendering still reads as MrGoma.

## Reuse first

| Reused | Where it comes from | Why |
| --- | --- | --- |
| Trust-strip markup & styling | `SearchResults.tsx:307–320` | Already proven — this exact strip produced the good snippet. Extracted, not rewritten. |
| `BrandHeadline` (`as` prop) | `ui/components/BrandHeadline` | Already supports any heading level; the slogan survives as `h2` with no component change. |
| `locationsConfig` | `(shop)/locations/locationsConfig.ts` | Already the single source of truth for store data (the slider, menu and pages all derive from it). Coordinates and hours are new *fields*, not a new store. |
| `canonical()` / `absUrl()` / `getSiteUrl()` | `utils/seo.ts` | URL building stays as-is. |
| `buildBreadcrumbJsonLd` | `utils/seo.ts` | Untouched; the new builders sit beside it. |
| Script-child JSON-LD pattern | `layout.tsx:67`, `tires/[slug]/page.tsx`, and 9 other nodes | The safe pattern is already the majority pattern — it just isn't universal. `JsonLd` makes it universal rather than inventing a new one. |
| `getLocationBySlug` | `locationsConfig.ts:149` | Location lookup unchanged. |
| Vitest + Testing Library setup | existing `seo.test.ts`, `BrandHeadline.test.tsx` | No new test tooling. |
| `InfoCardsSection` / `InfoCard` | `ui/sections/InfoCardsSection` | The "Why choose us" cards keep their role; their copy is repointed at `brandClaims`, not replaced. |

Deliberately **not** created: no new route, no new API endpoint, no CMS, no copy
framework, no schema library.

## Files to add / change

### Add

- `src/app/utils/brandClaims.ts` — the single source for every differentiator
  claim: `PRIMARY_DIFFERENTIATORS`, `WARRANTY`, `INVENTORY_NETWORK`
  (`"15,000+ tires across our 7 locations"`), `onlineInventoryLabel(n)`
  (`"4,342 available to buy online"`), `SHIPPING`, `LOCATIONS_COUNT`,
  `FOUNDED_YEAR = 2007`, `SLOGAN`, `POSITIONING`.
- `src/app/ui/components/TrustStrip/TrustStrip.tsx` — the shared `<ul>` strip
  (server component), props: `items: string[]`, `variant: 'dark' | 'light'`.
- `src/app/ui/components/TrustStrip/TrustStrip.test.tsx` — renders a list, one
  `<li>` per claim, no ARIA overrides.
- `src/app/ui/components/JsonLd/JsonLd.tsx` — `<script type="application/ld+json">`
  with the payload as a **text child** (React's raw-text handling keeps `&` intact
  and neutralises `</script>`); the only way JSON-LD is emitted from now on.
- `src/app/ui/components/JsonLd/JsonLd.test.tsx` — asserts a payload containing
  `&`, `<`, `"` **and a literal `</script>`** round-trips through `JSON.parse` of
  the rendered markup, and that the `</script>` cannot close the element.
- `src/app/utils/brandClaims.test.ts` — the FR10/AC11 guard: scans the repo
  sources and fails on any unqualified `15,000+ tires in stock`.
- `src/app/utils/metadata.test.ts` — the FR11/AC3/AC12 guard over all eight
  builders (length bounds + at least one primary differentiator).

### Change

- `src/app/utils/seo.ts` — the bulk of the work:
  - add the eight pure metadata builders + their shared assembler;
  - `buildLocationsJsonLd`: take a `LocationConfig`, emit per-store `url`, `@id`,
    `geo`, `openingHoursSpecification`, `image`, `priceRange`, `areaServed`,
    `telephone`;
  - `organizationJsonLd`: add `@id`, `telephone` (`+14073644016`), `description`,
    `slogan`, `foundingDate` (`2007`), `areaServed`;
  - `websiteJsonLd`: drop `potentialAction`, add `publisher` `@id` link;
  - add `buildItemListJsonLd({ url, name, count })`;
  - update `DEFAULT_DESCRIPTION` and the default title to the differentiator copy.
- `src/app/utils/seo.test.ts` — extend for the new/changed builders.
- `src/app/layout.tsx` — emit Organization + WebSite through `<JsonLd>`; **remove**
  the seven store nodes from the global head.
- **All remaining JSON-LD emitters** route through `<JsonLd>` so the guarantee is
  universal, not partial — `guides/[slug]/page.tsx` (3 nodes),
  `services/[service]/page.tsx` (3), `tires/[slug]/page.tsx` (2),
  `tires/used`, `tires/new`, `tires/brands/[brand]`, `tires/size/[size]`
  (breadcrumb each). Nine files, eighteen nodes, one emitter.
- `src/app/(home)/page.tsx` — use `homeMetadata()`; `title` becomes `absolute`.
- `src/app/(home)/container/Home/Home.tsx` — render the `<h1>` and `<TrustStrip>`
  in the hero; repoint the `STATS` strip at `brandClaims`.
- `src/app/ui/sections/SearchContainer/SearchContainer.tsx` — `BrandHeadline`
  becomes `as="h2"`; the `h1` is gone from the client bundle.
- `src/app/(shop)/locations/locationsConfig.ts` — add `geo: { latitude, longitude }`
  and `hours` per store; fix the `15,000+` string in the North Miami description.
- `src/app/(shop)/locations/page.tsx` — emit the seven store nodes here (via
  `<JsonLd>`); repoint the badge row at `brandClaims`.
- `src/app/(shop)/locations/[location]/page.tsx` — pass the full config to the
  location builder; emit via `<JsonLd>`.
- `src/app/(shop)/tires/page.tsx` · `tires/used/page.tsx` · `tires/new/page.tsx` ·
  `tires/brands/[brand]/page.tsx` · `tires/size/[size]/page.tsx` — call the pure
  builders; add `ItemList`; replace the hand-written trust rows with `TrustStrip`;
  switch `"N+ tires in stock"` to `onlineInventoryLabel(n)`.
- `src/app/(shop)/tires/container/SearchResults.tsx` — use `TrustStrip`; the
  hard-coded `'3,600+ tires in stock'` fallback goes away.
- `src/app/(shop)/about-us/page.tsx` + `container/AboutUs/AboutUs.tsx` — claims
  from `brandClaims`; the `[YEAR]` placeholder becomes 2007.
- `src/app/(shop)/guides/page.tsx` · `guides/[slug]/page.tsx` — claims from
  `brandClaims`.
- `src/app/opengraph-image.tsx` — thumbnail-legible redesign.

## Data & flow

**No API, no route, no DB change.** Every number already on the page comes from a
call the page already makes.

- `brandClaims.ts` is a static module — imported by server components and by the
  metadata builders. Zero runtime cost, zero client JS (the strip is a server
  component).
- The **online** inventory count keeps coming from the existing `fetchTires`
  `totalCount` that the listing pages already await; it is only *relabelled*.
- The **network** claim (15,000+) is a static string. It is never derived from the
  database, and never rendered on a page that also shows a live count without the
  "across our 7 locations" qualifier.
- Coordinates are static config. The seven `maps.app.goo.gl` short links resolve
  to their canonical map URLs, from which lat/lng is read; the resulting table is
  handed to the owner for validation before merge (per the `/clarify` decision).
  Fallback if a link doesn't resolve: read the coordinates from the street address
  on Google Maps manually. Seven records, done once.
- Opening hours are static config: Mon–Sat 08:00–18:00, Sun 10:00–16:00, modelled
  **per store** even though all seven are currently identical, so a future
  divergence is an edit rather than a refactor.
- JSON-LD placement after the change:

  | Node | Rendered on |
  | --- | --- |
  | `Organization`, `WebSite` | every page (root layout) |
  | `AutoPartsStore` ×7 | `/locations` only |
  | `AutoPartsStore` ×1 | its own `/locations/[slug]` |
  | `BreadcrumbList` | unchanged, per page |
  | `ItemList` | `/tires`, `/tires/used`, `/tires/new`, brand, size |
  | `Product` | unchanged, `/tires/[slug]` |

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| **AC1** — claims readable above the fold on 390px | `TrustStrip` rendered in `Home.tsx` between `<h1>` and the search tabs; pills wrap to max 2 lines at 390px | Manual check at 390×844 (DoD step 5); the strip must not push the search tabs below the fold |
| **AC2** — one `<h1>`, tire-only, market named, slogan demoted | `<h1>` moves to `Home.tsx`; `BrandHeadline as="h2"` in `SearchContainer` | Test: render `Home`, assert exactly one `h1`, that it matches `/tires/i` and `/miami\|florida/i`, and that it does **not** match `/complete auto care\|auto repair/i`; assert an `h2` carries the slogan |
| **AC3** — title ≤60, desc 140–160, ≥1 differentiator, ×8 | Pure builders in `seo.ts` | `metadata.test.ts` iterates all eight builders and asserts all three bounds |
| **AC3b** — exact approved home copy | `homeMetadata()` returns `title: { absolute: 'Used & New Tires Miami — 30-Day Warranty \| MrGoma' }` and the approved description | `metadata.test.ts` asserts string equality on both |
| **AC4** — one copy change propagates everywhere | `brandClaims.ts` is the only definition | `brandClaims.test.ts` scans `src/**/*.{ts,tsx}` and fails on any literal claim string outside `brandClaims.ts` |
| **AC5** — 7 stores, own URL, distinct `@id` | `buildLocationsJsonLd` takes `LocationConfig` and derives `/locations/[slug]` | `seo.test.ts`: map the 7 nodes, assert `new Set(urls).size === 7` and `new Set(ids).size === 7` |
| **AC6** — location page valid, hours + geo present | New fields in `buildLocationsJsonLd` | Unit test asserts the fields exist and are well-formed; **plus a manual Rich Results Test run on one location page** (cannot be automated) |
| **AC7** — Organization valid with phone/desc/founded/slogan | `organizationJsonLd` extended | Unit test on the four fields; **plus a manual Rich Results Test run on the home page** |
| **AC8** — item counts match rendered counts, all 5 listing pages | `buildItemListJsonLd` fed the same `totalCount` the page renders | Unit test on the builder; page-level test asserts the `ItemList` count and the rendered label derive from the same value, on `/tires`, `/tires/used`, `/tires/new`, brand and size |
| **AC19** — "used tires" survives as the product term | `brandClaims` keeps `SELECTION_CLAIM` (where "like-new" lives) separate from the title/heading strings | `metadata.test.ts` asserts no builder's title contains `like-new`; the AC2 test asserts the same for the `<h1>` |
| **AC9** — no search-box declaration | `potentialAction` removed from `websiteJsonLd` | `seo.test.ts`: `expect(websiteJsonLd()).not.toHaveProperty('potentialAction')` |
| **AC10** — brand identifiable at 96×96 | `opengraph-image.tsx` redesign: dominant mark, one short line | **Manual** — render `/opengraph-image`, downscale to 96×96, confirm the mark reads |
| **AC11** — no unqualified `15,000+ tires in stock` | Every occurrence repointed at `brandClaims` | `brandClaims.test.ts` greps the sources for `/15,000\+\s*tires in stock/` and fails on a hit |
| **AC12** — guard fails on a stripped description | The guard reads the builders' output | `metadata.test.ts` — verified by temporarily emptying one builder's description during implementation and confirming a red test |
| **AC13** — no CWV regression | Strip is server-rendered text, no image/font/JS; kept outside the mount transition; hero video `poster` preload (feature 002) untouched | Lighthouse before/after on `/`; `npm run perf:budget` |
| **AC14** — keyboard + SR + AA contrast | Semantic `<ul>`/`<li>`, no ARIA overrides, contrast checked against the dark hero | Manual keyboard + screen-reader pass; contrast measured on the pill text |
| **AC15** — DoD green | — | `npx tsc --noEmit` · `npm run lint` · `npm test` · `npm run build` · `npm run perf:budget` |
| **AC16** — hours + geo within ~50 m | New `geo`/`hours` fields in `locationsConfig` | Unit test asserts all 7 have hours and a lat/lng in Florida's bounding box; **owner validates the exact coordinates** |
| **AC17** — org phone + founding date | `organizationJsonLd` | `seo.test.ts` string equality on `+14073644016` and `2007` |
| **AC18** — GSC baseline recorded | — | **Manual, blocking merge** — export impressions/clicks/position/CTR for the 8 pages, prior 28 days, into the feature folder |

Five criteria (AC6, AC7, AC10, AC14, AC18) are **manual gates**. They are listed
in `tasks.md` as explicit steps, not assumed.

## Tradeoffs / alternatives

- **Pure builders vs. testing the page modules.** Testing `generateMetadata`
  directly would be a more faithful test, but three of the eight pages await DB
  data inside it, so the guard would need `mssql` mocked and would break whenever
  a query changes. Extracting pure builders makes the guard fast and stable at the
  cost of one indirection. The pages become thin, which is the right shape anyway.
- **Moving the `<h1>` out of `SearchContainer` vs. leaving it.** Leaving it is
  zero-risk but keeps static text in a client bundle, rendered at `opacity-0`
  until hydration. Since the heading is the thing Google reads to build the title
  link, unconditional server HTML is worth the small refactor.
- **Extracting `TrustStrip` vs. copying the markup.** Copying is faster and would
  have shipped the same snippet. It also guarantees the two strips drift, which is
  the exact failure mode this feature exists to fix.
- **Removing the 7 store nodes from every page.** Emitting them everywhere feels
  like "more signal", but duplicate entities across a site is noise, and a location
  page currently ships its own store twice. One canonical location per entity is
  the modelling Google documents. Short-term wobble is possible; correctness wins.
- **`ItemList` on listing pages.** It doesn't produce a rich result on its own for
  this category. It is cheap and it makes the "N available online" claim
  machine-verifiable rather than a rendered string, which is the point.
- **Rejected — `aggregateRating` on the business.** Would be the highest-impact
  change to how the result looks. Google has ignored self-declared ratings on
  business markup since 2019, and emitting them anyway risks a manual action.
  Explicitly out of scope in the spec; not smuggled back in here.
- **Rejected — a copy/CMS layer.** A TS module is enough for a dozen strings.

## Risks

| Risk | Mitigation |
| --- | --- |
| The new `<h1>` + strip becomes the LCP element and pushes LCP up | Server-rendered text with a font already preloaded; measure with Lighthouse before/after (AC13) and roll back the strip's placement if LCP moves |
| The strip pushes the search box below the fold on small phones — the mission ranks frictionless search as pillar 1 | Explicit 390px constraint; max 2 wrapped lines; verified manually before merge |
| Google keeps rewriting the title anyway | Unavoidable — it rewrites 60–70% of descriptions. This is why the claims go **on the page**, not only in meta. The on-page strip is the durable half of the fix. |
| Coordinates wrong → shoppers sent to the wrong place | Owner validates the seven pairs before merge; a wrong pin is worse than none |
| Removing 7 store nodes from global head causes a temporary local-signal dip | They still exist, once each, on the right page; monitor via the GSC baseline |
| The `brandClaims` grep test is brittle (false positives on prose) | Scope it to the specific unqualified inventory pattern rather than every claim word |
| Copy edits touch 11 files → merge conflicts with other branches | Land this branch before starting the TireCard redesign, which touches the same listing pages |
| Routing 18 nodes through one component silently alters existing output | `JsonLd` uses the child form that 11 of the 18 nodes already use, so their output is byte-identical. The 2 converted `dangerouslySetInnerHTML` sites gain `</script>` neutralisation and lose nothing. `JsonLd.test.tsx` pins the guarantee. |

## Out of scope

- Star ratings / seller ratings, Google Business Profile, citations — off-site
  owner work, per the spec.
- The review system with rating markup on `/tires/[slug]` (earlier SEO plan,
  phase 3.6).
- `opengraph-image.tsx`'s `runtime = 'edge'` declaration — worth revisiting on its
  own (Vercel now recommends Fluid Compute over Edge), but changing the runtime
  under an `ImageResponse` is unrelated risk in this branch.
- The dormant `tailwind.config.ts` tokens (backlog item) — the strip uses existing
  utilities only.
- Any ranking-position promise. This feature changes what the result *says*.

---

_The concrete steps live in [tasks.md](./tasks.md)._
