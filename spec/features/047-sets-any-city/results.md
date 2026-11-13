# Results — Sets and pickup across Miami and Orlando

> Feature: `047-sets-any-city` · Verified locally 2026-11-13 (`next dev`,
> Chrome, real inventory, Stripe test mode).

## Definition of Done

`npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` ✓ (156 files, 1,976
tests) · `npm run build` ✓ · `npm run perf:budget` ✓ — shared First-Load
166.0 KB of 180 (unchanged), total client JS 638.2 KB of 680 (was 637.4; the
cart card adds ~1.6 KB).

## Data (2026-11-13)

1,910 groups (brand, model, size, run-flat, condition); 392 with ≥ 4 units;
**12 reach 4 only by joining cities**. 7 groups exceed the 60-unit cap merged
(6 per city before) — see the plan's risk.

## Browser

Group used: Continental ProContact GX SSR RFT MOE XL 235/50/19 — 3 used units
in Miami, 1 in Orlando (before 047 the Miami page offered at most 3).

| Flow | Observed | ✓ |
| --- | --- | --- |
| Miami tire page, set card | "We have 3 more like this in Miami and Orlando · from $400.00 for 2" | AC1 |
| Set panel | header "Miami and Orlando · CONTINENTAL 235/50/19"; sizes 2, 3, 4 (4 preselected); each row ends with its city (3 Miami, 1 Orlando) | AC1, AC13 |
| Add the set → drawer | "Set of 4 · $620.00 · tread 8.3–8.9/32 · Located in Miami and Orlando"; each tire its own city | AC13 |
| Checkout, pickup | all 7 stores; no one-city notice, no "Remove the {city} tire"; "ready within 24–48 business hours"; set header and each tire with its city | AC6, AC7, AC8, AC13 |
| No estimated city (localhost) | no store preselected | AC17 |
| Estimated Orlando, Miami-majority cart | East Orlando preselected, pay enabled | AC17 |
| `create-session` with the mixed set + Cutler Bay (Miami) store | 200, Stripe `cs_test_` URL (session not paid) | AC6, AC7 |
| Chat "I need 4 tires 235/50/19" | `found`, 3 cards | AC5 |
| Chat "… in Orlando" | `any_city`: "no set … all in Orlando … these can be built (each one says where its tires are). You can pick them up at any of our Orlando stores." | AC15 |
| Orlando tire, visitor estimated Miami | "Located in Orlando · 3 like this in Miami →" | AC14 |

The shopper's local cart and estimated city were backed up before and restored
after.

## Found and fixed in the browser

The first `any_city` text said the cards were built "from our Miami and
Orlando tires", but all three cards were in Miami. It now names no city for
the cards (each card says where its tires are); test added.

## Covered by tests, not by the browser

AC2 (no mixed-city tire outside 2/32"), AC3 (swap options in both cities, with
their city), AC4 (replacement in the other city, page and checkout route),
AC9 (single Orlando tire, Miami store), AC10 (no `VaultName`/`Location`),
AC11 (sold tire still 409), AC12 (city tie-break only after tread, patch,
price), AC16 (visitor city only on ties).

## Owner review (2026-11-13): compare tires in the cart

Asked: a small card on hover over any tire in the cart with what matters to
compare (patch, remaining life…). Chosen with the owner: a facts line on every
tire **plus** the hover card, because phones have no hover and
`modern-web-guidance`'s hovercard guide says a hovercard may only repeat
information available elsewhere.

| Check | Observed | ✓ |
| --- | --- | --- |
| Set of 4 added from the page | each line "8.6/32 · 86% life · Patched · DOT 2325" (and its siblings) | AC18 |
| Older lines (added before) | only "9/32" — what they carry | AC18 |
| Hover a line (Chrome, 1512 px) | after ~300 ms a card left of the drawer, level with the tire: photo, title, size, price, Tread, Remaining life, Patched (amber "Yes"), DOT, Condition, Location | AC18 |

Second round (owner, same day): a smoother opening and a lighter drawer.
- **Opening:** the card grows out of the drawer's edge (scale 0.94 → 1 from
  the right, a 10 px slide, 220 ms decelerating), leaves faster (120 ms) and
  keeps its tire while fading out. Once open it moves to the next tire at once
  and glides there (`translate`), while the details cross-fade. With reduced
  motion: a plain fade. Checked against `animate-to-from-top-layer` and
  `motion` (`overlay` and `display` in the transition, `allow-discrete`
  separate, transforms only under `no-preference`).
- **Lighter line:** "8.6/32 · 86% life · Patched" + city + Remove; DOT and
  stock number moved to the card; "Qty 1" gone; set members drop size and
  condition, now in the set header ("235/50/19 · Used · tread 8.3–8.9/32 ·
  Miami and Orlando").
- Found in Chrome: the card sat at the top of the screen — the dev server was
  serving the previous `globals.css` (Turbopack stale CSS, as in 041); forced
  a recompile. The card's photo was blank: `next/image` lazy-loads, and the
  card mounts hidden — now `loading="eager"`.

Third round (owner, same day): a small pointer on the card's right edge aims
at the tire (it stays level with the tire when the card is pushed up near the
bottom), and hovering the card keeps it open — it closes 150 ms after the
pointer leaves the card; a click on it does not close the drawer. Checked in
Chrome: open while over the card, `closed` after leaving it.

Screenshots of the card: taken in Chrome, not committed. Touch, no-room,
delays, Escape-free leave and `aria-hidden` are covered by
`CartModal.test.tsx`; the shopper's cart was backed up and restored.

## Notes

- `modern-web-guidance` is installed globally in `~/.agents/skills` (by the
  `skills` CLI; updated by the owner 2026-11-13, same version
  `2026_11_09-5bcc021b`), which this Claude Code session does not load as a
  skill; its guides were read from there (`hovercard`,
  `interest-triggered-action-previews`, `animate-to-from-top-layer`, `motion`).
  `popover="hint"` + `interestfor` were not used: Safari and Firefox lack both
  and the polyfill would add to the bundle; the card is a `popover="manual"`
  with the same delays and rules.
- Owner, 2026-11-13: tires move between the cities daily, so "24–48 business
  hours" holds when tires travel (D4 confirmed). Owner tested 047 locally: OK.
- Consultant: `ai_chat_sets_shown.outcome` `other_city` → `any_city` (046 note
  updated).
