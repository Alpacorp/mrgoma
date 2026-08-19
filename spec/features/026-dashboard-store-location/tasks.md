# Tasks — One word, one meaning: Store and Location in the dashboard

> Feature: `026-dashboard-store-location` · Based on: [plan.md](./plan.md) · Created: 2026-08-19

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**1.120 tests in 84 files, green** (`main` at `7324e73`, which already includes
`025`).

**Three ordering rules:**

1. **Nothing is introduced before something consumes it.** `022` added a helper
   one task ahead of its caller and the suite went red on lint, not on logic. So
   the repository function and its route land together (T4).
2. **The guard lands at T2, not last** — unusually. The convention in `019`–`025`
   was to defer it because the behaviour it asserts spanned several tasks; here
   T1 completes the rename entirely, so the guard's subject already exists and
   deferring it would only leave a window where the thing can regress.
3. **The server is finished before the UI starts** (T3–T5c before T6–T8), so no
   component is ever built against an endpoint that does not answer yet.

---

## A. The rename, and locking it in

- [x] **T1** — Rename the four labels that show `VaultName` from `Location` to
      **Store**.
      · `TopFilters.tsx:308`, `FilterMobileContent.tsx:90`,
      `DashboardTable.tsx:131` (column header), `DashboardTable.tsx:101` (row
      detail).
      · `DashboardTable.tsx:54` already renders `Store: ${row.VaultName}` — this
      makes the other four agree with it, rather than inventing a name.
      · **Labels only.** No param, no state key, no query changes: the URL param
      stays `stores` and the column stays `VaultName`.
      · files: the three components
      · check: `npm test` green; grep finds no remaining `Location` label bound to
      `VaultName`.

- [x] **T2** — Guard: **no source line under `src/app/ui` mentions both
      `VaultName` and `Location`.**
      · Stated at line level on purpose. After this feature the word *Location* is
      legitimate — it names the new filter and the new column — so a guard that
      simply forbids the string would fail on correct code. All four defects were
      single lines pairing the two:
      `{ accessorKey: 'VaultName', header: 'Location' }`,
      `{ label: 'Location', value: row.VaultName }`.
      · The defect this feature exists to fix took two names for one field and let
      them drift apart across three files. A grep today proves nothing about
      tomorrow.
      · **Verify it red before accepting it green** — revert one of T1's four
      labels, confirm the failure, restore.
      · files: `src/app/ui/sections/dashboardLabels.guard.test.ts` *(new)*
      · check: red against pre-T1, green after.

## B. The server

- [x] **T3** — Add `Location?: string` to `DocumentRecord` and render it: a new
      **Location** column plus a row-detail field.
      · **No API change.** The list query is `SELECT *` and the recordset is cast,
      not projected (`tiresRepository.ts:240-248`), so the value already arrives
      in every row; it is missing only from the type and the column list.
      · Follow the existing `meta: { className: 'hidden md:table-cell' }` pattern
      so the mobile layout keeps its current density.
      · files: `src/repositories/tiresRepository.ts`,
      `src/app/ui/components/DashboardTable/DashboardTable.tsx`
      · check: a test asserts the column def maps to `Location`; visually the
      column shows codes like `+703C+`.

- [x] **T4** — `fetchDashboardLocations(stores)` **and** its route, in one task
      (ordering rule 1).
      · Returns `{ store, code }[]` — **pairs, not codes**. A bare code is
      ambiguous for the 7 that exist in more than one store.
      · Returns `[]` for an empty input **without querying**.
      · Excludes empty and whitespace-only codes — 1.057 units have one, the same
      exclusion `fetchDashboardStores` already applies to `VaultName`.
      · The route mirrors `api/dashboard/stores/route.ts` exactly: `withLogging`,
      `auth()` → 401, `logger.error` → 500.
      · files: `src/repositories/tiresRepository.ts`,
      `src/app/api/dashboard/locations/route.ts` *(new)*, tests for both
      · check: `npm test` — 401 without a session; `[]` for no stores and no query
      issued; codes come back paired and trimmed.

- [x] **T5** — `buildFiltersClause` gains a `locations` branch matching
      **store-and-code pairs**, and `TireFilters` gains the field.
      · **`buildFiltersClause`, not `buildTireFilters`.** They are different
      functions in different layers — `tiresRepository.ts:14` builds SQL,
      `filterUtils.ts:14` parses the URL — and confusing them is how the first
      draft of this plan lost T5b entirely.
      · **Not `AND Location IN (…)`.** That is the shape the neighbouring `stores`
      branch uses and it is wrong here: `IN`, `stkCesar`, `+690A+`, `+692A+`,
      `+706D+`, `[183B]` and `+IN+` exist in more than one store, so a flat match
      would return another store's shelf without saying so.
      · `AND ((VaultName = @ls0 AND Location = @lc0) OR …)`, **both halves bound**.
      Nothing interpolated, like every other branch.
      · files: `src/repositories/tiresRepository.ts` + test
      · check: `npm test` — the built clause and its params; and the AC5b case with
      the two stores that share `+690A+`, **which a flat `IN (…)` would pass while
      being wrong**.

- [x] **T5b** — `buildTireFilters` in `filterUtils.ts` parses the `locations` param
      into the pair array T5 consumes.
      · **This is the step that makes the chain live.** Without it the param
      travels to the server and is silently dropped — and *every test still
      passes*, because T5 exercises the clause builder with an array nothing
      populates. It is the finding `/analyze` caught.
      · Goes next to the existing `storesParam` line (`filterUtils.ts:62`), same
      shape.
      · Malformed input yields **no `locations` key**, not a broken pair: this
      parser is shared with `/api/tires`, so a stray param from anywhere must not
      produce a half-built filter.
      · files: `src/app/utils/filterUtils.ts`, `src/app/utils/filterUtils.test.ts`
      · check: `npm test` — param in → pairs out; absent, empty or malformed → key
      absent; the awkward codes survive (`+703C+`, `:410D:`, `< >`, `''651B ''`).

- [x] **T5c** — The AI chat can set the same filter.
      · `apply_filters` gains a `locations` property, shaped like the `stores` one
      it already has (`ai-chat/route.ts:89`).
      · The system prompt gains two rules: a code needs a **store** (the chat's
      version of the disabled control), and **the model must never invent a
      code**. It can recognise `Michelin` and `Hialeah`; it cannot know whether
      `+703Z+` exists. A guessed code returns an empty table, which reads as
      broken inventory rather than a bad guess.
      · files: `src/app/api/dashboard/ai-chat/route.ts`,
      `src/app/api/dashboard/ai-chat/route.test.ts`
      · check: `npm test` — the tool schema exposes `locations`; a request naming a
      code with no store produces no `locations` filter.

## C. The client

- [x] **T6** — `useFilters`: `locations` state, the store-keyed fetch, the prune,
      and the URL round-trip.
      · Effect keys on `checkboxInputs.stores.join(',')`. Empty selection → **no
      request**.
      · **The prune (FR5):** when a store is deselected, drop the selected pairs
      that belonged to it. It writes state derived from its own dependency, so it
      must `return prev` unchanged when nothing was dropped — the guard already
      used at `useFilters.tsx:211-217` against a render loop.
      · **Encode both halves** of each pair before joining (`~` between, `,`
      across). `:` is unusable — `:410D:` and `:IN:` contain it — and `+` decodes
      to a space in a query string, which matters because most codes look like
      `+703C+`.
      · The new param must take part in the existing `filterChanged` comparison so
      `page` resets to 1; filtering to a shelf while on page 7 otherwise shows an
      empty table.
      · files: `src/app/ui/sections/FiltersMobile/hooks/useFilters.tsx` + test
      · check: `npm test` — no fetch with no store; the prune drops only the
      orphaned pairs; round-trip over `+703C+`, `:410D:`, `< >`, `''651B ''`.

- [x] **T7** — The grouped **Location** dropdown in `TopFilters`, with its
      type-to-filter input and its disabled state.
      · Reuse the stores dropdown markup at `TopFilters.tsx:296-360` — button,
      panel, `openMenu`, `activeClass`. Do not build a second pattern.
      · **Disabled with the reason in the button's own text**, e.g.
      `Location — select a store`. Not a tooltip: a `disabled` element receives no
      touch events on iOS, so a tap-to-reveal hint is invisible on the device the
      staff actually use.
      · Codes grouped under their store; a group renders only while it still has a
      visible match; clearing the input restores the list and **never changes the
      selection**.
      · files: `src/app/ui/sections/TopFilters/TopFilters.tsx` + test
      · check: `npm test` with `@testing-library` — disabled and unopenable with no
      store, `aria-disabled` present; typing `703` hides the group with no match;
      selection survives clearing the input.

- [x] **T8** — The same control in `FilterMobileContent`, so the mobile panel does
      not drift.
      · Two components render these filters, and letting one lag the other is
      exactly how `Location` came to mean two things in the first place.
      · files: `src/app/ui/sections/FilterMobileContent/FilterMobileContent.tsx`
      · check: the filter behaves identically in the mobile panel.

- [x] **T9** — Wire it through `Dashboard.tsx`, mirroring `showStoreFilter`.
      · files: `src/app/(sellers)/dashboard/container/Dashboard.tsx`
      · check: manual — pick a store, confirm the Location filter enables and
      lists only that store's codes; pick a code and confirm the table narrows.

## D. Close

- [x] **T10** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` all green.
      · `perf:budget` **will** move — this adds client code to a route that is
      already client-heavy. Record the delta rather than waving it through; if it
      is more than ~2 KB, say where it went.
      · Format with `npx prettier --write` on the touched files only.
      **`npm run format` rewrites the whole repo.**
      · `results.md` must state plainly that `'Single'`, `'set 2'` and
      `'sold ebay'` appear as real options. They are real inventory values, and
      the first person to see them will read them as a bug.

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC1 |
| T2 | AC1 (guarded) |
| T3 | AC2 |
| T4 | AC3, AC8 |
| T5 | AC5, AC5b |
| T5b | **AC9** |
| T5c | **AC10** |
| T6 | AC4b, AC6, AC7 |
| T7 | AC3b, AC4 |
| T8 | AC3b, AC4 (mobile) |
| T9 | — (wiring; manual check) |
| T10 | — (Definition of Done) |

Every acceptance criterion AC1–AC10 is covered, AC3b/AC4b/AC5b included.

**AC5b is verified over the generated SQL, not over returned rows.** The
repository tests run against a stubbed pool, so they can assert what we ask the
database, not what it answers. That the rows really are limited to one store is
the manual check in T9.

---

_Run `/analyze` next. Do not implement before it is clean._
