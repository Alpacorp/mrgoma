# Tasks — One way to describe a page

> Feature: `021-page-metadata-og` · Based on: [plan.md](./plan.md) · Created: 2026-08-18

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**650 tests in 75 files, green.**

**Two ordering rules, both learned the hard way:**

1. **The guards land last (T10).** AC14's guard fails for every page not yet
   migrated, and AC11b's fails while `/instant-quote` is still `noindex`. Writing
   them before B and C is complete means a red suite for the whole middle of the
   feature — exactly what happened with the WhatsApp guard in `019`, where it was
   correct to land it after the call sites.
2. **A copy change and the test that pins it are one task.** `metadata.test.ts`
   has `'matches the approved copy exactly'`, which pins the home title with a
   note saying it should change in the spec first. It has changed in the spec;
   the assertion and the builder move together (T7), never in separate steps.

Group A unblocks everything. B, C and D are independent of each other.

---

## A. Finish the helper

- [ ] **T1** — Give `pageMetadata()` the two fields it never emitted: an
      `images` entry (`/opengraph-image`, 1200×630, with alt text) and
      `locale: 'en_US'`, plus an optional `image?: { url; alt }` override for
      callers that have their own. This single edit gives **~400 pages** an
      `og:image` they have never had — every brand, size, store and catalog page —
      because they were already asking through this function.
      · files: `src/app/utils/seo.ts`, `src/app/utils/metadata.test.ts`
      · check: `npm test` — every entry in `ENTRY_POINTS` declares an image with
      width, height and alt, and `locale === 'en_US'`; the existing
      title/description/canonical assertions stay green untouched.

## B. Move the fifteen pages onto builders

Each task deletes an inline `Metadata` object and replaces it with a
`pageMetadata()` call in `seo.ts`. That is what removes the doubled brand:
`pageMetadata` sets `title: { absolute }`, so the root `%s | MrGoma Tires`
template stops appending a second copy.

- [ ] **T2** — `/services` and the 8 service pages. Add `servicesMetadata()` and
      `serviceMetadata()`; strip the trailing ` | MrGoma Tires` from every
      `metaTitle` in `servicesConfig` so `TITLE_SUFFIX` supplies it once.
      · **`/services/wheel-alignment` needs a `fitTitle` ladder, not a string.**
      Keeping both cities and the rig overflows at 64 characters; the fallback
      drops **Orlando**, never `Hunter HawkEye Elite®`. That ordering is AC5 —
      the differentiator is the reason the page exists.
      · files: `src/app/utils/seo.ts`, `src/app/(shop)/services/page.tsx`,
      `src/app/(shop)/services/[service]/page.tsx`,
      `src/app/(shop)/services/servicesConfig.ts`
      · check: `npm test` — the nine titles contain `MrGoma` at most once, all fit
      `TITLE_MAX`, the eight service titles are pairwise distinct, and the
      wheel-alignment one still contains `Hunter HawkEye Elite®`.

- [ ] **T3** — `/about-us` and `/contact`. Add `aboutMetadata()` and
      `contactMetadata()` with the audit's copy.
      · **`/about-us` lands at exactly 60 characters.** `TITLE_MAX` is inclusive
      so it passes, but it has zero headroom — leave a comment at the call site,
      because the next word anyone adds there fails AC4 and the failure will not
      be obvious from the diff.
      · files: `src/app/utils/seo.ts`, `src/app/(shop)/about-us/page.tsx`,
      `src/app/(shop)/contact/page.tsx`
      · check: `npm test` — both fit, brand once, `og:url` equals canonical.

- [ ] **T4** — `/guides` and the 7 guide pages. Add `guidesMetadata()` and
      `guideMetadata()`; take the audit's new titles and descriptions for the four
      it covers (`used-vs-new-tires`, `how-to-buy-used-tires`,
      `how-to-read-tire-size`, `used-tire-safety-checklist`).
      · The other three keep their wording; they only need to fit once
      `TITLE_SUFFIX` is appended — all three do (52–59).
      · **The audit's "current" titles for three of these four do not match
      production** (spec Decision 3). Do not use its "ACTUAL" column to verify
      anything; compare against what the site serves.
      · files: `src/app/utils/seo.ts`, `src/app/(shop)/guides/page.tsx`,
      `src/app/(shop)/guides/[slug]/page.tsx`,
      `src/app/(shop)/guides/guidesConfig.ts`
      · check: `npm test` — all 8 fit `TITLE_MAX`, brand once, descriptions inside
      the `DESCRIPTION_MIN`–`DESCRIPTION_MAX` window.

- [ ] **T5** — `/legal-policies`. Add `legalPoliciesMetadata()`; its title
      currently prints the brand twice (`… – MrGoma Tires | MrGoma Tires`).
      · files: `src/app/utils/seo.ts`, `src/app/(shop)/legal-policies/page.tsx`
      · check: `npm test` — brand once, fits, canonical unchanged.

- [ ] **T6** — The two conversion pages. `/checkout` gains
      `checkoutMetadata()` — its own canonical, **still `noindex`, still
      disallowed in `robots.txt`**. `/instant-quote` gains
      `instantQuoteMetadata()` and **loses its `noindex`**.
      · That removal reverses a deliberate decision from commit `b754578`
      ("SEO phase 1"), which marked this page alongside `/dashboard` as a funnel
      step. The owner chose otherwise with the conflict in front of them
      (spec Decision 2). It is one line to put back if it underperforms.
      · files: `src/app/utils/seo.ts`, `src/app/(shop)/checkout/page.tsx`,
      `src/app/(shop)/instant-quote/page.tsx`
      · check: `npm test` — `/checkout` canonical is `/checkout` and
      `robots.index` is still `false`; `/instant-quote` canonical is its own URL,
      title is not the root default, and it no longer declares `noindex`.

## C. The copy the audit proposed for pages that already had builders

- [ ] **T7** — New copy for `/`, `/tires` and `/tires/used`, **and the test that
      pins it, in this same task.**
      · Home becomes `Used & New Tires Miami & Orlando — 30-Day Warranty | MrGoma`
      (59) — the synthesis from spec Decision 1. It adds Orlando, which was T035's
      entire justification, and **keeps the 30-Day Warranty that `014` was built
      to put there** and that T035 would have dropped.
      · `/tires` takes `Shop Tires by Size & Brand — Used & New` and a description
      naming search **by size and by brand**. **No hardcoded stock figure**
      (FR9): T061 proposes "4,000+", the live count is ~4,274 and drifting, and
      `014` exists partly because the home once claimed a number the catalog
      contradicted.
      · files: `src/app/utils/seo.ts`, `src/app/utils/metadata.test.ts`
      · check: `npm test` — the amended exact-match test passes; `/tires`' title
      differs from the home's by more than one word; its description contains
      "size" and "brand".

## D. Give the stores their own preview card

- [ ] **T8** — `locationMetadata()` passes the store's photo through T1's override
      so each store shares with its own storefront instead of the site default.
      The data already exists: all seven have `image:` in `locationsConfig`.
      · files: `src/app/utils/seo.ts`,
      `src/app/(shop)/locations/[location]/page.tsx`, `src/app/utils/seo.test.ts`
      · check: `npm test` — each of the seven produces `og:image` equal to
      `absUrl(store.image)`, **and the file exists on disk**. A bad path must fail
      the build rather than ship a broken card.

## E. Make the page findable, and stop the drift

- [ ] **T9** — One entry in the footer's `defaultSections`, "Customer Service"
      column: `{ label: 'Instant Quote', href: '/instant-quote' }`. No markup, no
      component, no styling — `FooterSection` already renders and styles these.
      Without it the new metadata cannot earn anything: nothing in `src/` links to
      that page today.
      · files: `src/app/ui/sections/Footer/Footer.tsx`,
      `src/app/ui/sections/Footer/Footer.test.tsx` (new — none exists)
      · check: `npm test` — a link with href `/instant-quote` renders, is
      keyboard reachable and shows a visible focus ring.

- [ ] **T10** — The three guards. **Last, because two of them are red until B and
      C are done.**
      · `pageMetadata.guard.test.ts` (new): walks `src/app/**/page.tsx` and fails
      on any `title:` in a metadata export that is neither `{ absolute }` nor a
      builder call — `not-found` and error pages exempted (AC14).
      · The sitemap must never publish a `noindex` URL: for every static path in
      `sitemap.ts`, the corresponding builder's `robots.index` is not `false`
      (AC11b). This is the contradiction Search Console reports today.
      · For every static sitemap path, the builder's canonical equals
      `absUrl(path)` (AC13) — we must never ask Google to index a page that names
      something else as itself.
      · files: `src/app/utils/pageMetadata.guard.test.ts` (new)
      · check: `npm test`; and **verify each guard negatively** — reintroduce a
      plain `title:` string, a `noindex`, and a wrong canonical in turn, and
      confirm each turns red and names the file. A guard only ever seen passing
      proves nothing.

## F. Close it out

- [ ] **T11** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget`, all green.
      · check: the budget must read **166.0 KB / 617.2 KB**, unchanged from `020`.
      The footer link is a plain anchor and nothing else here reaches the browser.

- [ ] **T12** — Manual, **before merge**: Search Console export of the affected
      pages — queries, clicks, impressions, average position — captured while the
      old titles are still live (AC18). Fifteen titles change in one deploy; after
      it, the "before" cannot be reconstructed. `020` showed this is worth doing:
      the baseline there changed what we expected the work to achieve.

- [ ] **T13** — Manual, **after deploy** (AC19): share a store, a brand page and a
      size page into a real WhatsApp chat and confirm a preview card renders, with
      the store showing **its own photo**. Use URLs not shared before — WhatsApp
      caches previews by URL, and a link fetched earlier will still arrive
      card-less.

---

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC1 |
| T2 | AC2, AC3, AC4, AC5, AC6 |
| T3 | AC2, AC3, AC4 |
| T4 | AC2, AC3, AC4 |
| T5 | AC2, AC3, AC4 |
| T6 | AC2, AC10, AC11 |
| T7 | AC4, AC7, AC8, AC9 |
| T8 | AC15 |
| T9 | AC12 |
| T10 | AC11b, AC13, AC14 |
| T11 | AC16, AC17 |
| T12 | AC18 |
| T13 | AC19 |

Every criterion in `spec.md` is covered. AC2, AC3 and AC4 appear against four
tasks because they are properties of the whole set — each migration must keep them
true, and the final assertion in T10 checks them across every page at once rather
than page by page.

---

_Implementation follows in `/implement`._
