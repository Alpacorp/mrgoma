# Spec — Sets and pickup across Miami and Orlando

> Feature: `047-sets-any-city` · Status: Implemented (owner review pending) · Created: 2026-11-13
> Roadmap: Backlog — owner's review of tire sets (follows `041` and `044`) ·
> Branch: `feat/047-sets-any-city`

## Why — problem & value

The owner reviewed tire sets (041, and the chat's sets in 044) and approved
them with **one change**: a tire's location must not decide whether it belongs
in a set, and must not limit where the shopper picks up.

Today every set is built from tires **in one city** (041, D5), for delivery and
for pickup alike, and at checkout the shopper can only pick up at a store in
the city where **all** the cart's tires are (041, D1). A cart with tires in
Miami and in Orlando cannot be picked up at all; the shopper is told to choose
delivery or remove the tire from the other city. The owner moves tires between
the stores, so these rules turn away sales the business can serve:

- A Miami tire whose matching units are in Orlando gets **no set** today (041,
  AC14), although the owner would sell it.
- The chat (044) says "none in your city" and offers the other city as a
  second choice, instead of the best set.
- A shopper who prefers one store is refused pickup there because a tire is in
  the other city.

More sets can be built from the same stock, and every shopper can collect at
the store that suits them. It serves the mission's _trustworthy closing_ — the
shopper chooses how and where — and the primary funnel (detail → checkout).

## User stories

- As a **shopper who needs four tires**, I want to be offered the best
  matching set wherever the tires are, so that I am not left with no set
  because one unit is in the other city.
- As a **shopper picking up in store**, I want to choose any Mr. Goma store,
  so that I collect where it suits me — and to be told honestly when my tires
  will be ready there.
- As **Mr. Goma**, I want every compatible set offered and every pickup
  accepted, so that location never costs a sale I can serve by moving tires.

## Scope

- **In:**
  - Set compatibility without location: the set block on the tire page (041),
    the swap options, the sold-tire replacement at checkout, and the chat's
    sets (044).
  - Pickup at **any** of the 7 stores, whatever city the cart's tires are in —
    sets and single tires alike.
  - The texts that today explain the one-city rule: the checkout notice for
    mixed cities, the "Remove the {city} tire" control, the chat's
    "other city" answer.
  - The ready time shown for pickup when tires must travel to the chosen store.
- **Out:**
  - Compatibility rules other than location: same brand, model, size and
    run-flat type, condition, the 2/32" tread tolerance, patched-last and
    cheapest-first ordering, and set sizes 2, 3 and 4 stay as in 041.
  - Holding tires while paying (041's accepted risk).
  - Any charge for moving tires between cities.
  - Warehouse names (`VaultName`) and shelf codes: they still never reach the
    shopper.
  - Delivery, which already accepts tires from either city for single tires.

## Functional requirements

- **FR1 — Location is not compatibility.** Tires are compatible when they
  share brand, model, size, run-flat type and condition and their tread is
  within 2/32" (041, D2). Being in Miami or in Orlando does not matter: a set
  may hold tires from both cities. Reverses 041's D5.
- **FR2 — Same everywhere.** FR1 applies wherever a set is built or completed:
  the set block on the tire page, the options to swap a tire, the replacement
  offered at checkout for a tire sold meanwhile, and the sets the chat proposes.
- **FR3 — Best set first, fewer trips on a tie (D3).** The suggested set
  follows 041's order: closest tread, then unpatched, then lower price. Only
  when two tires are equal on all three does the one **in the same city as the
  tire on the page** win, so fewer tires travel. At checkout, where there is
  no page tire, the replacement for a sold tire breaks the tie on the city of
  the first tire the shopper keeps. The city never stops a set from being
  offered and never puts a worse tire before a better one.
- **FR4 — Pickup at any store.** At checkout, choosing pickup offers **all 7
  stores**, whatever city the cart's tires are in. A cart with tires in both
  cities can be picked up. Reverses 041's D1 and FR11.
- **FR5 — Ready time (D4).** The pickup message keeps today's promise for
  every store and every cart, whether or not tires travel: ready within
  **24–48 business hours**, confirmed by the store before collection.
- **FR6 — Where each tire is (D5).** Each tire keeps showing its city
  ("Located in Orlando") on the tire page and in the cart, so the shopper
  knows where it is. In the set block, each tire and each swap option names
  its city when the candidates span both cities; when they are all in one
  city, that city is named once. A set or chat card whose tires are in both
  cities says so ("Miami and Orlando"), never just one of them; in the cart
  and at checkout each tire of such a set also shows its own city.
- **FR7 — No more one-city messages.** The texts and controls that exist only
  because of the one-city rule go away: the checkout notice that pickup needs
  all tires in one city, the "Remove the {city} tire" control, and the chat
  saying no set exists in the shopper's city while one exists in the other.
  The tire page's "· 3 like this in Miami →" (043) **stays** (D6): it is a
  shortcut to the same tire nearer the visitor, not a limit.
- **FR8 — Analytics.** Events keep their meaning. The `remove_from_cart` sent
  by "Remove the {city} tire" (046) goes away with the control; removals by
  the shopper elsewhere are unchanged. The chat's `ai_chat_sets_shown`
  `outcome` loses `other_city` and gains `any_city` (a named city had no set
  of its own; sets from anywhere were shown); the consultant is told.
- **FR9 — Server agrees.** The site no longer refuses a payment because a
  pickup store is in another city than a tire. Every other check before
  payment (a tire sold meanwhile, a price that changed) stays.
- **FR10 — The chat and a city (D7, D8).** When the shopper names a city
  ("in Orlando"), the chat first proposes sets whose tires are all in that
  city; if there are none, it proposes the best sets from anywhere and says
  they can be picked up in Orlando — never "none". Without a named city, the
  cards follow 041's order (unpatched first, then total), and the visitor's
  estimated city (043) only breaks ties between equally good sets.
- **FR11 — Preselected store (D9).** At checkout, when the visitor's city is
  known (043), pickup preselects the nearest store to them, whatever city the
  tires are in; otherwise no store is preselected. The shopper can choose any.

- **FR12 — Compare tires in the cart (D10, owner review 2026-11-13).** Each
  tire in the cart drawer shows its tread, remaining life and patch on a
  short line ("8.6/32 · 86% life · Patched"), always visible. On a computer,
  hovering or focusing a tire also shows a card beside the drawer with its
  photo and the full detail: tread, life, patch, DOT, stock number, condition
  and city. To keep the drawer light, the line drops what the card or the set
  header already says: no DOT or stock number on the line, no "Qty 1" (every
  tire is unique; a quantity shows only when above 1), and set members omit
  the size and condition their set header states once. Phones keep what they
  need to compare on the line; the rest is on the tire's page. Lines added
  before this change show only what they carry.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a Miami tire whose only compatible units (same brand,
      model, size, run-flat, condition, tread within 2/32") are in Orlando,
      when its page opens, then the set block offers a set with those units.
      (Was 041's AC14: no set.)
- [ ] **AC2:** Given a set mixing Miami and Orlando tires, then each tire still
      matches 041's rules, and no tire outside 2/32" of the others is offered.
- [ ] **AC3:** Given the set block on a tire page, when the shopper swaps a
      tire, then compatible tires from both cities are listed.
- [ ] **AC4:** Given a tire of the set sold before paying and a compatible
      replacement only in the other city, then that replacement is offered.
- [ ] **AC5:** Given the chat asked for 4 tires of a size whose best set mixes
      cities, then the chat proposes it, and it never answers "none in your
      city" while a set exists in the other.
- [ ] **AC6:** Given a cart whose tires are all in Orlando, when pickup is
      chosen, then all 7 stores, Miami's included, can be selected, and paying
      with a Miami store works.
- [ ] **AC7:** Given a cart with tires in Miami and in Orlando, when pickup is
      chosen, then all 7 stores can be selected, no one-city notice is shown,
      no "Remove the {city} tire" control appears, and payment works.
- [ ] **AC8:** Given a pickup where some tires are in the other city, then the
      message says ready within 24–48 business hours, confirmed by the store —
      the same text as when no tire travels.
- [ ] **AC9:** Given a single tire (no set) in Orlando, when pickup at a Miami
      store is chosen, then it is accepted. (Was 041's AC10.)
- [ ] **AC10:** Given any of the above, then no warehouse name or shelf code
      reaches the shopper, and set suggestions still follow 041's order
      (closest tread → unpatched → lower price).
- [ ] **AC11:** Given a tire sold meanwhile at checkout, then it is still
      refused before payment as today; only the city check is gone.
- [ ] **AC12:** Given a Miami tire page and two candidate units equal in tread,
      patch status and price, one in Miami and one in Orlando, then the
      suggestion picks the Miami one; given the Orlando one has closer tread,
      it picks the Orlando one.
- [ ] **AC13:** Given a set with tires in both cities, then the set block, the
      cart and the chat card show "Miami and Orlando" (or each tire's own
      city), never a single city; each tire still shows its own city.
- [ ] **AC14:** Given an Orlando tire viewed by a visitor estimated in Miami
      with matching tires in Miami, then "· N like this in Miami →" still
      appears.
- [ ] **AC15:** Given the chat asked for "4 tires 225/45R17 in Orlando", when
      an all-Orlando set exists, then it is proposed first; when none exists,
      the best sets from anywhere are proposed with a line saying they can be
      picked up in Orlando, and the answer is never "none".
- [ ] **AC16:** Given the chat asked without a city by a visitor estimated in
      Orlando, then an unpatched Miami set comes before a patched Orlando set;
      between two equally good sets (same patch count and total), the Orlando
      one comes first.
- [ ] **AC18:** Given a tire added from its page, a catalog card or a set,
      when the drawer opens, then its line shows tread, life and patch — no
      DOT, stock number or "Qty 1" — and a set member no size or condition
      (its header shows them once); with a mouse, hovering the line for 300 ms opens a card
      beside the drawer with the same facts, which closes on leaving, Escape
      or scroll, never takes focus, and never opens on a touch screen or when
      there is no room beside the drawer; a small pointer on the card aims at
      the tire, and moving onto the card keeps it open until the pointer
      leaves it.
- [ ] **AC17:** Given a visitor estimated in Orlando and a cart with only Miami
      tires, when pickup is chosen, then the nearest Orlando store is
      preselected; given no visitor city, no store is preselected.

## Non-functional / constraints

- **Trust first:** never show tires as matching when they are not; never
  promise a ready time the stores cannot keep.
- **Performance:** no extra database work on the tire page or `/tires`; the
  set and chat lookups stay cached as in 041/044, and the mssql pool of 10
  must not see more queries per page.
- **Mobile-first and WCAG 2.1 AA:** the pickup store list stays usable at
  360 px and by keyboard and screen reader with 7 stores instead of 3–4.
- **Privacy:** only the city, never the warehouse or shelf.

## Decisions (owner, 2026-11-13)

- **D1:** Location does not count for compatibility (reverses 041's D5).
- **D2:** Pickup at any store whatever the tires' city (reverses 041's D1).
- **D3:** Between tires equal in tread, patch status and price, the one in the
  page tire's city wins; the city never outranks those three.
- **D4:** Pickup ready time stays "24–48 business hours, confirmed by the
  store", also when tires travel.
- **D5:** Each tire keeps showing its city.
- **D6:** "N like this in {city}" (043) stays.
- **D7:** A city named in the chat is a preference: sets all in that city
  first, otherwise the best from anywhere, with a pickup line for that city.
- **D8:** In the chat, the visitor's city only breaks ties between equally
  good sets.
- **D9:** Pickup preselects the store nearest the visitor when their city is
  known, whatever the tires' city; otherwise none.
- **D10 (owner review, 2026-11-13):** The cart lets shoppers compare tires:
  a facts line on every tire, always, plus a hover/focus card on computers.

## Open questions

None. The owner confirmed D4 on 2026-11-13: tires move between the cities
every day, so 24–48 business hours holds when tires travel.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
