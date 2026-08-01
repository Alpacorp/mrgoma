# Tasks — SERP differentiators (win the click on Google)

> Feature: `014-serp-differentiators` · Based on: [plan.md](./plan.md) · Created: 2026-07-31

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

## Phase A — Foundations (no visible change yet)

- [x] **T1** — Create the single copy source. Export `PRIMARY_DIFFERENTIATORS`
  (the four lead claims), `SECONDARY_DIFFERENTIATORS`, `WARRANTY`
  (`'30-Day Warranty'`), `INVENTORY_NETWORK`
  (`'15,000+ tires across our 7 locations'`), `onlineInventoryLabel(n: number)`
  (`'4,342 available to buy online'`), `SHIPPING` (`'Free shipping nationwide'`),
  `LOCATIONS_COUNT` (`7`), `LOCATIONS_LABEL` (`'7 locations Miami & Orlando'`),
  `FOUNDED_YEAR` (`2007`), `SLOGAN`, `POSITIONING`, and
  `SELECTION_CLAIM` (`'one of Florida's largest selections of like-new used
  tires'`). No consumers yet. · files: `src/app/utils/brandClaims.ts` (new) ·
  check: `npx tsc --noEmit` passes; every string matches the `/clarify` decisions
  in `spec.md` **verbatim** (especially: no unqualified "15,000+ tires in stock").

- [x] **T2** — Add the `JsonLd` component: a server component rendering
  `<script type="application/ld+json">{JSON.stringify(data)}</script>` — the
  payload as a **text child**, not `dangerouslySetInnerHTML`. React treats
  `<script>` as a raw-text element, so `&` survives intact *and* a value
  containing `</script>` is neutralised as `</script>`; `dangerouslySetInnerHTML`
  does neither. Accepts one object or an array (one `<script>` per node). · files:
  `src/app/ui/components/JsonLd/JsonLd.tsx` (new),
  `src/app/ui/components/index.ts` (export) · check: renders; no runtime error.

- [x] **T3** — Pin the serialization contract with a test: render a payload whose
  values contain `&`, `<`, `>`, `"` **and a literal `</script>`**; assert the
  rendered markup still parses back to the original object via `JSON.parse`, and
  that the `</script>` did not close the element early. · files:
  `src/app/ui/components/JsonLd/JsonLd.test.tsx` (new) · check: `npm test` green;
  then switch the implementation to `dangerouslySetInnerHTML` once by hand and
  confirm the `</script>` case goes **red** before reverting.

- [x] **T4** — Extract the trust strip into a shared component. Move the markup
  from `SearchResults.tsx:307–320` verbatim (pill styling, `✦` marker) into a
  server component taking `items: string[]` and `variant: 'dark' | 'light'`.
  Per `modern-web-guidance`: a real `<ul>`/`<li>`, no ARIA, decorative marker
  `aria-hidden`. Not wired anywhere yet. · files:
  `src/app/ui/components/TrustStrip/TrustStrip.tsx` (new),
  `src/app/ui/components/index.ts` · check: `npx tsc --noEmit` passes.

- [x] **T5** — Test `TrustStrip`: renders one `<li>` per item inside a single
  `<ul>`, the decorative marker is `aria-hidden`, and no `role` overrides the
  native list semantics. · files:
  `src/app/ui/components/TrustStrip/TrustStrip.test.tsx` (new) · check:
  `npm test` green.

## Phase B — Metadata

- [x] **T6** — Add the shared metadata assembler to `seo.ts`: one internal helper
  taking `{ title, description, path }` and returning `Metadata` with
  `title: { absolute }`, `description`, `alternates.canonical`, `openGraph` and
  `twitter` — replacing the block duplicated across eight page files. · files:
  `src/app/utils/seo.ts` · check: `npx tsc --noEmit`; no page wired yet.

- [x] **T7** — Add the eight pure metadata builders on top of the assembler:
  `homeMetadata()`, `tiresMetadata({ size, page })`, `usedTiresMetadata()`,
  `newTiresMetadata()`, `brandMetadata(brandName)`, `sizeMetadata(sizeLabel)`,
  `locationsMetadata()`, `locationMetadata(loc)`. Copy comes from `brandClaims`.
  `homeMetadata()` returns the approved strings **exactly**:
  title `Used & New Tires Miami — 30-Day Warranty | MrGoma`, description
  `15,000+ like-new used and new tires, every used tire backed by a 30-day
  warranty. 7 locations in Miami & Orlando. Free shipping. Since 2007.` · files:
  `src/app/utils/seo.ts` · check: each builder is pure — takes plain values, does
  no I/O, and can be called from a test with no DB.

- [x] **T8** — Add the metadata regression guard: iterate all eight builders and
  assert `title.length <= 60`, `description.length` in `[140, 160]`, that the
  description contains at least one entry from `PRIMARY_DIFFERENTIATORS`, and that
  **no title contains "like-new"** (AC19 — "used tires" stays the product term
  wherever a search engine reads it as the subject). Add a separate
  exact-equality assertion for the two approved home strings. · files:
  `src/app/utils/metadata.test.ts` (new) · check: `npm test` green; then
  temporarily blank one builder's description and confirm the guard goes **red**
  before restoring it.

- [x] **T9** — Wire the eight pages to the builders, deleting the inline
  `Metadata` objects. The three DB-backed pages keep their `generateMetadata`
  wrapper but its body becomes a single builder call. · files:
  `src/app/(home)/page.tsx`, `src/app/(shop)/tires/page.tsx`,
  `src/app/(shop)/tires/used/page.tsx`, `src/app/(shop)/tires/new/page.tsx`,
  `src/app/(shop)/tires/brands/[brand]/page.tsx`,
  `src/app/(shop)/tires/size/[size]/page.tsx`,
  `src/app/(shop)/locations/page.tsx`,
  `src/app/(shop)/locations/[location]/page.tsx` · check: `npm run build`; view
  source on each route and confirm the rendered `<title>` has **no** duplicated
  ` | MrGoma Tires` suffix from the root template.

- [x] **T10** — Update the site defaults: `DEFAULT_DESCRIPTION` and the root
  `title.default` in `buildDefaultMetadata()` now carry a differentiator (they are
  the fallback for any page without its own). · files: `src/app/utils/seo.ts` ·
  check: `seo.test.ts` still green; the fallback title stays ≤ 60 chars.

## Phase C — Structured data

- [x] **T11** — Resolve the seven store coordinates. Follow each
  `maps.app.goo.gl` link in `locationsConfig` to its canonical URL and read the
  lat/lng (fallback: look the street address up on Google Maps by hand). Record
  the seven pairs in this file as a table for the owner to validate. · files:
  `spec/features/014-serp-differentiators/tasks.md` (the table) · check: seven
  pairs, each inside Florida's bounding box (lat 24–31, lng −88 to −80), each
  plausibly matching its street address.

- [x] **T12** — Extend `LocationConfig` with `geo: { latitude: number; longitude:
  number }` and `hours` (Mon–Sat 08:00–18:00, Sun 10:00–16:00 — modelled per
  store even though all seven are identical today), and fill all seven entries
  with the T11 values. Also fix the stale `15,000+ tires in stock` string inside
  the North Miami `description` (`locationsConfig.ts:73`). · files:
  `src/app/(shop)/locations/locationsConfig.ts` · check: `npx tsc --noEmit`; all
  seven entries have `geo` and `hours`.

- [x] **T13** — Rewrite `buildLocationsJsonLd` to take `LocationConfig[]` and emit
  per store: `url` = `/locations/[slug]`, `@id` = that URL + `#store`, plus
  `geo`, `openingHoursSpecification`, `image`, `priceRange`, `areaServed`
  (from `neighborhoods`) and `telephone`. Keep the existing address parsing. ·
  files: `src/app/utils/seo.ts` · check: unit test asserts 7 nodes with 7 distinct
  `url`s and 7 distinct `@id`s — no node points at the site root.

- [x] **T14** — Extend `organizationJsonLd`: add `@id`, `telephone`
  (`+14073644016`), `description`, `slogan`, `foundingDate` (`2007`) and
  `areaServed`. · files: `src/app/utils/seo.ts` · check: unit test on the four new
  fields; the description contains `&` (proving T2/T3 matter).

- [x] **T15** — Clean up `websiteJsonLd`: remove `potentialAction` (Google retired
  the sitelinks search box) and add a `publisher` `@id` link to the Organization. ·
  files: `src/app/utils/seo.ts` · check: unit test asserts the object has **no**
  `potentialAction` property.

- [x] **T16** — Add `buildItemListJsonLd({ url, name, count })` and wire it to all
  five listing pages via `<JsonLd>`, fed the same `totalCount` the page renders. ·
  files: `src/app/utils/seo.ts`, `src/app/(shop)/tires/page.tsx`,
  `src/app/(shop)/tires/used/page.tsx`, `src/app/(shop)/tires/new/page.tsx`,
  `src/app/(shop)/tires/brands/[brand]/page.tsx`,
  `src/app/(shop)/tires/size/[size]/page.tsx` · check: on each of the five, the
  `ItemList` count in the page source equals the number rendered in the strip.

- [x] **T17** — Move the JSON-LD nodes to their correct home: root layout keeps
  **only** Organization + WebSite (remove the seven store nodes); `/locations`
  emits the seven; each `/locations/[slug]` keeps its own one. · files:
  `src/app/layout.tsx`, `src/app/(shop)/locations/page.tsx`,
  `src/app/(shop)/locations/[location]/page.tsx` · check: view source — `/` has 2
  JSON-LD nodes (+ breadcrumbs where applicable), `/locations` has the 7 stores,
  and a location page has its store exactly **once** (it is currently emitted
  twice).

- [x] **T17b** — Route **every remaining** JSON-LD emitter through `<JsonLd>`, so
  the T3 guarantee is universal rather than partial. Nine files, eighteen nodes.
  The eleven already using the child form are a mechanical swap with byte-identical
  output; the two using `dangerouslySetInnerHTML`
  (`locations/[location]`, `services/[service]`) change behaviour — they gain
  `</script>` neutralisation. · files: `src/app/(shop)/guides/[slug]/page.tsx`,
  `src/app/(shop)/services/[service]/page.tsx`,
  `src/app/(shop)/tires/[slug]/page.tsx`, `src/app/(shop)/tires/used/page.tsx`,
  `src/app/(shop)/tires/new/page.tsx`,
  `src/app/(shop)/tires/brands/[brand]/page.tsx`,
  `src/app/(shop)/tires/size/[size]/page.tsx` · check:
  `grep -rn 'application/ld+json' src/` returns hits **only** inside
  `JsonLd.tsx`; diff the rendered source of one guide and one product page
  before/after and confirm the JSON-LD is unchanged.

- [x] **T18** — Extend `seo.test.ts` for everything changed in Phase C: distinct
  store URLs/`@id`s, hours and geo present on all seven, geo inside the Florida
  bounding box, organization phone `+14073644016` and `foundingDate` `2007`, and
  `websiteJsonLd` without `potentialAction`. · files:
  `src/app/utils/seo.test.ts` · check: `npm test` green.

## Phase D — Home page, above the fold

- [x] **T19** — Hoist the `<h1>` out of the client bundle: remove
  `BrandHeadline as="h1"` from `SearchContainer` and render a real server `<h1>`
  in the `Home.tsx` hero naming the product and the market, tires-only (no
  "Complete Auto Care" / "auto repair" wording). · files:
  `src/app/(home)/container/Home/Home.tsx`,
  `src/app/ui/sections/SearchContainer/SearchContainer.tsx` · check: view source
  on `/` (JS disabled) — the `<h1>` is in the raw HTML, there is exactly one, and
  it is **not** inside the `opacity-0` mount transition.

- [x] **T20** — Keep the slogan, demoted: `BrandHeadline` in `SearchContainer`
  becomes `as="h2"`. The component itself is unchanged. · files:
  `src/app/ui/sections/SearchContainer/SearchContainer.tsx` · check: heading
  outline on `/` is h1 → h2 (slogan) → h2 (Our Services) — sequential, no skips;
  `BrandHeadline.test.tsx` still green (its default is still `h1`).

- [x] **T21** — Render `<TrustStrip>` in the home hero between the `<h1>` and the
  search tabs, fed from `brandClaims`. Server-rendered text only — no image, no
  new font, outside the mount transition. · files:
  `src/app/(home)/container/Home/Home.tsx` · check: at 390×844 the warranty,
  inventory and locations claims are readable without scrolling **and** the search
  tabs are still visible (max 2 wrapped lines).

- [x] **T22** — Replace the hand-written strip on `/tires` with `<TrustStrip>`,
  deleting the `'3,600+ tires in stock'` hard-coded fallback. · files:
  `src/app/(shop)/tires/container/SearchResults.tsx` · check: `/tires` renders
  visually identically to before; the fallback string no longer exists in the
  source.

- [x] **T23** — Add the home heading test: exactly one `<h1>`; it matches
  `/tires/i` and `/miami|florida/i`; it does **not** match
  `/complete auto care|auto repair/i` (AC2) nor `/like-new/i` (AC19); an `<h2>`
  carries the slogan. · files:
  `src/app/(home)/container/Home/Home.test.tsx` (new) · check: `npm test` green.

## Phase E — Copy consistency

- [x] **T24** — Repoint every inventory and differentiator string at
  `brandClaims`. Known sites: `Home.tsx:52` (`STATS`), `AboutUs.tsx:9`,
  `guides/page.tsx:120`, `guides/[slug]/page.tsx:195,198`,
  `locations/page.tsx:94`, `services/page.tsx:126`,
  `tires/used/page.tsx:115`, `tires/new/page.tsx:115`,
  `tires/brands/[brand]/page.tsx:121,140`, `tires/size/[size]/page.tsx:136,145`.
  The listing pages switch `"N+ tires in stock"` → `onlineInventoryLabel(n)` (note
  the bogus `+` on an exact count disappears). · files: the eleven listed above ·
  check: `grep -rn "15,000+" src/` returns hits **only** where the phrase is
  qualified with "across our 7 locations".

- [x] **T25** — Fill the `/about-us` founding-year placeholder with 2007 and add
  the family-owned line, both from `brandClaims`. · files:
  `src/app/(shop)/about-us/container/AboutUs/AboutUs.tsx`,
  `src/app/(shop)/about-us/page.tsx` · check: no `[YEAR]` placeholder remains on
  the rendered page.

- [x] **T26** — Add the inventory-consistency guard: scan `src/**/*.{ts,tsx}` for
  `/15,000\+\s*tires in stock/` (the unqualified form) and fail on any hit. Scoped
  to that one pattern to stay non-brittle. · files:
  `src/app/utils/brandClaims.test.ts` (new) · check: `npm test` green now; add the
  offending string to a scratch file once and confirm the guard goes red.

## Phase F — Preview image

- [x] **T27** — Redesign the OG image for thumbnail legibility: dominant brand
  mark, high contrast, at most one short line of text, no small pill row (the
  current 16px pills are what turns into an unreadable dark square in the SERP). ·
  files: `src/app/opengraph-image.tsx` · check: render `/opengraph-image`,
  downscale to 96×96 — the brand mark is still identifiable without reading text.

## Phase G — Verification gates

- [ ] **T28** — **Manual, blocks merge:** record the Search Console baseline for
  the eight commercial entry points — impressions, clicks, average position and
  CTR for the prior 28 days — and save it in the feature folder. Without this
  there is nothing to compare against at 4–6 weeks. · files:
  `spec/features/014-serp-differentiators/gsc-baseline.md` (new) · check: eight
  rows, dated.

- [ ] **T29** — **Manual:** run Google's Rich Results Test on one page per node
  type the site emits, not just the two obvious ones — FR12 says *all* structured
  data validates, and T17b touched every emitter:
  - `/` → Organization (phone, description, slogan, founding date) + WebSite
  - `/locations/[slug]` → local business (address, phone, hours, coordinates)
  - `/tires/used` → ItemList + BreadcrumbList
  - `/tires/[slug]` → Product (the one carrying database strings)
  - `/guides/[slug]` → Article + FAQPage

  **Zero errors** on all five. · check: result summary per page pasted in the PR.

  **Blocked until deploy** — Google's Rich Results Test fetches a public URL and
  cannot reach localhost. It has to run against the preview or production
  deployment.

  _Pre-validated in the meantime:_ a structural check over the production build
  parsed every JSON-LD node on 8 pages covering all 10 node types the site emits
  (Organization, WebSite, AutoPartsStore, BreadcrumbList, ItemList, Product,
  Article, FAQPage, Service, AutoRepair) and asserted Google's documented
  required properties per type, plus `@context` presence, `@id` uniqueness per
  page, breadcrumb item completeness, Product `offers` price/currency, store URLs
  that aren't the site root, and coordinates inside Florida.
  **Result: 0 errors, 0 warnings** — including all *recommended* properties for
  AutoPartsStore, Organization and Product. So the RRT run is a confirmation, not
  a discovery; it can still surface eligibility rules this check doesn't model.

- [x] **T30** — **Manual:** accessibility pass on the new above-the-fold content —
  keyboard reachable, announced as a list by a screen reader, and pill text meets
  WCAG 2.1 AA contrast against the dark hero. · check: documented in the PR.

  _Measured at a 390×844 mobile viewport (Chrome device emulation via CDP):_
  native `<ul>`/`<li>` semantics with **no `role` override**, accessible name
  "Why buy from MrGoma Tires", 3 list items with all 3 decorative markers
  `aria-hidden`, **0 focusable elements** inside (static text — nothing to reach
  or trap). Heading outline `h1 → h2 → h2 → …`, exactly one `h1`, no skipped
  levels. Contrast of the 12px/600 pill text: **5.74:1 against the brightest
  possible video frame** (the `bg-black/60` backdrop composited over pure white)
  and 21:1 against the darkest — AA needs 4.5:1, so it passes on every frame.

- [x] **T31** — **Manual:** owner validates the seven coordinate pairs from T11
  before merge. A wrong pin sends a customer to the wrong store, which is worse
  than emitting no coordinates at all. · check: owner sign-off recorded.

  _Owner sign-off 2026-07-31: coordinates accepted; the Miami Gardens map link
  confirmed correct despite resolving to a differently-titled listing._

- [ ] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
  `npm test` + `npm run build` + `npm run perf:budget` all green; then:
  - Lighthouse on `/` before/after — **no LCP regression** and no new CLS from the
    h1/strip (the hero `poster` preload from `002-lcp-fetchpriority` untouched).
  - Manual check of `/`, `/tires`, `/tires/used`, `/locations` and one location
    page on a real phone.
  - Confirm T28–T31 are all signed off.

  _Automated gates: all five green (321 tests; 157.3 KB shared / 611.5 KB total
  client JS, both under budget)._

  _CWV measured on the production build at 390×844 with 4× CPU throttling and
  ~1.6 Mbps: **CLS 0.0000, zero layout shifts**, and the LCP element is still
  `banner-hero.webp` (the hero video poster preloaded by `002-lcp-fetchpriority`)
  — the new `h1` and trust strip did **not** displace it, which is what AC13
  asks. Absolute LCP under that synthetic throttle is not comparable to the field
  p75 target; the real check is the CrUX data after deploy._

  _Still open: the real-device pass and the two gates below._

## Coordinates to validate (filled in T11, signed off in T31)

Read from each `mapLink`'s canonical Google Maps URL - the `!3d<lat>!4d<lng>`
marker position, not the `@lat,lng` viewport centre. All seven fall inside
Florida's bounding box.

| Store | Address | Latitude | Longitude | Note |
| --- | --- | --- | --- | --- |
| Cutler Bay | 18200 S Dixie Hwy, Miami, FL 33157 | 25.6004443 | -80.3537512 |  |
| Miami Airport | 3251 NW 27th Ave, Miami, FL 33142 | 25.8060487 | -80.2398748 |  |
| Miami Gardens | 20282 NW 2nd Ave, Miami, FL 33169 | 25.9613344 | -80.2062047 | resolves to a "KeyZoo Locksmiths" listing - **owner confirms the link is correct** |
| Coral Gables | 900 South Le Jeune Rd, Miami, FL 33134 | 25.7633216 | -80.2635377 |  |
| Hialeah | 4040 E 10th Ct, Hialeah, FL 33013 | 25.8598175 | -80.2616707 | listing named "MrGoma Tires Automotive - Hialeah" |
| Orlando West Colonial | 4400 W Colonial Dr, Orlando, FL 32808 | 28.5522005 | -81.4342076 | listing named "MrGoma Tires - Orlando Colonial Dr" |
| East Orlando | 575 N Semoran Blvd, Orlando, FL 32807 | 28.5519878 | -81.3103062 |  |

> **Resolved (owner, 2026-07-31):** the Miami Gardens `mapLink` resolves to a
> Google Maps listing titled "KeyZoo Locksmiths". Flagged during T11 because the
> "Get directions" link appears to open another business; the owner confirms the
> link is the correct one for that store. Coordinates accepted as-is.

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC4, AC11, AC19 (foundation) |
| T2, T3 | AC6, AC7, AC20 |
| T4, T5 | AC1, AC14 |
| T6, T7 | AC3, AC3b, AC19 |
| T8 | AC3, AC3b, AC12, AC19 |
| T9 | AC3, AC3b |
| T10 | AC3 |
| T11 | AC16 |
| T12 | AC16, AC11 |
| T13 | AC5, AC6, AC16 |
| T14 | AC7, AC17 |
| T15 | AC9 |
| T16 | AC8 |
| T17 | AC5, AC6, AC7 |
| T17b | AC20, AC6, AC7 |
| T18 | AC5, AC9, AC16, AC17 |
| T19 | AC2, AC19 |
| T20 | AC2 |
| T21 | AC1, AC13 |
| T22 | AC1, AC4 |
| T23 | AC2, AC19 |
| T24 | AC4, AC11 |
| T25 | AC11 |
| T26 | AC11 |
| T27 | AC10 |
| T28 | AC18 |
| T29 | AC6, AC7 |
| T30 | AC14 |
| T31 | AC16 |
| T-DoD | AC13, AC15 |

All twenty acceptance criteria (AC1–AC20, including AC3b) are covered by at least
one task. The five that cannot be automated — AC6, AC7, AC10, AC14, AC18 — are
explicit tasks (T29, T29, T27, T30, T28), not assumptions.

---

_Implementation runs through [`/implement`](../../../.claude/commands). The WHAT lives in
[spec.md](./spec.md); the HOW in [plan.md](./plan.md)._
