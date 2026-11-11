# Plan — Sold and removed tire pages

> Feature: `045-sold-tire-pages` · Based on: [spec.md](./spec.md) · Created: 2026-11-10

## Technical approach

- **Availability and trash in one pure module**, `src/app/utils/tireAvailability.ts`:
  `isSoldStatus(status)` (the rule `TireInformation` already applies:
  `Condition` = `sold`, case-insensitive) and `isTrashed(record)` (the `Trash`
  bit arrives as `true`, `1` or `'true'`).
- **Page** (`/tires/[slug]/page.tsx`): `fetchProduct` returns `null` for a
  trashed record, so metadata, JSON-LD and the page all take the existing
  not-found path (FR3). The JSON-LD passes `availability: isSoldStatus(...) ?
  'SoldOut' : 'InStock'` (FR1). Robots untouched (FR2).
- **"N like this in stock"** (FR4): a server component
  `SoldTireAlternative` beside 041's `TireSetSection`; it reads the tire's
  group in **both** cities through the cached 041 query, picks
  `closestMatch` (043) and renders one line. `DetailView` passes it as a new
  `soldSlot` to `TireInformation`, which shows it only for a sold tire — the
  same slot pattern 041 uses to keep database code out of the client barrel.

## Files

- `src/app/utils/tireAvailability.ts` (+ test) — new.
- `src/app/(shop)/tires/[slug]/page.tsx` — trash → not found; availability.
- `src/app/ui/sections/TireSet/SoldTireAlternative.tsx` (+ test) — new.
- `src/app/interfaces/tires.d.ts` — `soldSlot?: React.ReactNode`.
- `src/app/ui/sections/TireInformation/TireInformation.tsx` (+ test) — render
  `soldSlot` under "Not available".
- `src/app/(shop)/detail/container/DetailView/DetailView.tsx` — pass it.
- `src/app/ui/sections/TireSet/serverBoundary.guard.test.ts` — the new
  component stays out of the barrel and is mounted by `DetailView`.

## AC → implementation

| AC  | How | Test |
| --- | --- | ---- |
| AC1 | `isSoldStatus` → `SoldOut` | unit (helper) + manual JSON-LD read |
| AC2 | robots untouched | manual |
| AC3 | `isRemoved` (trashed and not sold, D2) → `fetchProduct` null | unit (helper); manual on #512564 and #458561 |
| AC4 | `SoldTireAlternative` | component test (link, count, none, error) + manual |
| AC5 | slot and hidden price only when sold | `TireInformation` test |
| AC6 | `isSoldStatus` → no price in `TireInformation`, metadata and JSON-LD (D3) | `TireInformation` test + manual read of title and JSON-LD |

## Risks

- One or two cached group queries per sold tire view (60 s cache, shared by
  the group). Sold pages get little traffic.
- Stacked on 043: merge 043 first.

---

_The concrete steps live in [tasks.md](./tasks.md)._
