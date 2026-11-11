# Spec — Tire sets in the AI chat

> Feature: `044-chat-tire-sets` · Status: Implemented (owner review pending) · Created: 2026-11-10
> Roadmap: "Tire sets in the AI chat (`044`)" — step 2 after 041's chat tip ·
> Branch: `feat/044-chat-tire-sets`

## Why — problem & value

Most buyers want a set — two or four matching tires — and 70% of the sellable
units sit in groups of four or more (041). Today, when a customer tells the
site's chat "I need 4 tires 225/45R17", the chat can only send them to the
catalog with a tip: "open any tire and use Build your set". The chat is not
allowed to say whether a set exists, because it cannot see it. So the customer
opens tires one by one, hoping one of them has three identical siblings in the
same city.

The chat should answer the question the customer actually asked: **"Which
sets can I buy in this size?"**, with real sets that can be built today, each
one tap away from the page where the customer checks it and adds it to the
cart. This serves the mission's _smart assistance_ and _frictionless search_
pillars without weakening _trustworthy closing_: the chat proposes, the
shopper confirms on the tire page.

## User stories

- As a **shopper who needs 4 tires of one size**, I want **the chat to show
  me sets that really exist**, so that **I don't open tires one by one looking
  for matching ones**.
- As a **shopper**, I want **each proposed set to show brand and model, city,
  total price and tread range**, so that **I can compare them before opening
  one**.
- As a **shopper**, I want **one tap to land on the tire page with that set
  ready to review**, so that **I confirm it and add it to the cart myself**.
- As **Mr. Goma**, I want **the chat never to put tires in the cart or quote a
  set that cannot be built**, so that **no one pays for a wrong pick and the
  chat stays trustworthy**.

## Scope

- **In:**
  - The public chat (every storefront page) recognizes a request for a set
    with a size and answers with up to 3 sets that can be built now.
  - Each set: brand and model, condition, city, number of tires, total price,
    tread range, and a link to the tire page with that set ready.
  - Optional narrowing the customer gives: brand, condition (new/used), city.
  - The same rules as the tire page's "Build your set" (041): same brand,
    model, size, run-flat and condition; tread within 2/32"; all in one city.
  - When no set can be built: say so plainly and offer the next step.
- **Out:**
  - Adding to the cart from the chat (decision in the roadmap: a wrong pick
    ends in a real payment).
  - The authenticated dashboard assistant.
  - Searching by vehicle (the chat already suggests a size for a vehicle; the
    search starts from the size).
  - Mixed sets (different brands or models), staggered sizes (front ≠ rear),
    discounts or holds on stock.
  - Changes to the "Build your set" rules or to the catalog.

## Functional requirements

- **FR1:** When the customer asks for a set (2, 3 or 4 tires, "a set", "a
  pair", "un juego"…) and a full size is known (width, profile, rim), the chat
  answers with sets that can be built now in that size, instead of only the
  041 tip.
- **FR2:** It shows **up to 3** sets, chosen for variety and price (D1): at
  most one set per brand and model, cheapest total first; when the visitor's
  estimated city (043) has sets, those come first. With no estimate, cheapest
  first across both cities.
- **FR3:** A proposed set obeys exactly the "Build your set" rules (041): same
  brand, model, size, run-flat and condition; tread within 2/32"; one city. A
  set the tire page could not build is never proposed.
- **FR4:** Each set appears as a **card** in the chat (D7): brand and model,
  condition (new/used), city, number of tires, **exact total** as of the
  search (D5), tread range (e.g. "7–8/32"") and a "Review set →" button. The
  card's facts come from the inventory, never from the model's text. One line
  under the cards says prices and stock are as of now and are confirmed on the
  page.
- **FR5:** "Review set →" opens the tire page with the **"Build your set"
  panel already open** (D2) showing **those same tires** (D6) and their total;
  the shopper adds them to the cart there. If one of them sold or no longer
  fits meanwhile, the page swaps in the closest match it can build (041 rules)
  and says so in one line; if no set of that size can be built any more, the
  page opens normally with a short notice. A link that names tires which do
  not form a valid set never produces an invalid set.
- **FR6:** The number of tires is the one asked for; "a set" / "un juego"
  with no number means **4** (D3). When sets of 4 are proposed and sets of 2
  also exist, the reply may say so in one line.
- **FR7:** The customer can narrow by brand, condition and city; the cards
  respect every narrowing.
- **FR8:** When no set of the requested number exists, the chat says so
  plainly and offers, in this order (D4): (1) sets of that number in the
  other city — saying pickup is only in that city and delivery reaches both;
  (2) the largest smaller set that exists (e.g. 2 when 4 is impossible); (3)
  the catalog for that size (single tires) and WhatsApp. It never presents a
  fallback as if it were what was asked. When the customer named the city
  (FR7), step 1 is skipped.
- **FR9:** The chat never adds anything to the cart, never says a set is
  reserved, and never states availability it did not just look up.
- **FR10:** Replies stay in the customer's language (English or Spanish);
  card labels follow the chat's language.
- **FR11:** Without a full size the chat behaves as today (asks for the size,
  with the set tip); without a set request it behaves as today (catalog
  search).
- **FR12:** Opening a set from the chat is measured (D8) with its position (1–3),
  number of tires and city — no personal data, under the site's existing
  consent rules.

## Acceptance criteria (testable)

- [ ] **AC1:** Given buildable sets of 4 in 225/45R17, when the customer
      writes "I need 4 tires 225/45R17", then the chat shows 1 to 3 cards,
      each with brand and model, condition, city, "4 tires", exact total,
      tread range and "Review set →", plus the "as of now" line.
- [ ] **AC2:** Given any card, then its set meets the 041 rules (same brand,
      model, size, run-flat, condition; tread spread ≤ 2/32"; one city), its
      total is the sum of its tires' prices, and no two cards share brand and
      model.
- [ ] **AC3:** Given the visitor's estimated city is Orlando and both cities
      have sets, then Orlando sets come first; with no estimate, cards are in
      ascending total.
- [ ] **AC4:** Given a card, when the shopper taps "Review set →", then the
      tire page opens with the "Build your set" panel open, showing the same
      tires and the same total, ready to add.
- [ ] **AC5:** Given one tire of a proposed set sold before the tap, then the
      panel opens with the closest replacement and a one-line notice; given
      no set can be built any more, the page opens with the panel closed and
      a short notice; given a link with tires that do not form a valid set,
      no invalid set is ever shown.
- [ ] **AC6:** Given "a set of tires 225/45R17" (no number), then the cards
      are sets of 4.
- [ ] **AC7:** Given no set of 4 in the requested size and city but sets of 4
      in the other city, then the chat says none in the first city and shows
      the other city's cards with the pickup/delivery note; given none in
      either city but a set of 2, it says so and shows sets of 2; given none
      at all, it links the catalog for the size and WhatsApp. No fallback card
      is presented as the requested set.
- [ ] **AC8:** Given "4 Michelin 225/45R17 in Orlando", then every card is
      Michelin, 225/45R17 and Orlando, or the reply says none matches.
- [ ] **AC9:** Given "necesito un juego de 4 llantas 225/45R17", then the
      reply and the card labels are in Spanish.
- [ ] **AC10:** Given any chat reply, then the cart is unchanged and no reply
      claims a set is reserved.
- [ ] **AC11:** Given "I need tires" (no size), then the chat asks for the
      size as today; given "Michelin 17 inch" (no set asked), it searches the
      catalog as today.
- [ ] **AC12:** Given the inventory lookup fails or takes longer than 4
      seconds, then the chat shows no cards and falls back to today's reply
      with the 041 tip (the customer is never left waiting on a saturated
      database).
- [ ] **AC13:** When a card is opened, then one event carries position,
      number of tires and city, and nothing personal — sent to GA4 when the
      visitor consented and to Vercel Analytics always (cookie-free, as every
      site event).
- [ ] **AC14:** Given any card or reply, then no warehouse name or shelf code
      appears.

## Non-functional / constraints

- **Correctness first:** a proposed set must be one the tire page can build.
  When in doubt, propose nothing (mission order: trust → accessibility →
  performance → scope).
- **Database load:** the public chat is anonymous and the inventory database
  has saturated under bot traffic before. A set lookup must not add a burst of
  queries per message; repeated lookups for the same size share the result
  for a short time.
- **Cost:** every message costs a model call; the existing rate and size
  limits stay, and a set request must not need extra model calls.
- **No internal data:** warehouse names (VaultName) and shelf codes
  (Location) never appear; the city is the only location shown.
- **Accessible and mobile-first:** cards readable on a 360 px phone and by a
  screen reader; each button's name says which set it opens. The panel that
  opens from a link keeps 041's focus behaviour.
- **No change** to page HTML for search engines, nor to the shared JS budget
  of every page (the chat stays lazy-loaded; a tire page opened without the
  link behaves exactly as today).
- English and Spanish, as the chat already does. This is the chat's existing
  exception to the English-only UI (`tech-stack.md`): the Spanish strings live
  with the chat's own messages; no translation layer is added.

## Decisions (owner, 2026-11-10)

- **D1:** Up to 3 sets, one per brand and model, cheapest total first; the
  visitor's estimated city first when it has sets. **Revised after the
  owner's test (2026-11-10): sets without patched tires come first** — inside
  a set, unpatched tires are chosen before cheaper patched ones, and between
  sets fewer patched tires win before a lower total.
- **D2:** The card's link opens the tire page with the "Build your set" panel
  open at that quantity.
- **D3:** "A set" with no number means 4.
- **D4:** No set → other city, then a smaller set, then the catalog and
  WhatsApp.
- **D5:** Exact total as of the search, with a line saying prices and stock
  are confirmed on the page. This updates the chat's "never guarantee exact
  prices" rule for sets the app looked up itself.
- **D6:** The link carries the exact tires; the page shows those, or the
  closest valid replacement with a notice.
- **D7:** Sets show as cards rendered by the app, not as model-written text.
- **D8:** A GA4 event when a set is opened from the chat.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
