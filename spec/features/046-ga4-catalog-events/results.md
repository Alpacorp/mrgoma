# Results — Catalog and search events in GA4

> Feature: `046-ga4-catalog-events` · Verified locally 2026-11-11 (`next dev`,
> Chrome, real inventory). Events read from Vercel Web Analytics' debug log
> (`window.va`), which dev runs without sending; GA4 was not loaded because
> this browser has not accepted cookies — which is itself AC12.

## Definition of Done

`npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` ✓ (155 files, 1,942
tests) · `npm run build` ✓ · `npm run perf:budget` ✓ — shared First-Load
166.0 KB of 180 (unchanged), total client JS 637.4 KB of 680.

## Browser

| Flow | Events observed | ✓ |
| --- | --- | --- |
| `/tires?w=225&s=45&d=17` (direct) | `view_item_list` catalog (20) · `search` once | ✓ |
| Same size, then the brand facet "ROYAL BLACK" | `filter_apply` with `filter_group` `brand`, `filter_value` `ROYAL BLACK` · new `view_item_list` (7) · **no** `search` | ✓ |
| `/tires` → Next page | one `view_item_list` catalog (20) | ✓ (after fix) |
| Title of the 3rd card on page 2 | `select_item` catalog, `item_id` of that tire | ✓ |
| Card "Add to Cart" (drawer opens itself) | `add_to_cart` · `view_cart` (USD, value) | ✓ |
| Cart icon with the drawer already open | `open_cart` only (no second `view_cart`) | ✓ |
| Remove the tire in the drawer | `remove_from_cart` (its id, value 190, USD) | ✓ |
| Chat "I need 4 tires 315/30R22" → open 2nd card | `ai_chat_sets_shown` · `view_item_list` chat_sets (12 tires) · `chat_set_open` (position 2) · `select_item` chat_sets (4 tires) | ✓ |
| Home text search `225/45/17` | `view_item_list` catalog · `search` `225/45R17`, `tire_width` 225, `tire_profile` 45, `tire_rim` 17 | ✓ |
| No cookie consent | GA4 not loaded, nothing sent to it; Vercel got the flat summaries above | ✓ (AC12) |

The shopper's cart (3 tires) was backed up before the cart test and
restored after it.

## Found and fixed in the browser

Going to page 2 sent **two** `view_item_list`: the page number changes before
the new tires arrive, so the old tires were briefly reported again at page 2's
positions. The position now comes from the loaded data's own page
(`tiresData.page`), not from the page state; one event per page since.

## Covered by tests, not by the browser

- Positions 21–40 on page 2 and every item's exact keys (Vercel's summary
  carries no items).
- Brand and size pages' list names; checkout removals (one tire, a set,
  "Remove the Orlando tire") and no `remove_from_cart` for a sold tire; no
  `view_cart` on `/checkout`; `apply_home_filters` attributes.

## Follow-ups

- **GA4 itself** (DebugView) after accepting cookies, ideally in a Preview
  together with the `purchase` check — the consultant can watch it live.
- **Vercel volume**: `view_item_list` fires on every catalog page view.
  Measure a week after release; if it weighs on the quota, send it to GA4
  only.
- Consultant: register the custom dimensions listed in `consultant-note.md`.
