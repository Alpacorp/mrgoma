# Spec — Telling Google what these pages are

> Feature: `024-structured-data` · Status: Draft — open clarifications
> Created: 2026-08-18
> Roadmap: Backlog (SEO — Screaming Frog audit, block 4) · Branch: `feat/024-structured-data`

## Why — problem & value

Five of this site's most important pages declare nothing about themselves.

Checked in production on 2026-08-18, listing every `@type` each page emits:

| Page | What it declares |
| --- | --- |
| `/` | `Organization`, `WebSite` |
| `/tires` | `Organization`, `WebSite` |
| `/guides` | `Organization`, `WebSite` |
| `/about-us` | `Organization`, `WebSite` |
| `/contact` | `Organization`, `WebSite` |
| `/locations/hialeah` | `AutoPartsStore`, `BreadcrumbList`, `OpeningHoursSpecification`, … |
| `/guides/used-vs-new-tires` | `Article`, `FAQPage`, `BreadcrumbList`, … |

`Organization` and `WebSite` come from the root layout — every page gets them,
which means **none of those five says anything about itself**. The catalog does
not say it is a catalog. The guides index does not say it is a list of guides.
The home page shows seven stores and declares none of them. Two pages on this
site do this properly — a store page and a guide — so the pattern exists and is
simply not applied.

### What the site does declare, it declares badly

**The organisation's logo is a 32×32 favicon.** `Organization.logo` points at
`/favicon.png`. Google's knowledge panel uses that field, and a 32-pixel square
is not a logo. Real assets exist and are unused: `icons/icon-512.png` at
**512×512**, and the brand's own `logo-mrgoma.webp`.

**Every guide's `publisher` is a second, worse copy of the organisation.** The
Article node inlines a fresh `Organization` with the same favicon as its logo,
rather than pointing at the `@id` the site already publishes:

```json
"publisher": { "@type": "Organization", "name": "MrGoma Tires",
               "logo": { "@type": "ImageObject",
                         "url": ".../favicon.png" } }
```

The site mints a stable `@id` — `…/#organization` — exactly so other nodes can
reference it, and then does not. This is the same shape as every duplication this
audit has turned up: the WhatsApp number in eleven files, the founding year, the
airport in three fields, the guides list copied into the home page.

**Every guide claims it was last modified the day it was published**, and none
declares an image. `dateModified` is set to `datePublished` for all seven.

**The seven stores are typed as `AutoPartsStore`.** They sell tires and fit them;
schema.org has `TireShop` for precisely this. (The audit proposes it and the
proposal was doubted before being checked — `TireShop` is a real `rdfs:Class`,
verified against schema.org.)

### Why it matters, stated honestly

Structured data does not raise rankings. It changes how a result is *rendered* and
how confidently Google resolves the business as an entity — the knowledge panel,
the logo beside a result, whether a guide can show as an article.

That matters more here than it usually would, because of what `021` and `022`
measured: this site earns a **21% CTR on brand queries** and **0,78% at position
1.1** on brand-plus-store queries. Its problem is not being found, it is being
*chosen* on a results page it already ranks on. Telling Google what a page is, and
which business publishes it, is aimed at exactly that.

It is also the cheapest block left. `seo.ts` already has the emitters, the
`JsonLd` component and a stable entity `@id`. Most of this is calling what exists
from pages that do not call it.

## Scope

**In:**

- `Organization.logo`: a real `ImageObject` with dimensions (T010, T012).
- `ItemList` of the seven stores on the home page, referencing their URLs (T015).
- `BreadcrumbList` on `/tires`, `/locations`, `/about-us`, `/guides`, `/contact`
  (T016).
- `CollectionPage` on `/tires` (T017), `ItemList` on `/guides` (T018),
  `AboutPage` (T019), `ContactPage` (T020).
- The guides' `Article` node: reference the organisation by `@id`, add an `image`,
  and tell the truth about `dateModified` (T021).
- The stores' `@type` (T022).

**Out:**

- **T009 — the founding year.** Already corrected to 2006 on 2026-08-18.
- **T011 — `telephone` and `address`.** The audit is explicit: *"NO implementar
  con datos supuestos."* The `Organization` currently pairs an Orlando phone with
  an incomplete Miami address, and only the owner knows Jomah Trading Inc.'s
  registered details.
- **T013 — `sameAs` for Google Business Profile and Yelp.** The URLs must come
  from the accounts, not be guessed.
- **T014 — `SearchAction`. Not applicable, and closing it is the answer.** It
  requires a results URL carrying a free-text query. This site filters
  structurally — `condition`, `brand`, `w`/`s`/`d`, price, `code` — and has no
  free-text parameter at all. The ticket's own instruction is to close it if none
  exists.
- An `ItemList` of products on `/tires`. The audit is explicit that doing this
  before the URL consolidation (block 5) would multiply the duplication rather
  than describe it.
- Any change to the store nodes' `geo`, `hasMap`, `openingHours`, `areaServed` or
  `address`, which were verified store by store on 2026-08-04.

## Functional requirements

- **FR1:** The organisation must declare a logo Google can use — a real image with
  declared dimensions, not a favicon.
- **FR2:** Nothing may inline a second copy of the organisation. Where a node
  needs to name the publisher, it references the `@id` the site already mints.
- **FR3:** Each of the five bare pages must declare what kind of page it is.
- **FR4:** Each of those pages must declare a breadcrumb consistent with its own
  URL and with the trail a visitor sees.
- **FR5:** The home page must declare the seven stores it shows, by reference to
  their pages rather than by repeating their contact details.
- **FR6:** A page must not claim a modification date it does not know. If the site
  does not track when a guide was last edited, it must not assert one.
- **FR7:** Store nodes must use the most specific schema.org type that is true of
  them.
- **FR8:** Every emitted node must be valid JSON-LD and use a real schema.org
  type — checked, not assumed.
- **FR9:** All of it flows through the existing emitters in `seo.ts` and the
  `JsonLd` component. No page hand-writes a `<script type="application/ld+json">`.
- **FR10:** Each requirement is covered by a test that fails if it is undone.

## Acceptance criteria (testable)

- [ ] **AC1:** Given `organizationJsonLd()`, when read, then `logo` is an
      `ImageObject` with a URL, a width and a height, the file exists on disk, and
      it is at least 112 px on its shorter side.
- [ ] **AC2:** Given every JSON-LD node the site emits, when searched for an
      inlined organisation, then only the root `Organization` defines one; every
      other reference is `{ "@id": … }`.
- [ ] **AC3:** Given `/tires`, `/guides`, `/about-us`, `/contact` and `/locations`,
      when each is rendered, then each declares a page type appropriate to it.
- [ ] **AC4:** Given the same five pages, when each is rendered, then each declares
      a `BreadcrumbList` whose last item is that page's own canonical URL.
- [ ] **AC5:** Given the home page, when rendered, then it declares an `ItemList`
      naming all seven stores by their `/locations/{slug}` URLs, and repeats none
      of their contact details.
- [ ] **AC6:** Given every guide, when its `Article` node is read, then `publisher`
      is a reference to the organisation `@id` and carries no inline `logo`.
- [ ] **AC7:** Given every guide, when its `Article` node is read, then it declares
      an `image` with dimensions.
- [ ] **AC8:** Given every guide, when its `Article` node is read, then it declares
      no `dateModified` the site cannot substantiate — see Open question 2.
- [ ] **AC9:** Given each of the seven stores, when its node is read, then its
      `@type` is `TireShop`, and its `geo`, `hasMap`, `openingHours`, `areaServed`
      and `address` are unchanged.
- [ ] **AC10:** Given every `@type` string the site emits, when checked against a
      recorded list of the schema.org types this site uses, then each is on it.
      The list is the point: `TireShop` was doubted and turned out to be real, and
      the reverse mistake — shipping a type that does not exist — is silent.
- [ ] **AC11:** Given every page, when its JSON-LD is parsed, then every block is
      valid JSON. A trailing comma or an unescaped quote makes the whole node
      invisible to Google and changes nothing on screen.
- [ ] **AC12:** Given the full suite, build and performance budget, when run, then
      all are green and the JS budget is unchanged.
- [ ] **AC13 (manual, after deploy):** Google's Rich Results Test on the home, a
      store, `/tires` and a guide reports no errors, and the guide is recognised as
      an article.

## Non-functional / constraints

- **Reuse before creating.** `seo.ts` already holds `organizationJsonLd`,
  `websiteJsonLd`, `buildBreadcrumbJsonLd`, `buildItemListJsonLd`,
  `buildLocationsJsonLd` and `organizationId()`. This feature calls them from
  pages that do not, and adds emitters only where none fits.
- **No invented facts.** Structured data is a set of claims about a real business.
  A wrong claim is worse than a missing one, which is why T011 and T013 are out.
- **The builders stay pure.** `metadata.test.ts` and `seo.test.ts` run with no
  database and no mocks; that must survive.
- **No client JavaScript.** All of it is server-rendered `<script>` content. The
  performance budget must not move.
- **Nothing a visitor sees changes.**

## Open questions

- [NEEDS CLARIFICATION: **Are Hialeah and East Orlando full service centres?**
  T022 proposes `TireShop` for five stores and `["TireShop", "AutoRepair"]` for
  those two. This is the **third** time the audit has singled out the same pair —
  T049 and T052 proposed calling them "MrGoma Tires Automotive" in `022`, and that
  claim was left unadopted for the same reason: nothing in this repository
  distinguishes them, and the name appears nowhere in it. `TireShop` for all seven
  is safe and strictly better than today's `AutoPartsStore`. Recommendation:
  **ship `TireShop` for all seven now**, and add the second type for those two if
  the owner confirms they perform mechanical repair. Confirm.]

- [NEEDS CLARIFICATION: **What should `dateModified` say?** Today every guide
  claims it was modified the day it was published, which is a claim the site
  cannot support — `guidesConfig` has `publishDate` and nothing else. Three
  options: (a) **omit `dateModified`** entirely, which is honest and loses
  nothing, since Google infers freshness by other means; (b) add an
  `updatedDate` field per guide and have someone maintain it; (c) leave it
  equal to `publishDate`, which is what the audit calls a defect.
  Recommendation: **(a) omit it** until there is a real edit date to state. A
  field nobody updates becomes a lie the first time a guide is edited.]

- [NEEDS CLARIFICATION: **Which logo should the organisation declare?** Three
  candidates exist: `icons/icon-512.png` (512×512, square, already part of the
  icon set), `desk-logo.png` (513×512) and `assets/images/Logo/logo-mrgoma.webp`
  (the brand wordmark). Google wants a logo it can show beside a result and
  prefers a clear, square-ish image. Recommendation: **`icons/icon-512.png`**,
  because it is already maintained as an icon and its dimensions are known.
  Confirm, or say if the wordmark is the brand's preferred mark.]

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
