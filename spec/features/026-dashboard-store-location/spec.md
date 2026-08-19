# Spec — One word, one meaning: Store and Location in the dashboard

> Feature: `026-dashboard-store-location` · Status: Implemented · Created: 2026-08-19
> Roadmap: dashboard usability · Branch: `feat/026-dashboard-store-location`

## Why — problem & value

The dashboard has a dropdown labelled **Location**. It filters by `VaultName` —
which is the **store**: `Hialeah`, `Coral Gables`, `441`, `Pembroke WH`.

The database also has a column literally called **`Location`**, and it holds
something else entirely: the **shelf code** where the tire physically sits.

```
{IN}   405     -CTR-    95     +703C+  68
*IN*   151     -PT-     88     +703B+  67
IN>    134     -507D-   73     -507C-  66
```

So today the one word on screen points at the one thing it does not name, and the
data it *does* name is invisible — even though **it is already being sent to the
browser on every row**, because the query is `SELECT *` and the recordset is
returned unprojected. Staff cannot see where a tire is, and there is no way to
ask.

**The codebase already disagrees with itself.** `DashboardTable.tsx:54` renders
`Store: ${row.VaultName}` in the row summary, while line 131 heads the same field
`Location` and line 101 labels it `Location` again. Two names, one field, one
screen.

There is a third similarly-named thing, and keeping them apart is the point of
this feature:

| Column | Holds | Surfaced as |
| --- | --- | --- |
| `VaultName` | the store | the **Store** filter and column |
| `Location` | the shelf code within a store | the new **Location** filter and column |
| `Local` | `'0'/'1'/'-1'` — an install flag | the existing "Local Install Only" toggle |

## User stories

- As a **seller at the counter**, I want to filter the inventory by store *and
  then* by shelf code, so that I can walk straight to the tire instead of
  searching the racks.
- As **anyone reading the dashboard**, I want each column heading to name the
  thing under it, so that "Location" does not mean two things on one screen.

## Scope

- **In:** renaming the `VaultName` label to **Store** everywhere it is shown;
  adding a **Location** column to the dashboard table; adding a **Location**
  filter that is scoped to the selected store; the endpoint and query behind it;
  **the same filter reachable from the AI chat**.
- **Out:** any dashboard-only *UI* on the public site. No cleaning of the
  `Location` data itself. No change to the `Local` install filter beyond leaving
  it alone.
- **Deliberately not "out": the shared URL parser.** `buildTireFilters` in
  `filterUtils.ts` is used by `/api/tires` and `fetchTiresServer` as well as the
  dashboard routes, so teaching it `locations` means the public API accepts the
  param too. That is **consistent with what already happens** — the public route
  has always honoured `?stores=` through the same parser — and splitting the
  parser to avoid it would add a second mechanism for no gain. The public *pages*
  render no such filter and no shelf code.

## Functional requirements

- **FR1:** Every label that shows `VaultName` reads **Store**: the desktop
  dropdown, the mobile filter, the table heading and the row detail.
- **FR2:** The table gains a **Location** column showing `Location`. It requires
  no API change — the field is already in the payload; it is absent from the
  `DocumentRecord` type and from the column list.
- **FR3:** A **Location** filter offers only the codes belonging to the
  **currently selected store(s)**. Unscoped it would list **675** values.
- **FR3a:** The codes are **grouped under their store**, because a code means
  nothing on its own.
- **FR3b:** A selected code therefore means *this code **in that store***, and
  filtering must honour that. `Location IN (…)` alone would be wrong: **7 codes
  exist in more than one store** (`IN`, `stkCesar`, `+690A+`, `+692A+`, `+706D+`,
  `[183B]`, `+IN+`), so picking `+690A+` under Hialeah would silently also match
  441's shelf of the same name.
- **FR3c:** The dropdown carries a **type-to-filter input**. Hialeah alone has 130
  codes; a list that long without one is a scroll, not a menu.
- **FR4:** With no store selected, the Location filter is **visible but
  disabled** — not hidden. A hidden control teaches nobody it exists; a disabled
  one shows the capability and its precondition in the same glance. It must also
  **say why**, so the state reads as deliberate rather than broken.
- **FR5:** Changing the store selection **clears any Location codes that no longer
  belong** to the selection, rather than silently filtering by a code the new
  store does not have.
- **FR6:** Blank codes are never offered. **1.057 units** have an empty
  `Location`, the same way `fetchDashboardStores` already excludes empty
  `VaultName`.
- **FR7:** The filter survives a reload — it lives in the URL as **`locations`**,
  like every other filter, so a filtered view stays shareable. Because a selection
  is a store-and-code pair (FR3b), the param carries both, not the code alone.
- **FR8:** The param is **parsed back into filters by the shared parser**
  (`filterUtils.ts`), which is what every route already uses to turn a URL into a
  `TireFilters`. Without this step the param reaches the server and is silently
  discarded.
- **FR9:** The **AI chat can set the same filter**. Its `apply_filters` tool
  already exposes `stores`; it gains `locations` on the same terms.
- **FR9a:** The chat may only set `locations` when the conversation also
  establishes the store — the same precondition the UI enforces by disabling the
  control. A shelf code alone is not a filter, because a code is not unique across
  stores.

## Acceptance criteria (testable)

- [x] **AC1:** **No source line under `src/app/ui` mentions both `VaultName` and
      `Location`.** Stated as a line-level rule rather than "no label calls
      `VaultName` Location", because after this feature the word *Location* is
      legitimate — it names the new filter and column — so a bare grep for it must
      pass. The four defects were all single lines pairing the two
      (`{ accessorKey: 'VaultName', header: 'Location' }`,
      `{ label: 'Location', value: row.VaultName }`), which is exactly what the
      rule catches.
- [x] **AC2:** The table renders a `Location` column whose value for a given row
      equals that record's `Location` field.
- [x] **AC3:** `fetchDashboardLocations(stores)` returns only codes present in
      those stores, **each paired with the store it belongs to**, sorted, with no
      empty or whitespace-only value.
- [x] **AC3b:** Typing in the dropdown's filter input narrows the visible codes
      and **keeps a group visible only while it still has a match**. Clearing the
      input restores the full grouped list; it never changes the selection.
- [x] **AC4:** With no store selected the Location control **renders, is
      disabled, carries `aria-disabled`, and cannot be opened**; it states the
      precondition in text a screen reader also receives. Selecting a store
      enables it; deselecting the last store disables it again.
- [x] **AC4b:** `fetchDashboardLocations([])` returns an empty list, and no
      request is made while the control is disabled.
- [x] **AC5:** The `WHERE` clause matches **store-and-code pairs**, not codes
      alone — `AND ((VaultName = @s0 AND Location = @l0) OR …)` — using **bound
      parameters** throughout, like the existing `stores` branch of
      `buildTireFilters`. No value is interpolated into SQL.
- [x] **AC5b:** Given `+690A+` selected under one of the two stores that hold it,
      **the built clause names that store in the same conjunction as the code**,
      and the parameter list binds both. Stated over the generated SQL, not over
      returned rows: the repository tests run against a stubbed pool, so they
      verify what we ask the database, not what the database answers. *That the
      rows are in fact limited to one store is the manual check in `results.md`.*
      This is still the assertion a flat `IN (…)` fails.
- [x] **AC6:** Deselecting a store drops the Location codes that belonged only to
      it, and leaves the ones still valid.
- [x] **AC7:** The selected codes round-trip through the URL: applying them writes
      a param, and loading that URL restores the same selection.
- [x] **AC8:** The endpoint returns **401** without a session, like every other
      `/api/dashboard/*` route.
- [x] **AC9:** `buildTireFilters(searchParams)` in `filterUtils.ts` turns a
      `locations` param into the pair array `buildFiltersClause` consumes, and
      returns no `locations` key when the param is absent or malformed. **Without
      this the whole chain is inert while every other test passes**, because AC5
      exercises the clause builder with an array nothing would populate.
- [x] **AC10:** The AI chat's `apply_filters` tool accepts `locations` and the
      resulting URL carries it; asked for a shelf **without** a store, the chat
      does not emit a `locations` filter.

## Non-functional / constraints

- **The `Location` data is dirty and this feature does not clean it.** Alongside
  real codes there are hand-typed strays — `'Single'`, `'set 2'` — and 675
  distinct values over 17.377 units. The filter shows what is there; correcting
  the inventory is the owner's, not a migration's.
- **A code means nothing without its store.** Only **7** codes appear in more than
  one store, and those are the generic ones (`IN`, `stkCesar`). Scoped to a store
  the list is **34–130** codes — long, but a real menu. This is why FR3 and FR4
  exist rather than a single flat dropdown.
- **Reuse, do not invent.** `stores` already does all of this: an endpoint under
  `/api/dashboard`, a fetch in `useFilters`, a comma-joined URL param via
  `setOrDelete`, and a parameterised `IN (…)` in `buildTireFilters`. The Location
  filter is that same path with one added condition — it must not grow a second
  mechanism.
- Mobile parity: the dashboard's mobile filter panel shows the same filters, so
  Store and Location must behave the same there.
- **The AI chat cannot invent a shelf code.** Brands and store names are words a
  model can recognise; `+703C+` and `:410D:` are not. The chat can only pass
  through a code the user typed, and its prompt must say so — otherwise it will
  helpfully hallucinate a plausible-looking code and return an empty table that
  looks like broken inventory rather than a bad guess.

## Decisions taken

1. **Codes are grouped under their store** (FR3a), not merged into one list. This
   is what forces the pair-wise filter in FR3b — the grouping would be decoration
   if the query ignored it.
2. **The dropdown carries a type-to-filter input** (FR3c), in this feature rather
   than as a follow-up. 130 codes in one store is the case that decides it.
3. **The disabled control states its precondition on the button itself**, not in a
   tooltip. A `disabled` element receives no touch events on iOS, so anything that
   needs a tap to reveal is invisible on the device staff actually hold — the same
   constraint that shaped the AI chat's buttons.

## Open questions

None. All three are resolved above.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
