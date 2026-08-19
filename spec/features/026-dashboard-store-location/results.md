# Results — 026-dashboard-store-location

> Recorded: 2026-08-19 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.162 passed** (baseline 1.120, +42) in 91 files (was 84) |
| `npm run build` | ✅ (after the fix below) |
| `npm run perf:budget` | ✅ 166.0 KB / 180 · **619.7** KB / 680 |

**The budget moved by 1.5 KB**, and the plan said it would. This adds a grouped
dropdown with a filter input to a route that is already client-heavy. It is
0.2% of the limit with 9% of headroom, and it is attributable: `LocationFilter`
is a new client component reached from both the desktop bar and the mobile panel.

## The build caught what the suite could not

`npm test` was green and `npm run build` failed:

```
FilterMobileContent.tsx:1:21
You're importing a module that depends on `useState` into a
React Server Component module.
```

`FilterMobileContent` calls `useFilters` and has always been a client component in
practice, but it carried **no `'use client'` directive** — it worked because every
consumer was already a client component. Adding a `useState` for the new panel's
open state broke it, because the sections barrel re-exports it and `not-found.tsx`
reaches it from a Server Component.

Worth stating plainly: **vitest does not enforce React Server Component
boundaries.** No amount of unit testing would have found this; the build is the
only gate that sees it. The directive is now explicit, with a comment saying why.

## Two prune tests were flaky, and the fix was to stop faking the flow

They passed alone and failed in the full suite: `waitFor` timed out at 1.008 s.

The cause is not timing but the shape of the test. Driving the prune with a
*click* means `handleCheckboxChange` updates state and `router.push` — mocked —
never changes the URL, so the hook's own sync-from-URL effect restores the store
the click just removed. Which effect wins depends on machine load.

Rewritten to change `searchParams` and re-render, which is what actually happens
in the browser: every selection round-trips through the URL. Three consecutive
full-suite runs green.

Worth keeping: a flaky test here was pointing at a test that modelled the flow
backwards, not at a race worth retrying.

## AC5b, proven against the real database

The spec deliberately downgraded AC5b to an assertion over generated SQL, because
the repository tests run against a stubbed pool and cannot know what the database
answers. Here is the part that needed a real query:

```
shared code: "IN"  — present in 6 stores
  flat  AND Location IN ('IN')                     →  67 rows, 6 stores   ← too many
  pairs AND (VaultName = 'Hialeah' AND Location = 'IN')  →  1 row,  1 store
```

A flat `IN (…)` reads perfectly, passes review, and returns **67 rows from six
stores** where the user asked about one shelf in one store. That is the whole
reason the filter is a pair.

## The public API, as decided

The parser is shared with `/api/tires`, so the public route accepts the param. It
was checked rather than assumed:

```
/api/tires?page=1                                → totalCount 4243
/api/tires?page=1&locations=Hialeah~%2B703C%2B   → totalCount 0     (applied)
/api/tires?page=1&locations=malformado           → totalCount 4243  (ignored)
public payload fields → no Location, no VaultName
```

Three things confirmed at once: the param **is** honoured publicly (consistent
with `?stores=`, which has always been), a malformed value yields **no filter**
rather than a half-built one, and `pickTireListFields` keeps shelf codes and store
names **out of the public payload** entirely. So the public API can filter by a
shelf it will never show — which is the same position it has held for stores since
that whitelist was written.

## What `/analyze` caught, and what it was worth

**A missing step that no test would have failed.** The plan described the SQL
branch while naming `buildTireFilters` — which is the **URL parser** in
`filterUtils.ts`, not the clause builder `buildFiltersClause` in
`tiresRepository.ts`. Two similar names, two layers. The parser was left out of the
file list entirely, so the `locations` param would have reached the server and been
silently discarded, with every test green: the clause builder is exercised with an
array nothing would have populated.

It is a small version of the defect this feature exists to remove — one name doing
two jobs — and it became T5b.

**A guard that could not have been written as specified.** AC1 originally said "no
label calls `VaultName` Location". After this feature the word *Location* is
legitimate: it names the new filter and the new column. A guard forbidding the
string would fail on correct code. The rule is now at line level — **no source line
mentions both `VaultName` and `Location`** — which is exactly the shape all four
defects had:

```
{ accessorKey: 'VaultName', header: 'Location' }
{ label: 'Location', value: row.VaultName }
```

Verified red by reverting one label, and it named the exact line.

## What the dashboard was saying before

`DashboardTable.tsx:54` already rendered `Store: ${row.VaultName}` while lines 101
and 131 called the same field `Location`. Two names for one field in one
component. The rename makes the other four sites agree with the one that was
already right, rather than inventing a name.

## T9 needed no code

`showStoreFilter` already flows from `Dashboard.tsx` through both `TopFilters` and
`FiltersMobile → FilterMobileContent`. The new control renders on that same flag,
so the wiring task turned out to be a manual check only.

## One component, two surfaces

`LocationFilter` is shared by the desktop bar and the mobile panel rather than
mirrored in both. Two hand-kept copies of a filter drifting apart is precisely how
`Location` came to mean two things, and this feature should not plant the next one.

## The dropdown will show values that look like bugs

Real options include `'Single'`, `'set 2'`, `'sold ebay'` and `'stkCesar'`. They
are genuine `Location` values that somebody typed into the wrong field. **The
filter shows the inventory as it is** — cleaning it is the owner's call, not a
migration's — but the first person to open the menu will read them as a defect.

Also present: 1.057 units with no code at all, which are excluded from the options
(a blank choice would filter to nothing).

## Still to verify (manual)

- [ ] **The disabled state.** With no store selected the Location control is
      visible, greyed, and reads `Location — select a store`. It must not open.
- [ ] **The scoping.** Pick Hialeah: the control enables and lists only Hialeah's
      codes, grouped under its name. Add 441: a second group appears.
- [ ] **The prune.** With a code chosen in each of two stores, deselect one store —
      only that store's code disappears.
- [ ] **The filter input.** Type `703`: non-matching codes vanish and a group with
      no match disappears with them. Clear it: the list returns and the selection
      is untouched.
- [ ] **Mobile.** The same behaviour in the mobile filter panel.
- [ ] **The AI chat.** Ask for a shelf naming its store; the table narrows. Ask for
      a shelf **without** a store; it should ask which store rather than guess.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
