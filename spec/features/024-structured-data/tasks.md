# Tasks — Telling Google what these pages are

> Feature: `024-structured-data` · Based on: [plan.md](./plan.md) · Created: 2026-08-18

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**1.029 tests in 82 files, green.**

**Two ordering rules:**

1. **The guard lands last (T6 after T2).** Its central assertion is that nothing
   outside `seo.ts` describes this business, and that is false until **both**
   nodes move — the guide's `Article` and the service pages' `Service`. Writing it first means a red suite through the middle of the
   feature — the same reason `019`, `022` and `023` all landed their guards after
   the call sites.
2. **T5 is about one line, and the task is mostly about what not to touch.**

Groups A, B and C are independent of each other.

---

## A. What the organisation says about itself

- [x] **T1** — `Organization.logo` becomes an `ImageObject` for `/desk-logo.png`
      with `width: 513, height: 512`. Today it is `absUrl('/favicon.png')` — a
      bare string pointing at a **32×32** icon, in the field Google may show
      beside a result and in the knowledge panel.
      · `desk-logo.png` is the logotype — the chevrons plus **MrGoma TIRES** on
      white. `icons/icon-512.png` was the spec's first choice and is the wrong
      one: it is the chevron mark alone, an app icon that names nobody
      (spec Decision 3).
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — `@type` is `ImageObject`, width and height are
      present, **the file exists on disk**, and its shorter side is ≥ 112 px.

- [x] **T2** — Move **both** nodes that are built inside a page into `seo.ts`:
      the guide's `Article` (`buildArticleJsonLd`) and the service pages'
      `Service` (`buildServiceJsonLd`).
      · **Move them; do not patch them in place.** The business is described
      inline in exactly these two files, and it is described there *because* the
      nodes are built outside `seo.ts`. Every node that does come from `seo.ts`
      references the `@id` correctly. Swapping the objects for `@id`s while
      leaving the nodes in the pages satisfies the criterion and preserves the
      condition that caused it.
      · The `Service` node's `provider` is
      `{ '@type': 'AutoRepair', name: 'MrGoma Tires', url: 'https://www.mrgomatires.com' }`
      on **eight pages** — a third description of the business, under a different
      type, with the site URL as a literal. It becomes
      `{ '@id': organizationId() }`, and the hardcoded URL goes with it.
      · Neither node was in the audit's list. Both were found by checking what
      FR2 actually had to cover.
      · `author` and `publisher` both become `{ '@id': organizationId() }`, with
      no inline `logo`.
      · Add `image`: the `/opengraph-image` at 1200×630.
      · **Do not emit `dateModified` at all** (spec Decision 2). All seven guides
      currently claim they were modified the day they were published, and
      `guidesConfig` holds no edit date. A field nobody maintains becomes a lie
      the first time a guide is edited.
      · files: `src/app/utils/seo.ts`, `src/app/(shop)/guides/[slug]/page.tsx`,
      `src/app/(shop)/services/[service]/page.tsx`, `src/app/utils/seo.test.ts`
      · check: `npm test` — the Article's `author` and `publisher` and the
      Service's `provider` are all `@id` references, `image` has dimensions, and
      the `dateModified` key is **absent** rather than equal to `datePublished`.

## B. Five pages that say nothing about themselves

- [x] **T3** — Add `buildPageTypeJsonLd()` and call it, with
      `buildBreadcrumbJsonLd()`, from the five pages that today emit only what the
      root layout gives every page:
      | Page | Type |
      | --- | --- |
      | `/tires` | `CollectionPage` |
      | `/guides` | `CollectionPage` |
      | `/about-us` | `AboutPage` |
      | `/contact` | `ContactPage` |
      | `/locations` | `CollectionPage` |
      · `/locations` already emits its seven store nodes but has no page type and
      no breadcrumb.
      · **No product `ItemList` on `/tires`.** The audit is explicit: doing it
      before block 5's URL consolidation would describe 1.622 pages that are 1.140
      products, multiplying the duplication instead of declaring it.
      · files: `src/app/utils/seo.ts`, and the five `page.tsx` files
      · check: `npm test` — each emits its type, and each breadcrumb's last item
      is that page's own canonical URL.

- [x] **T4** — An `ItemList` of the seven stores on the home page.
      `buildItemListJsonLd()` gains an optional `items` and emits `ListItem`s that
      **reference `/locations/{slug}` URLs and repeat nothing** — the contact
      details already live on each store page, and copying them here would be the
      fifth duplication this audit has produced.
      · The home renders `<LocationsSlider />`, which imports `locationsConfig`;
      the page itself does not, so the import is new there.
      · files: `src/app/utils/seo.ts`,
      `src/app/(home)/container/Home/Home.tsx`, `src/app/utils/seo.test.ts`
      · check: `npm test` — seven `ListItem`s, each `item` a `/locations/{slug}`
      URL, and **no `telephone`, `address` or `geo` anywhere in the node**.

## C. What the stores are

- [x] **T5** — In `buildLocationsJsonLd()`, `'@type': 'AutoPartsStore'` becomes
      `['TireShop', 'AutoRepair']`, for **all seven** (spec Decision 1).
      · **This is the task where the danger is everything you do not change.**
      `geo`, `hasMap`, `openingHoursSpecification`, `areaServed` and `address` in
      that function were verified store by store on 2026-08-04, after a Miami
      Gardens pin was found holding the coordinates of a locksmith in the same
      plaza. A wrong pin sends a customer to the wrong place.
      · The field is `openingHoursSpecification`. Naming it `openingHours` — as
      this feature's plan first did — produces a test that asserts `undefined` and
      passes.
      · All seven alike, not the audit's five/two split: `/services` says the
      eight services run at **7 locations**, and Hialeah's own description says it
      offers "the same full menu … **as all our locations**".
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — the type is right on all seven, **and the five
      verified fields are asserted individually against `locationsConfig`** — not
      "unchanged from before", which no test can express.

## D. Make it impossible to drift

- [x] **T6** — `structuredData.guard.test.ts` (new). **Last, because its main
      assertion is false until T2 lands.**
      · **No file outside `seo.ts` describes this business**, under any of the
      business types: `Organization`, `LocalBusiness`, `Store`, `AutoPartsStore`,
      `AutoRepair`, `TireShop` (AC2). Written over `Organization` alone it would
      pass the `provider: { '@type': 'AutoRepair', … }` that exists on eight
      service pages today — the same business, a different type.
      · **Every `'@type'` string is on the recorded list** (AC10). This is the
      failure mode with no signal: an invalid type gives no build error, no visual
      change, and silent omission by Google. `TireShop` was doubted during
      `/specify` and turned out to be real — the reverse mistake would never have
      announced itself.
      · **The list must include `Brand` and `Service`**, both emitted today and
      both missing from the plan's first draft — a guard shipped without them
      would have been red on arrival, which is the mirror of the mistake it
      prevents. `AutoPartsStore` should **not** be on it: T5 removes its last use.
      · **Every emitter round-trips through `JSON.parse(JSON.stringify(…))`**, and
      no page hand-writes `<script type="application/ld+json">` (AC11).
      · files: `src/app/utils/structuredData.guard.test.ts` (new)
      · check: `npm test`; then **verify each assertion red** — inline an
      organisation in a page, emit a made-up type, and hand-write a script tag,
      one at a time.

## E. Close it out

- [x] **T7** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget`, all green.
      · The budget must not move: every node is server-rendered `<script>`
      content.
      · Also confirm against the built pages that each of the five now emits its
      new node, since a JSON-LD block is invisible on screen and a render test
      cannot tell you Next actually shipped it.

- [ ] **T8** — Manual, **after deploy** (AC13): Google's Rich Results Test on the
      home, a store page, `/tires` and a guide. No errors, and the guide is
      recognised as an article.
      · This is the only check that reports what Google itself makes of the
      markup. Everything before it verifies what we emit, not what is understood.

---

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC1 |
| T2 | AC2, AC6, AC7, AC8 |
| T3 | AC3, AC4 |
| T4 | AC5 |
| T5 | AC9, AC9b |
| T6 | AC2, AC10, AC11 |
| T7 | AC12 |
| T8 | AC13 |

Every criterion in `spec.md` is covered. AC2 appears twice on purpose: once where
the duplication is removed, once where it is made impossible to reintroduce.

---

_Implementation follows in `/implement`._
