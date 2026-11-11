# Results — Sold and removed tire pages

> Feature: `045-sold-tire-pages` · Verified locally 2026-11-10 (`next dev`,
> production database read-only, Chrome).

## Finding that changed the plan

Selling a tire also trashes it: on 2026-11-10 **all 19,387 sold records had
`Trash = 1`**. "Trash → not found" would have removed every sold page, against
D1, so the trash hides only tires that are not sold (~1,080 records: 863
`none`, 195 `mrgomatiresnew`, 22 `mrgomaorlando`). Spec D2 revised.

## Checks

| AC | Tire | Observed | ✓ |
| --- | --- | --- | --- |
| AC1, AC2 | #458561 Pirelli 295/30/21 (sold) | JSON-LD `SoldOut`, robots `index, follow` | ✓ |
| AC1, AC5 | #407562 Continental (for sale) | JSON-LD `InStock`, page unchanged | ✓ |
| AC3 | #512564 Pirelli 245/45/21 (trashed, not sold) | "Tire Not Found", `noindex`, no Product JSON-LD | ✓ |
| AC4 | #418119 Michelin Pilot Sport 4 XL 245/35/20 (sold) | "This tire is sold. We have 1 like it in stock →" → #476613 | ✓ |
| AC4 | #458561 (no same model in stock — only other PZ4 variants) | Nothing added | ✓ |

| AC6 | #458561 (stored $650) and #418119 (stored $0), sold | No price in the page, title, description or JSON-LD offer; no "Free Shipping"; "Not available" on the left | ✓ |
| AC6 | #407562 (for sale) | Title "— $125", JSON-LD `price: 125.00`, "Free Shipping" | ✓ |

## DoD

`tsc` ✓ · lint ✓ · tests ✓ · build ✓ · perf budget ✓.

## Observations

- Sold records often carry **price 0** — the reason for FR5 / D3 (price hidden
  on sold tires). Search Console may report those offers as missing `price`.
- The not-found page emits two robots metas (`noindex` and `noindex, follow`);
  pre-existing, harmless.
