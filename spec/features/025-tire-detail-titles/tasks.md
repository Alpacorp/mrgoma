# Tasks — Titles that fit in a search result

> Feature: `025-tire-detail-titles` · Based on: [plan.md](./plan.md) · Created: 2026-08-19

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**1.045 tests in 83 files, green.**

**Three ordering rules:**

1. **Nothing is introduced before something consumes it.** `022` added `andList`
   one task ahead of its caller and the suite went red on lint, not on logic. So
   `brandName` lands already applied (T1), and `productSocialTitle` lands in the
   same task as the `productMetadata` that calls it (T4).
2. **The guard lands last (T6).** Its assertions describe the finished behaviour;
   writing it first means a knowingly red suite through the middle of the feature
   — the same reason `019`, `022`, `023` and `024` all landed their guards after
   the call sites.
3. **The route is migrated only once the builder it delegates to exists** (T5
   after T4), so the route is never half-converted.

Groups A and B are sequential. T7 is a measurement, not a code change.

---

## A. The builders in `seo.ts`

- [x] **T1** — Add `brandName(brand: string)` — trim, title-case, and a small
      exception map — and **apply it immediately inside the existing
      `productTitle`**, leaving that function's shape otherwise untouched.
      · The catalog holds **75 brands**, and plain `.title()` is right for all but
      one: `BFGOODRICH → BFGoodrich`. The map exists for that and grows only when
      a brand needs it.
      · The trim is not cosmetic. `'BACK COUNTRY '` is **stored with a trailing
      space**, so today's title emits a double space before the model.
      · Introduced applied, not standalone — see ordering rule 1.
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — `BRIDGESTONE → Bridgestone`, `'BACK COUNTRY ' → Back
      Country` with no double space, `BFGOODRICH → BFGoodrich`, and an unknown
      brand degrades to `.title()` rather than throwing.

- [x] **T2** — Rewrite `productTitle()` to return `fitTitle(...)` over the six
      rungs, dropping `Tire in Miami` and `Free Shipping` from the visible title.
      · `fitTitle` already exists at `seo.ts:170` and eight builders use it. This
      is migration onto it, **not a new mechanism** — do not add a second helper.
      · Rung order is the whole point: **the brand suffix goes first, the model
      last.** The suffix is identical on all 1,622 pages; a model is something a
      searcher types.
      · `price` arrives as the string `'-'` for tires with no price
      (`mapTireRecordToSingleTire`). Keep the existing `isFinite` check — `'-'` is
      invisible to TypeScript.
      · The model is passed through **verbatim**. No casing, no truncation.
      · **Normalise whitespace here** — `fitTitle` does not, though
      `fitDescription` does. With `model2` or `size` `undefined`, rung 1 renders
      `Used Toyo  225/40/18 — $120 | MrGoma` with a double space, and the
      hard-trim fallback can end on one.
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — one fixture per rung; every result `≤ TITLE_MAX`; each
      contains the fields it was given; the rung-2 fixture has `$` but no
      ` | MrGoma`; a model containing `A/S 02 RSC RFT` survives unchanged; **no
      result matches `/ {2}/`**, including the no-model and no-size fixtures.

- [x] **T3** — Rewrite `productDescription()` to compose through `fitDescription`,
      with **the price in the head** instead of appended by the caller.
      · Today the route does `${descriptionBase}${priceText}`, which puts the
      price last — where it is cut on **70%** of pages, so it reaches only 31%.
      · Tails come from `brandClaims`: `SHIPPING`, `WARRANTY`,
      `LOCATIONS_LABEL_LONG`. **`WARRANTY` only for used tires** — `WARRANTY_LONG`
      is literally "on Like-New Used Tires", so claiming it for a new tire states
      something the constant does not support.
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — every fixture `≤ DESCRIPTION_MAX`, `indexOf('$') < 160`,
      and the new-tire fixture contains no warranty claim.

- [x] **T4** — Add `productSocialTitle()` (the long form, with price and
      `Free Shipping`) **and** `productMetadata()` in the same task, since the
      latter is what consumes the former.
      · `productMetadata()` is pure — values in, `Metadata` out — matching the
      block's stated rationale: metadata built inside a `generateMetadata` that
      awaits the database cannot be tested without mocking `mssql`. This route is
      the last one still in that state.
      · `title` must be `{ absolute }`. That is the `021` defect this route still
      carries: a plain string lets the root `%s | MrGoma Tires` template append
      the brand a second time.
      · OG and Twitter deliberately **keep the long title** — social cards are not
      cut at 60, and `019`'s WhatsApp preview renders this card.
      · files: `src/app/utils/seo.ts`, `src/app/utils/seo.test.ts`
      · check: `npm test` — `absoluteTitle(meta)` (already throws on a plain
      string) returns the short title; `MrGoma` appears **at most once** in it;
      `openGraph.title` and `twitter.title` both contain the price and
      `Free Shipping`.

## B. The route

- [x] **T5** — `/tires/[slug]` `generateMetadata` delegates to `productMetadata()`.
      · Keep the fetch, the `notFound` branch and the canonical-slug computation.
      Remove the inline title/description/keywords/OG/Twitter block.
      · **Do not touch the JSON-LD path.** It uses `generateTireDescription` from
      `tireDescription.ts` — a different builder — and JSON-LD has no 160-character
      limit, so shortening there would lose detail for no gain.
      · files: `src/app/(shop)/tires/[slug]/page.tsx`
      · check: `npm run build` green, then view source on a built product page —
      `<title>` ≤ 60 chars and contains `MrGoma` at most once; `og:title` still
      contains the price and `Free Shipping`.

- [x] **T6** — Add the budget guard over a fixture table drawn from the **real
      catalog's worst cases**, in the shape of the repo's other `*.guard.test.ts`
      files.
      · Fixtures must include the genuinely longest combinations, e.g.
      `GOODYEAR / EAGLE F1 ASYMMETRIC SUV 4X4 AT J LR XL SOUNDCOMFORT / 235/50/20`
      (a **51-character** model) and `PIRELLI / SCORPION TM ZERO ALL SEASON MOE-S
      ELECT PNCS RFT XL / 275/45/21`, plus a no-price (`'-'`) case and a
      brand-only case.
      · Assert the **ceiling only** on descriptions. The 140 floor that
      `metadata.test.ts` enforces for `021`'s pages does not apply here: those have
      fixed copy, a product description is built from the record, and 15% cannot
      reach 140 without padding that says nothing (spec §Constraints).
      · Assert **no result matches `/ {2}/`** — the whitespace gap `fitTitle`
      leaves and `fitDescription` does not.
      · **Verify it red before accepting it green** — revert `productTitle` to its
      old shape, confirm the failure, restore. A guard that has never failed
      proves nothing (`023` shipped one only after this step).
      · files: `src/app/utils/productMetadata.guard.test.ts` *(new)*
      · check: `npm test` — green on the branch, and demonstrably red against the
      pre-T2 builder.

## C. Measurement and close

- [x] **T7** — Recompute the two uniqueness numbers over the 1,400-unit sample and
      write **both** into `results.md`.
      · Whole-string uniqueness **falls** (929 → ~905); visible-opening uniqueness
      **rises** (707 → ~905). Both go in the record, with which one describes a
      searcher's experience — otherwise a later Screaming Frog run reads the first
      column and calls this a regression.
      · The sample is a working file and is **not committed**.
      · files: `spec/features/025-tire-detail-titles/results.md` *(new)*
      · check: both figures present, and the AC8 comparison stated as a
      measurement rather than a passing test.

- [x] **T8** — Definition of Done: `npx tsc --noEmit` + `npm run lint` + `npm test`
      + `npm run build` + `npm run perf:budget` all green.
      · `perf:budget` must **not move** — `seo.ts` is server-only and this route
      was already server-rendered. A change there means something reached the
      client bundle and needs explaining, not accepting.
      · Format with `npx prettier --write` on the touched files only.
      **`npm run format` rewrites the whole repo**; `promoBanner.ts` and
      `whatsapp.test.ts` carry pre-existing drift and must not be swept in.
      · Manual check on a real product page (see `results.md`).

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC5 |
| T2 | AC1, AC2, AC3, AC6, AC10 |
| T3 | AC7 |
| T4 | AC4, AC9 |
| T5 | AC4 (rendered), AC9 (rendered) |
| T6 | AC1, AC2, AC3, AC10 (guarded) |
| T7 | AC8 |
| T8 | — (Definition of Done) |

Every acceptance criterion AC1–AC10 is covered. AC8 is deliberately verified by
measurement in T7 rather than by an assertion in the suite: it depends on the
catalog's contents, not on the code, and a test over live data would fail for
reasons that are not defects.

---

_Run `/analyze` next. Do not implement before it is clean._
