# Tasks — Seven stores that read like one

> Feature: `022-store-pages` · Based on: [plan.md](./plan.md) · Created: 2026-08-18

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**927 tests in 77 files, green.**

**Three ordering rules:**

1. **T2 comes before the copy changes.** `metadata.test.ts` builds its location
   entries from **four stores written by hand** with `slug: 'x'`, not from
   `locationsConfig`. Until that is fixed, "all seven titles are distinct" and
   "each description names its own street" are assertions about four stores
   pretending to be seven. Fixing the table first is what makes T3 and T4
   verifiable.
2. **The guard lands after the config fix (T7 after T5).** It fails while East
   Orlando still names the wrong airport — the same reason `019`'s WhatsApp guard
   landed after its call sites.
3. **T6 must not reach for `<br />`.** The trap is spelled out in the task.

Groups B and C are independent of A and of each other.

---

## A. Make the builder say something specific

- [ ] **T1** — Two pure derivations, no config and no builder changes yet:
      `storeStreet(address)` strips the house number from the first
      comma-separated part (`18200 S Dixie Hwy, Miami, FL 33157` → `S Dixie Hwy`),
      and `storeServes(name, neighborhoods)` drops the store's own name and every
      entry beginning `Near `.
      · The `Near ` filter is not tidiness: *"Serving Allapattah, Midtown Miami
      and Near Miami International Airport"* is not English. Dropping the store's
      own name matters too — "Cutler Bay serves Cutler Bay" spends characters
      saying nothing.
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — driven from `locationsConfig` itself, so every real
      address yields a street and every real store yields at least two served
      areas. Not from hand-written examples.

- [ ] **T2** — Drive the location entries in `metadata.test.ts` from
      `locationsConfig` instead of the four hand-written stores with `slug: 'x'`.
      **No production code changes in this task** — it only widens what is
      already asserted from four stores to seven.
      · files: `src/app/utils/metadata.test.ts`
      · check: `npm test` still green with seven stores under the *current*
      builder. If it goes red here, that is a defect this table was hiding.

- [ ] **T3** — The new title: `Used & New Tires in {name}, FL` + `TITLE_SUFFIX`,
      through `fitTitle`. Replaces `{name} Tire Shop — 30-Day Warranty`.
      · Computed: 40–54 characters, all seven inside `TITLE_MAX`.
      · **Do not adopt the audit's second variant.** T049 and T052 propose
      `Tires & Auto Service` for Hialeah and East Orlando, with H1s naming
      **"MrGoma Tires Automotive"** — a string that appears **nowhere in this
      repository**, presumably those stores' Business Profile names. It may be
      right; putting a possibly-wrong business name on two pages is not something
      to ship unverified. One phrasing for all seven; the question goes to the
      owner (plan, *Tradeoffs*).
      · files: `src/app/utils/seo.ts`, `src/app/utils/metadata.test.ts`
      · check: `npm test` — each of the seven contains `Tires` and `FL`, fits
      `TITLE_MAX`, and all seven are distinct.

- [ ] **T4** — The new description. `locationMetadata()` takes `address` and
      `neighborhoods`, and feeds `fitDescription` with
      `Used and new tires on {street}, every used tire with a 30-day warranty.` +
      a `Serving …` tail. The caller already holds both fields.
      · Computed: 145–157 characters for all seven.
      · **AC4 is the assertion that matters**: substituting store A's name, city
      and street into A's description must never produce B's. Today's copy fails
      that test — which is the point of writing it.
      · files: `src/app/utils/seo.ts`,
      `src/app/(shop)/locations/[location]/page.tsx`,
      `src/app/utils/metadata.test.ts`
      · check: `npm test` — each description contains that store's derived street
      and at least one of its own `neighborhoods`, sits inside the description
      window, and survives the substitution test above.

## B. Stop sending people to the wrong airport

- [ ] **T5** — East Orlando is at 575 N Semoran Blvd, beside Orlando **Executive**
      Airport. Two edits, because the error is in two places:
      `neighborhoods` (`Near Orlando International Airport` → `Near Orlando
      Executive Airport`) and the visible `description`, which is reworded to lead
      with **Semoran Blvd** and name Executive behind it (spec Decision 2).
      · This is a correctness fix, not an SEO one. Someone searching for tires
      near MCO who drives here has made a 20 km wasted trip.
      · files: `src/app/(shop)/locations/locationsConfig.ts`
      · check: `npm run dev` — `/locations/east-orlando` names Executive and no
      longer names International, in the hero copy and in the areas-served list.

## C. Give the heading something to say

- [ ] **T6** — The two-line `<h1>`: `MrGoma Tires {name}` large, `Used & New
      Tires` as a smaller second line **inside the same heading**. Remove the now
      redundant `h1` field from `locationsConfig` — it equals `name` in all seven
      and is read in one place, and a second name per store is what FR7 exists to
      prevent.
      · **Do not use `<br />`.** `ServiceDetail` builds its two-line heading that
      way and that is exactly the block-3 defect: `<br />` is a line break, not
      whitespace, so the text content reads `Wheel AlignmentMiami & Orlando, FL`.
      Copying it here would add seven more instances of the bug we are going to
      fix next. Use `className="block"` on the span and a real `{' '}` before it —
      CSS breaks the line, the text keeps its space.
      · **The wrapper's classes do not change.** `text-4xl sm:text-5xl
      lg:text-6xl font-black …` stays exactly as it is; only the contents differ.
      That is what AC10 checks, and it is the whole basis for proceeding without
      `modern-web-guidance` (spec Decision 3).
      · files:
      `src/app/(shop)/locations/[location]/container/LocationDetail/LocationDetail.tsx`,
      `src/app/(shop)/locations/locationsConfig.ts`,
      `src/app/(shop)/locations/[location]/container/LocationDetail/LocationDetail.test.tsx` (new)
      · check: `npm test` — exactly one level-1 heading; its text contains the
      brand, `Tires`, and **a space between the store name and the product line**;
      the wrapper still carries the four size classes.

## D. Make the facts checkable

- [ ] **T7** — `storeFacts.guard.test.ts` (new). **Last in this group, because it
      is red until T5 lands.**
      · No file pairs `east-orlando` with `Orlando International` (AC7).
      · No store claims a landmark its own `city` contradicts — an Orlando store
      may not name a Miami airport, or the reverse (AC8).
      · Every store yields a derivable street and at least two served areas after
      filtering, so an eighth store added without an address or neighbourhoods
      fails the build instead of shipping a generic description (AC9).
      · files: `src/app/(shop)/locations/storeFacts.guard.test.ts` (new)
      · check: `npm test`; and **verify each assertion red** — put the wrong
      airport back, give a store a landmark from the other city, and blank an
      address, one at a time. A guard only ever seen passing proves nothing.

## E. Close it out

- [ ] **T8** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget`, all green.
      · check: the budget should not move — this feature is config, a pure
      builder and heading text. Report it if it does rather than rounding.

- [ ] **T9** — Manual, and the one thing here that genuinely needs eyes: **the
      longer `<h1>` at 360 px** on a store page. Two lines, the second smaller,
      nothing overflowing, hero image still readable behind it. Also tab to it and
      confirm the heading did not become focusable or lose its landmark.
      · Orlando West Colonial is the longest name — check that one.

- [ ] **T10** — Manual, **before merge** (AC12): Search Console export for the
      seven store pages and their queries, while the old copy is live. Filter by
      page, one row per store, plus the query list for the two with most
      impressions (`cutler-bay`, `miami-gardens`).

- [ ] **T11** — Manual, **after deploy** (AC13): URL Inspection on
      `/locations/orlando-west-colonial`. It has zero impressions today; if it
      reports "Crawled — currently not indexed" or a duplicate-canonical state,
      the seven identical descriptions were plausibly the cause and this is where
      it changes.

- [ ] **T12** — Manual, **at 28 days** (AC14): impressions and CTR for the seven.
      **A flat result is a finding, not a failure** — it says the clicks are going
      to the Business Profile and that `017` is where the next effort belongs.
      Compare impressions and CTR, not clicks.

---

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC3, AC9 (derivations) |
| T2 | AC1, AC2, AC3, AC4 (makes them cover seven) |
| T3 | AC1, AC2 |
| T4 | AC3, AC4 |
| T5 | AC7 |
| T6 | AC5, AC6, AC10 |
| T7 | AC7, AC8, AC9 |
| T8 | AC11 |
| T9 | AC10 (visual half) |
| T10 | AC12 |
| T11 | AC13 |
| T12 | AC14 |

Every criterion in `spec.md` is covered. AC3, AC4, AC7, AC9 and AC10 appear twice
on purpose: once where the behaviour is built, once where it is locked down — and
in AC10's case, once as an assertion about class names and once as a human looking
at a phone, because no test can tell you a heading looks wrong.

---

_Implementation follows in `/implement`._
