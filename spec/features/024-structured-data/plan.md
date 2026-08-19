# Plan — Telling Google what these pages are

> Feature: `024-structured-data` · Based on: [spec.md](./spec.md) · Created: 2026-08-18

## Technical approach

`seo.ts` already emits every kind of node this feature needs, `JsonLd` already
renders them safely, and `organizationId()` already exists so nothing has to
repeat the organisation. The work is to **call what exists from the pages that do
not call it**, and to move the one node that was built outside `seo.ts` into it.

That last point is the whole story of AC2. `organizationId()` is used correctly in
three places — the Organization's own `@id`, the store nodes' `parentOrganization`
and `websiteJsonLd`'s `publisher` — and the business is described inline in
exactly **two files**, both of which build their nodes inside the page instead of
through an emitter:

```tsx
// guides/[slug]/page.tsx — the Article
author:    { '@type': 'Organization', name: 'MrGoma Tires' },
publisher: { '@type': 'Organization', name: 'MrGoma Tires',
             logo: { '@type': 'ImageObject', url: canonical('/favicon.png') } },

// services/[service]/page.tsx — the Service, on eight pages
provider:  { '@type': 'AutoRepair', name: 'MrGoma Tires',
             url: 'https://www.mrgomatires.com' },   // literal, not absUrl()
```

**The duplication exists exactly where the rule was bypassed, in both cases**,
which makes FR9 the mechanism rather than a style preference. The second one also
shows why AC2 cannot be written over `Organization` alone: this is the same
business under a different type, and a narrower rule would pass it.

It also means `AutoRepair` is **already** declared for this business, so typing
the stores with it states nothing new.

Four changes, then:

1. **Correct what the organisation says about itself** — a real logo (FR1).
2. **Move the Article into `seo.ts`** and reference the organisation (FR2, FR9).
3. **Give five bare pages a type and a breadcrumb**, and the home its stores
   (FR3, FR4, FR5).
4. **Retype the stores** (FR7).

Two nodes move, then: the `Article` and the `Service`.

## Reuse first

| Existing thing | Used for | Instead of |
| --- | --- | --- |
| `organizationId()` | FR2 | Inlining the organisation a third and fourth time |
| `buildBreadcrumbJsonLd()` | FR4 | A second breadcrumb builder |
| `buildItemListJsonLd()` | FR5 | A new list emitter — it gains an optional `items` |
| `buildLocationsJsonLd()` | FR7 | Touching the store nodes' verified geo/hours/address |
| `JsonLd` | FR9 | `dangerouslySetInnerHTML`, which its doc comment explains is the unsafe option here |
| `locationsConfig`, `guidesConfig` | FR5, AC5 | Repeating store or guide facts in a schema block |
| `absUrl()` | every URL | Hand-built absolute URLs |
| `seo.test.ts` | most ACs | A new test file per node type |

## Files to add / change

**`src/app/utils/seo.ts`** — the centre of it.

- `organizationJsonLd()`: `logo` becomes an `ImageObject` pointing at
  `/desk-logo.png` with `width: 513, height: 512`. Today it is
  `absUrl('/favicon.png')` — a bare string, and a 32-pixel square.
- `buildLocationsJsonLd()`: `'@type': 'AutoPartsStore'` becomes
  `['TireShop', 'AutoRepair']`. **Nothing else in that function is touched** —
  `geo`, `hasMap`, `openingHoursSpecification`, `areaServed` and `address` were
  verified store by store on 2026-08-04. (The field is
  `openingHoursSpecification`, not `openingHours`; this plan named it wrongly at
  first, which is the kind of slip that produces a test asserting `undefined`.)
- `buildItemListJsonLd()`: gains an optional `items: { name; url }[]`, emitted as
  `itemListElement` of `ListItem` nodes that **reference URLs and repeat nothing**.
- **New** `buildServiceJsonLd()`: the service page's Service node, moved out of
  the page, with `provider: { '@id': organizationId() }`.
- **New** `buildArticleJsonLd()`: the guide's Article, moved out of the page.
  `author` and `publisher` become `{ '@id': organizationId() }`; an `image` is
  added; **`dateModified` is not emitted** (spec Decision 2).
- **New** `buildPageTypeJsonLd()`: a small emitter for `CollectionPage`,
  `AboutPage` and `ContactPage`, each with its `@id`, `url`, `name` and a
  `isPartOf` reference to the website node.

**Pages that gain a `<JsonLd>`** — `/tires`, `/guides`, `/about-us`, `/contact`,
and `/locations` (which already emits its store nodes but has no page type and no
breadcrumb). Each gets its page type plus a `BreadcrumbList`.

**`src/app/(home)/container/Home/Home.tsx`** — an `ItemList` of the seven stores,
by URL. The page renders `<LocationsSlider />`, which imports `locationsConfig`;
the page itself does not, so that import is new here.

**`src/app/(shop)/guides/[slug]/page.tsx`** — the inline Article object is deleted
and replaced by the emitter call.

**`src/app/(shop)/services/[service]/page.tsx`** — likewise for the `Service`
node, whose `provider` becomes `{ '@id': organizationId() }`. Its hardcoded
`https://www.mrgomatires.com` disappears with it; every other URL on the site
comes from `absUrl()`.

**Tests** — `seo.test.ts` extended; new
`src/app/utils/structuredData.guard.test.ts` for AC2, AC10 and AC11.

## The type list, and why AC10 exists

`TireShop` was doubted during `/specify` and turned out to be a real
`rdfs:Class`. The reverse mistake — shipping a type that does not exist — produces
**no error anywhere**: the build passes, the page renders, and Google silently
ignores the node.

So the guard holds a recorded list of every schema.org type this site emits, and
fails on anything outside it. The list is the artefact; adding to it is a
deliberate act that makes someone check the type first.

```
Organization · WebSite · ImageObject · PostalAddress · GeoCoordinates
OpeningHoursSpecification · Place · City · State
TireShop · AutoRepair
BreadcrumbList · ListItem · ItemList
CollectionPage · AboutPage · ContactPage
Article · FAQPage · Question · Answer
Product · Offer · Brand · Service
```

**`Brand` and `Service` were missing from the first draft of this list**, and both
are emitted today — the Product node's `brand`, and the service pages. A guard
shipped with the shorter list would have been red on arrival, which is the mirror
image of the mistake it exists to prevent. `AutoPartsStore` is deliberately absent:
T5 removes the last use of it.

## Data & flow

No database, no API, no client state. Every value comes from `locationsConfig`,
`guidesConfig` or `brandClaims`, all static TypeScript. The builders stay pure, so
`seo.test.ts` keeps running with no `mssql` and no mocks.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `logo` becomes an `ImageObject` for `desk-logo.png` | `seo.test.ts`: `logo['@type'] === 'ImageObject'`, width and height present, **the file exists on disk**, shorter side ≥ 112 px |
| AC2 | Both inline descriptions — the guide's Article and the service pages' `provider` — become `{ '@id': … }` | `structuredData.guard.test.ts`: outside `seo.ts`, no node carries a **business type** — `Organization`, `LocalBusiness`, `Store`, `AutoPartsStore`, `AutoRepair`, `TireShop`. Written over `Organization` alone it would pass the `AutoRepair` provider that exists today |
| AC3 | `buildPageTypeJsonLd()` called from five pages | Render/emitter tests: each of the five produces its expected `@type` |
| AC4 | `buildBreadcrumbJsonLd()` called from the same five | Same tests: the last `ListItem`'s `item` equals that page's canonical |
| AC5 | `buildItemListJsonLd({ items })` on the home | `seo.test.ts`: seven `ListItem`s, each `item` a `/locations/{slug}` URL, and **no `telephone`, `address` or `geo` anywhere in the node** |
| AC6 | `author` and `publisher` become `@id` references | `seo.test.ts` on `buildArticleJsonLd`: both are `{ '@id': organizationId() }`, and neither carries a `logo` |
| AC7 | `image` added, 1200×630 | Same test: `image` is an `ImageObject` with dimensions |
| AC8 | `dateModified` simply not emitted | Same test: the key is **absent**, not equal to `datePublished` |
| AC9 | `buildLocationsJsonLd` retyped | `seo.test.ts`: all seven are `['TireShop', 'AutoRepair']`, and `geo`, `hasMap`, `openingHoursSpecification`, `areaServed` and `address` are asserted **against `locationsConfig`**, field by field. Not "unchanged from before", which no test can express |
| AC9b | — | `seo.test.ts`: the store type is justified by `/services`' claim; the test reads `servicesConfig.length === 8` and `locationsConfig.length === 7` and names the coupling, so narrowing either sends someone back to the type |
| AC10 | The recorded type list | `structuredData.guard.test.ts`: every `'@type'` string literal under `src/app` is on the list |
| AC11 | Every node built as an object and serialised by `JsonLd` | `structuredData.guard.test.ts`: `JSON.parse(JSON.stringify(node))` round-trips for every emitter, and no page hand-writes `<script type="application/ld+json">` |
| AC12 | No client code | tsc + lint + test + build + `perf:budget`, expected unchanged |
| AC13 | — | Manual, after deploy: Rich Results Test on the home, a store, `/tires` and a guide |

## Tradeoffs / alternatives

**Adding an `ItemList` of products to `/tires`.** Rejected, and the audit says so
itself: doing it before the URL consolidation of block 5 would describe 1.622
product pages that are really 1.140 products, multiplying the duplication rather
than declaring it. `CollectionPage` alone says what the page is without listing
what is on it.

**Keeping the Article inline and just swapping the two objects for `@id`s.**
Rejected. It would satisfy AC2 today and leave the node outside `seo.ts`, which is
the condition that produced the duplication in the first place. Every other node
on this site is already emitted from there and none of them drifted.

**Emitting `dateModified` from `publishDate`.** Rejected — spec Decision 2. A
claim the site cannot substantiate is worse than a missing one.

**A `sameAs` block with guessed profile URLs.** Rejected — T013 stays out. Naming
the wrong Google Business Profile would tie the brand entity to another business.

**Declaring `AutoRepair` for two stores only.** Rejected — spec Decision 1, on the
site's own copy.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Retyping the stores disturbs the verified `geo` / `hours` / `address` | **This is the one that matters** | AC9 asserts those five fields field by field, not just the type. They were verified store by store on 2026-08-04, including a Miami Gardens pin that pointed at a locksmith |
| A node ships with an invalid type and nothing reports it | Medium | AC10's recorded list. This is the failure mode with no signal — no build error, no visual change, Google just ignores the node |
| `AutoRepair` overstates what some stores do | Low–Medium | It is what `/services` claims for all seven, and AC9b ties the two together so narrowing one flags the other. One field to revert |
| A JSON-LD block breaks silently on an unescaped character | Low | `JsonLd` passes the payload as a text child, which its doc comment explains is the safer path and `JsonLd.test.tsx` already pins. AC11 re-checks per emitter |
| The five new page types conflict with something Google already infers | Low | They are additive nodes with their own `@id`; nothing existing is removed. AC13 checks with the Rich Results Test |

## Out of scope

- T011 (`telephone`, `address`) and T013 (`sameAs`) — blocked on the owner.
- T014 (`SearchAction`) — closed as not applicable; there is no free-text query
  parameter on this site.
- Product `ItemList` on `/tires` — waits for block 5.
- The tire detail titles, and Google Business Profile (`017`).

---

_The concrete steps live in [tasks.md](./tasks.md)._
