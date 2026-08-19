# Plan — One word, one meaning: Store and Location in the dashboard

> Feature: `026-dashboard-store-location` · Based on: [spec.md](./spec.md) · Created: 2026-08-19

## Technical approach

The `stores` filter already walks the whole path this feature needs, end to end:

```
fetchDashboardStores()            repositories/tiresRepository.ts:327
  → GET /api/dashboard/stores     api/dashboard/stores/route.ts      (auth + withLogging)
  → useFilters(… { enableStoreFilter })  fetch on mount → availableStores
  → checkboxInputs.stores         a string[] in the hook's state
  → setOrDelete('stores', …)      comma-joined into the URL
  → buildTireFilters(searchParams)   filterUtils.ts:62 — URL → TireFilters
  → buildFiltersClause(filters)      tiresRepository.ts:68 — AND VaultName IN (…)
```

**Two functions, similar names, different layers**, and getting them confused is
how the first draft of this plan lost a step:

| | Where | Does |
| --- | --- | --- |
| `buildTireFilters` | `app/utils/filterUtils.ts:14` | parses the **URL** into a `TireFilters` |
| `buildFiltersClause` | `repositories/tiresRepository.ts:14` | turns a `TireFilters` into **SQL** |

That draft named only `buildTireFilters` while describing the SQL branch, and so
omitted the URL parser entirely. The result would have been a filter that does
nothing, with every test green — the clause builder tested against an array that
nothing ever populates. It is a small version of the exact defect this feature
exists to fix: one name doing two jobs.

The Location filter is the **same path with one difference**: its options depend
on the current store selection, so it fetches on *change* rather than on mount,
and its selection is a **pair**, so it cannot reuse `string[]` unexamined.

Nothing about the table needs new plumbing at all: the list query is
`SELECT *` and `dataResult.recordset` is **cast**, not projected
(`tiresRepository.ts:240-248`), so `Location` is already in every row the browser
receives. It is missing only from the `DocumentRecord` type and from `columns`.

## Reuse first

| Existing | Used for |
| --- | --- |
| `fetchDashboardStores()` — `tiresRepository.ts:327` | shape for `fetchDashboardLocations`, including the `<> ''` exclusion |
| `api/dashboard/stores/route.ts` | shape for the new route: `auth()` → 401, `withLogging`, `logger.error` |
| `buildFiltersClause`'s `stores` branch — `tiresRepository.ts:68` | the bound-parameter pattern; **not** the `IN (…)` shape (see below) |
| `buildTireFilters`'s `storesParam` line — `filterUtils.ts:62` | shape for parsing the new param out of the URL |
| `apply_filters`' `stores` property — `ai-chat/route.ts:89` | shape for the chat's new `locations` property |
| `useFilters`'s stores effect — `useFilters.tsx:198-226` | fetch, normalise-against-available, loading flag |
| `setOrDelete(...)` — `useFilters.tsx:337` | URL round-trip, and the `page=1` reset on change |
| `TopFilters`'s stores dropdown — `TopFilters.tsx:296-360` | the button/panel/checkbox markup, `openMenu`, `activeClass` |
| `DocumentRecord` — `tiresRepository.ts` | add `Location?: string`; the value already arrives |

## Files to add / change

- **`src/repositories/tiresRepository.ts`**
  - `Location?: string` on `DocumentRecord`.
  - `fetchDashboardLocations(stores: string[])` — returns `{ store, code }[]`,
    empty for an empty input, never querying with no store.
  - `buildFiltersClause`: a `locations` branch emitting **pairs** (below).
  - `TireFilters` gains `locations?: { store: string; code: string }[]`.
- **`src/app/utils/filterUtils.ts`** — `buildTireFilters` parses the `locations`
  param into that pair array, next to the `storesParam` line it already has.
  **This is the step the first draft missed.** Shared with `/api/tires` and
  `fetchTiresServer`, which is a decision, not an oversight — see the spec's Scope.
- **`src/app/api/dashboard/ai-chat/route.ts`** — `apply_filters` gains a
  `locations` property and the system prompt gains the rule that a code needs a
  store and may never be invented.
- **`src/app/api/dashboard/locations/route.ts`** *(new)* — reads `?stores=`,
  returns `[]` when absent, 401 without a session.
- **`src/app/ui/sections/FiltersMobile/hooks/useFilters.tsx`** — `locations` in
  `CheckboxInputs` as pair strings, an effect keyed on the store selection, the
  prune from FR5, and `setOrDelete('locations', …)`.
- **`src/app/ui/sections/TopFilters/TopFilters.tsx`** — label `Location` → `Store`
  (line 308); the new grouped dropdown with its filter input and disabled state.
- **`src/app/ui/sections/FilterMobileContent/FilterMobileContent.tsx`** — label
  (line 90) and the same filter for mobile.
- **`src/app/ui/components/DashboardTable/DashboardTable.tsx`** — line 131
  `header: 'Location'` → `'Store'`; line 101 `label: 'Location'` → `'Store'`; a new
  `Location` column and row-detail field.
- **`src/app/(sellers)/dashboard/container/Dashboard.tsx`** — pass the new flag
  through, mirroring `showStoreFilter`.
- Tests: `tiresRepository` filter-building, the hook's prune, and a guard.

## Data & flow

### Why the filter is a pair, not a code

`buildFiltersClause` currently does, for stores:

```ts
clause += ` AND VaultName IN (${storeParams})`;
```

The obvious symmetry — `AND Location IN (…)` — is **wrong here**, because a code
is only unique inside its store. Seven codes are not: `IN`, `stkCesar`, `+690A+`,
`+692A+`, `+706D+`, `[183B]`, `+IN+`. So:

```ts
const pairs = filters.locations.map((_, i) => `(VaultName = @ls${i} AND Location = @lc${i})`);
clause += ` AND (${pairs.join(' OR ')})`;
```

Both halves bound, like every other branch. Nothing interpolated.

### Encoding the pair in the URL

The param carries `store~code`, pairs joined by `,` — but **both halves are
`encodeURIComponent`d first**, and parsing decodes them. This is deliberate rather
than fussy:

- Two codes contain `:` (`:410D:`, `:IN:`), so the obvious separator is out.
  None contains `,`, `~`, `|` or `;` **today** — but encoding removes the
  dependency on that staying true.
- **`+` is the real hazard.** Most codes look like `+703C+`, and in a query string
  `+` decodes to a space. `URLSearchParams` handles this correctly in both
  directions, so the existing `params.set` / `searchParams.get` path is safe — but
  only as long as nobody hand-builds the string. Encoding each half makes the
  value inert either way.
- Eight codes contain spaces or angle brackets (`< >`, `''651B ''`, `112i (a)`).

Parsing splits each pair on its **first** `~` only.

### When the options are fetched

The stores effect (`useFilters.tsx:198`) runs once on mount. The locations effect
keys on `checkboxInputs.stores.join(',')`:

- empty selection → no request, empty options, control disabled (FR4)
- non-empty → `GET /api/dashboard/locations?stores=…`

Then **the prune** (FR5): when the store selection changes, drop selected pairs
whose store is no longer selected. The stores effect already does a comparable
normalisation and returns `prev` unchanged when nothing moved — the same guard
against a render loop applies here, since this writes to the state its own
dependency is derived from.

### The AI chat

`apply_filters` already carries `stores` as a comma-separated string, so
`locations` joins it in the same shape — the chat writes the same URL the UI
does, which is the whole reason the chat works today.

Two rules go in the system prompt, and the second matters more than it looks:

- A shelf code only means something **with its store**, so the chat must not emit
  `locations` unless the conversation has established one. This is the same
  precondition the UI enforces by disabling the control.
- **The model must never invent a code.** It can recognise `Michelin` and
  `Hialeah`; it cannot know that `+703C+` exists and `+703Z+` does not. A guessed
  code returns an empty table, which reads as broken inventory rather than a bad
  guess. The chat passes through only what the user typed.

### The disabled control

```
[ Store ▾ ]   [ Location — select a store ]
                        ↑ disabled, aria-disabled, cannot open
```

The precondition is **in the button's own text**, not a tooltip. A `disabled`
element receives no touch events on iOS, so a tap-to-reveal hint is invisible on
the device the staff actually hold. Same constraint that shaped the AI chat.

### The grouped list with its filter input

```
Location ▾
  [ 703          ] 🔍
  Hialeah
    □ +703A+   □ +703B+
  441
    (hidden — no match)
```

A group renders only while it still has a visible match; clearing the input
restores everything and never touches the selection.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | four labels changed | guard: no `'Location'` label bound to `VaultName` anywhere in `src/app/ui` |
| AC2 | `Location` column + `DocumentRecord` field | unit test on the column def; the value already arrives via `SELECT *` |
| AC3 | `fetchDashboardLocations` returns `{store, code}[]` | repository test with a stubbed pool; asserts the `<> ''` exclusion |
| AC3b | filter input narrows groups | component test: type `703`, assert the empty group is gone and the selection unchanged |
| AC4 | disabled button with its reason in the label | component test: no store → `disabled`, `aria-disabled`, click does not open |
| AC4b | effect returns early on empty selection | test asserts `fetch` is not called |
| AC5 | pair-wise `OR` of bound equality tests in `buildFiltersClause` | unit test on the built clause + params |
| AC9 | `buildTireFilters` parses `locations` into the pair array | unit test: param in → pairs out; absent/malformed → no key |
| AC10 | `apply_filters` gains `locations`; the prompt requires a store | route test asserting the tool schema, and that a code without a store yields no `locations` |
| AC5b | the same | assert the clause names store and code in one conjunction, both bound; **a flat `IN (…)` fails this**. The row-level claim is the manual check |
| AC6 | the prune | hook test: select two stores, pick a code in each, deselect one, assert only its code is gone |
| AC7 | encode/decode round-trip | unit test over the awkward codes: `+703C+`, `:410D:`, `< >`, `''651B ''` |
| AC8 | `auth()` → 401 | route test, mirroring the stores route |

## Tradeoffs / alternatives

- **Pair-wise filter vs. flat `IN (…)`.** Flat is one line and matches the
  neighbouring branch. It is also wrong for 7 codes, silently. Since the spec
  chose grouping, the grouping has to mean something in the query too — otherwise
  the UI implies a precision the results do not have.
- **Disabled vs. hidden.** Hidden is less code and never shows a dead control.
  Rejected: staff would never learn the filter exists. This was the user's call.
- **Encoding both halves vs. trusting the data.** No code contains `,` or `~`
  today, so raw joining would work. Encoding costs two calls and removes a class
  of bug that would appear as *wrong rows*, not an error, if someone types a
  comma into the inventory.
- **A `store` scope on the endpoint vs. returning all 675 and filtering in the
  client.** Client-side is one fewer request per store change and the payload is
  small. Rejected: the options must reflect what the store *has*, and the server
  already knows; shipping 675 codes to filter down to 40 also invites the flat
  list the spec ruled out.

## Risks

- **Render loop in the prune.** It writes `checkboxInputs.locations` from an
  effect keyed on `checkboxInputs.stores`. Mitigation: return `prev` unchanged
  when nothing was dropped — the pattern already used at `useFilters.tsx:211-217`.
- **`page` not reset.** Filtering to a shelf while on page 7 shows nothing.
  `setOrDelete` + the existing `filterChanged` branch already set `page=1`; the
  new param must take part in that comparison, not sit outside it.
- **Mobile drift.** Two components render these filters. A change to one and not
  the other is exactly how `Location` came to mean two things; the guard in AC1
  covers the label, and the mobile panel gets the same control.
- **Dirty data on display.** `'Single'`, `'set 2'`, `'sold ebay'` will appear in
  the dropdown as real options. That is intended — the filter shows the inventory
  as it is — but it will look like a bug to whoever sees it first, so `results.md`
  should say so plainly.

## Out of scope

- Cleaning the `Location` column.
- The public `/tires` filters — this is `/dashboard` only.
- The `Local` install flag, which is a third, unrelated column.
- Block 5's `Single` / `SetOf2` / `SetOf4` columns, found while exploring this and
  recorded for that feature.

---

_The concrete steps live in [tasks.md](./tasks.md)._
