# Results — Tire sets in the AI chat

> Feature: `044-chat-tire-sets` · Verified locally 2026-11-10 (`next dev`,
> production database read-only, real model calls, Chrome).

## Definition of Done

`npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` ✓ (151 files, 1,900
tests) · `npm run build` ✓ · `npm run perf:budget` ✓ — shared First-Load
166.0 KB of 180 (unchanged), total client JS 635.9 KB of 680.

## Inventory facts used

On 2026-11-10: 6,754 sellable units in 290 sizes; the largest size
(315/30/22) has 266 units in 33 models — one query of ≤ 400 rows per size.

## Chat API (real model, real inventory)

| Message | Answer | ✓ |
| --- | --- | --- |
| "I need 4 tires 315/30R22" | 3 cards, sets of 4, Miami: Continental PremiumContact 6 $340, Yokohama Advan Sport $400, Pirelli P Zero $460; tread ranges ≤ 1.3/32 | ✓ |
| "necesito un juego de llantas 315/30/22" (no number) | Same 3 sets of 4, Spanish text and labels | ✓ |
| "4 Pirelli 315/30/22 in Orlando" | "There's no set of 4 Pirelli 315/30R22 tires in Orlando right now. These sets of 2 can be built:" + 1 card (Orlando) | ✓ |
| "2 tires 205/55R16 new" | "No set of new 205/55R16 tires can be built right now" + catalog link + WhatsApp | ✓ |
| "a pair of 255/45/19 bridgestone" | 1 card, Bridgestone Turanza, 2 tires | ✓ |
| "I need 4 tires" (no size) | Asks for size / car + 041 tip | ✓ |
| "Michelin 17 inch" (no set) | Catalog search as before (`filters`) | ✓ |

The first version of the "smaller" and "none" messages said "no set of 4
315/30R22" when the customer had asked for Pirelli in Orlando — true only of
what was asked, misleading as written. The message now names the brand,
condition and city asked for (AC8).

## Browser

| Check | Observed | ✓ |
| --- | --- | --- |
| Cards in the chat | Heading, "4 tires · Used · Miami", total, tread, "Review set →"; link name "Review set: CONTINENTAL PREMIUMCONTACT 6 XL, 4 tires · Used · Miami, $340" | ✓ |
| Tap the first card | Chat closes; `/tires/284436-…` opens with the panel open, the same 4 tires, "Set of 4 · total $340.00 · tread 6.6–6.9/32"; focus on "4 tires"; `?set=` removed from the URL | ✓ |
| Link with one unknown id | Panel opens, "1 tire of that set just sold; we picked the closest match.", valid set of 4 | ✓ |
| Spanish conversation | "Ver juego: …, 4 llantas · Usadas · Miami, $340" | ✓ |
| Card width in the chat | 334 px, no horizontal overflow | ✓ |
| Console | Only a hydration warning from a browser extension (`data-xt-extension-active` on `<html>`), not from the app | ✓ |

Not done by the agent: a 360 px window (the browser did not resize; the chat
panel's layout is unchanged and the cards fit its width) and a real
VoiceOver pass. Both are for the owner's review.

## Owner's review (2026-11-10)

1. **Sets without patched tires first** (D1 revised). Inside a set,
   unpatched tires are chosen before cheaper patched ones; between sets, fewer
   patched tires win before a lower total. "4 llantas 315/30/22" now lists
   Continental PremiumContact 6 ($458), Michelin Pilot Sport 4S ($550) and
   Pirelli P Zero — the Yokohama set ($400, mostly patched) dropped out.
2. **Chat panel jumped when the cards arrived** (header pushed out, a blank
   band under the input; fine after closing and reopening). Cause: the log
   scrolled to its end with a smooth `scrollIntoView`, which also scrolls
   every scrollable ancestor — the panel included, despite `overflow:
   hidden` — and it measured before the log had moved. Now the log is scrolled
   directly (`scrollTo`), never its ancestors, and a reply with set cards is
   placed at its start so the text and the first card are read first.
   Measured: panel `scrollTop` 0, header in place, reply 12 px from the top of
   the log.
3. **The model asked "which city?" instead of looking up sets** after a
   greeting ("hola" → "necesito 4 llantas 315/30/22"): the flow's "ask which
   store" step won. RULE ZERO now names `find_sets`, and the sets section says
   not to ask for city, store, brand or condition first (guarded). Same
   conversation: sets on 3 of 3 tries, and in the browser.

DoD after the review: tsc ✓ · lint ✓ · 1,903 tests ✓ · build ✓ · budget
166.0 / 180 KB ✓.
