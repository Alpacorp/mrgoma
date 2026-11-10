# Spec — Build your tire set

> Feature: `041-tire-sets` · Status: Implemented (Lighthouse check pending) · Created: 2026-11-10
> Roadmap: Backlog — owner's "sets" idea (block 5 of the SEO audit, product
> track) · Branch: `feat/041-tire-sets`

## Why — problem & value

People replace tires in **pairs or sets of four**, but the site sells one
physical tire at a time. A shopper who needs four has to find, compare and add
four separate listings, with no help knowing whether those four belong together
— same model, same size, similar wear. Most give up or call.

The stock is there. Of 6,774 sellable tires (2026-11-10), **70% sit in groups of
four or more** of the same brand, model and size. In the same city a shopper
could get a matching set of four from **341 groups in Miami and 55 in
Orlando**, and in 581 of 827 multi-unit groups the tread differs by 1/32" or
less.

Nobody in Miami sells tire sets online (competitor research, 2026-11-10).
National used-tire sellers who do show **one** tread figure for the whole set
(gousedtire) or a range (eBay), and some offer "qty 4" when one tire is in stock
(utires). Our differentiator — showing the real state of every tire — becomes a
set feature: **the shopper sees each tire in the set** and knows it matches.

Serves the mission's pillars _visual transparency_ and _trustworthy closing_,
and the primary funnel (detail → checkout).

## User stories

- As a **shopper who needs two or four tires**, I want to build a matching set
  from the tire I am looking at, so that I buy them together in one step instead
  of hunting for each one.
- As a **shopper**, I want to see the tread, remaining life, patch status, DOT
  and price of **every** tire in my set, so that I trust they match and know
  what I pay for each.
- As a **shopper**, I want to swap a tire in the suggested set for another one,
  so that I can choose, for example, an unpatched one or a cheaper one.
- As a **shopper picking up in store**, I want to be offered only stores where
  my tires can actually be collected and told when they will be ready, so that I
  do not drive to the wrong city.
- As **store staff**, I want a set order to arrive as the exact tires the
  customer chose, so that I pull the right units.

## Scope

- **In:**
  - A "Build your set" block on the tire detail page: sets of **2, 3 or 4**,
    built from the tire on the page plus compatible units.
  - Automatic suggestion of the best-matching units, with the option to swap
    each one.
  - Adding the whole set to the cart in one action.
  - The cart showing the set as a group, with its total and tread range.
  - Store pickup restricted to stores in the same city as **all** the tires in
    the cart (sets and single tires), with the ready-time explained.
  - Analytics: the set reaches GA4 and Vercel as one `add_to_cart` carrying
    every tire (feature 040's payload).
- **Out:**
  - PDF quote / receipt and WhatsApp sharing → feature **042**.
  - Holding (reserving) tires while the shopper pays.
  - Staggered fitments (different front and rear sizes).
  - Search by vehicle.
  - Use of the database flags `Single`, `SetOf2`, `SetOf4` (D3).
  - Set discounts (D10): a set costs the sum of its tires.
  - A "Set available" badge on catalog cards (D8).
  - Sets offered from a sold tire's page (D12).
  - Changing how single tires are sold: buying one tire stays exactly as today.

## Functional requirements

- **FR1 — What a compatible set is (D2).** Tires can form a set only if they
  share **brand, model, size and run-flat type**, and the difference between the
  deepest and the shallowest tread in the set is **at most 2/32"**. Every tire
  must be available for sale online (same rule as the catalog). A **used** tire
  with no recorded tread cannot join a set (the rule cannot be verified); a
  **new** tire with no recorded tread counts as full tread.
- **FR2 — Same city.** All tires in a set are in the same city (Miami or
  Orlando), **for delivery and for pickup alike** (D5). The city is the one of
  the tire on the page.
- **FR3 — Offer only what exists.** The detail page offers a set of N only when
  at least N compatible tires (including the one on the page) are available. If
  none can be built, the block does not appear; the page works exactly as
  today.
- **FR4 — Say how many there are.** The block states how many **other** tires
  can join a valid set with the one on the page — same group, same city, and
  within 2/32" of it — e.g. "We have 7 more of this tire in Miami". Tires of the
  same model that could never be in a set with this one (tread too different)
  are not counted, so the number is always one the shopper can actually buy.
- **FR5 — Suggest the best set.** For the chosen size the site pre-selects the
  units that match best, always including the tire on the page, in this order
  of preference (D6): **(1)** tread closest to the tire on the page, **(2)**
  unpatched before patched, **(3)** lower price. The result is always within
  the 2/32" rule and the same city.
- **FR6 — Show every tire.** The suggested set lists each tire with tread depth,
  remaining life, patched yes/no, DOT, photo when there is one, and its price,
  plus the set total and the tread range (e.g. "9–10/32, Δ1/32").
- **FR7 — Swap a tire.** The shopper can replace any tire in the set except the
  one on the page with another compatible one; the total, the range and the 2/32"
  rule update immediately. A swap that would break FR1 is not offered.
- **FR8 — Add the set.** One action adds every tire of the set to the cart and
  opens the cart, as adding a single tire does today. A tire already in the cart
  is not added twice.
- **FR9 — Price.** A set costs the sum of the prices of its tires. No hidden
  change to any unit price.
- **FR10 — The set in the cart.** The cart shows the tires of a set together,
  labelled as a set of N, with its total and tread range. The shopper can remove
  the whole set or one tire; removing one leaves the rest as a smaller set
  ("Set of 3"). A set reduced to a single tire is shown as an ordinary single
  tire.
- **FR11 — Pickup by city (D1).** At checkout, when the shopper chooses pickup,
  only stores in the city where all the cart's tires are can be chosen, with a
  plain explanation and the expected ready time. If the cart holds tires from
  both cities, pickup is not possible and the shopper is told why; delivery stays
  available. This applies to single tires too, closing today's gap.
- **FR12 — Ready time.** The pickup message keeps today's promise — ready
  within **24–48 business hours**, confirmed by the store before collection —
  for single tires and sets alike (D9).
- **FR13 — Sold before paying (D7).** If a tire of a set is sold before the
  shopper pays, checkout names the sold tire, charges nothing, and offers a
  **compatible replacement** (same rules: FR1, same city, within 2/32" of the
  rest of the set, chosen by FR5's order) that the shopper accepts in one
  action. If no replacement exists, the tire is removed from the cart and the
  shopper is told the set is now smaller.
- **FR14 — Analytics.** Adding a set sends one `add_to_cart` whose items are all
  the tires of the set (quantity 1 each) and whose value is the set total.
  Checkout and purchase events already list every tire (feature 040). Building a
  set is also recorded as its own event so the use of the feature is measurable.
- **FR15 — Catalog hint.** No "Set available" badge on catalog cards in v1
  (D8): it would add database work to every `/tires` listing, which is already
  the bottleneck. Revisit with usage data.
- **FR16 — New tires (D11).** For new tires, whose units of a model and size
  are identical, the block is simplified: the shopper chooses how many (2, 3 or
  4), sees availability and the total — no per-unit list and no swapping.
- **FR17 — Available tires only (D12).** The block appears only on a tire that
  is available; a sold tire's page stays as today.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a tire with at least three compatible tires in the same
      city, when its detail page opens, then the "Build your set" block offers
      sets of 2, 3 and 4 and states N = the number of other tires within 2/32"
      of it (e.g. a group of 8 where 2 are 3/32" away → "6 more"), never the
      raw group size.
- [ ] **AC2:** Given a tire with exactly one compatible tire in its city, then
      only a set of 2 is offered.
- [ ] **AC3:** Given a tire with no compatible tire (different model, size,
      run-flat type, city, or tread beyond 2/32"), then no set block appears and
      the page is otherwise unchanged.
- [ ] **AC4:** Given a set of 4 is chosen, then four distinct tires are listed,
      the one on the page among them, each with tread, remaining life, patched,
      DOT, price and photo when available; the total equals the sum of the four
      prices; the tread range is shown; and the difference is ≤ 2/32".
- [ ] **AC5:** Given a suggested set, when the shopper swaps one tire, then only
      compatible tires that keep the set within 2/32" are offered, and the total
      and range update.
- [ ] **AC6:** Given a set of 4 is added, then the cart contains those four
      tires, grouped as "Set of 4", with the same total; adding it again adds
      nothing; one `add_to_cart` with four items and the set total is recorded.
- [ ] **AC7:** Given a set of 4 in the cart, when one tire is removed, then the
      other three stay in the cart; when the set is removed, all four go.
- [ ] **AC8:** Given a cart whose tires are all in Orlando, when pickup is
      chosen, then only Orlando stores can be selected and the ready time is
      shown.
- [ ] **AC9:** Given a cart with tires in Miami and in Orlando, when pickup is
      chosen, then no store can be selected, the reason is shown, and delivery
      still works.
- [ ] **AC10:** Given a single Orlando tire in the cart (no set), when pickup is
      chosen, then Miami stores are not selectable — the existing gap is closed.
- [ ] **AC11:** Given a tire of the set was sold meanwhile and a compatible
      replacement exists, when the shopper proceeds to payment, then the sold
      tire is named, a replacement within 2/32" and in the same city is offered,
      and accepting it updates the cart; given no replacement exists, the sold
      tire is removed and the message says the set is now smaller. Nothing is
      charged for a sold tire.
- [ ] **AC12:** Given a detail page with a set block, then the block is usable
      with keyboard and screen reader (labelled options, announced total), works
      at 360 px width, and the page's LCP and the JS budget stay within target.
- [ ] **AC13:** Given a paid set order, then the order records show each tire as
      its own line (as today), so staff pull the exact units.
- [ ] **AC14:** Given a Miami tire whose only compatible units are in Orlando,
      then no set is offered (single-city rule holds for delivery too).
- [ ] **AC15:** Given compatible units where the closest-tread one is patched
      and an equally close one is unpatched, then the suggestion picks the
      unpatched one; between equal tread and patch status, the cheaper one.
- [ ] **AC16:** Given a new tire with 3 identical units available, then the
      (the page tire plus 3 more), then the block offers quantities 2, 3 and 4,
      shows availability and the total, and lists no individual units.
- [ ] **AC17:** Given a sold tire's detail page, then no set block appears.
- [ ] **AC18:** Given no catalog card shows a set badge, then `/tires` makes no
      additional database queries compared with before this feature.


## Non-functional / constraints

- **Trust first:** never show a set as matching when it is not; never offer a
  quantity that is not in stock (the utires anti-pattern).
- **Single tires unchanged:** a shopper who wants one tire sees and buys exactly
  as today.
- **Performance:** the detail page stays server-rendered with no LCP
  regression; the interactive part is small (≈54 KB of JS budget left in total);
  the extra database work per detail page must not worsen `/tires` slowness.
- **Mobile-first and WCAG 2.1 AA:** usable at 360 px, by keyboard and screen
  reader; prices and totals announced.
- **Honest about stock:** because tires are not held while paying, the site must
  not imply a reservation ("Set reserved"). Risk documented below.
- **Privacy:** internal warehouse names (`VaultName`) and shelf codes never
  reach the shopper; only the city.

## Known risk (accepted for v1)

**No hold while paying.** Every tire is unique. With sets, the chance that one
of four tires sells while the shopper is at Stripe is roughly four times that of
a single tire. Today a duplicate sale is refunded by hand. A reservation needs
database writes and is out of scope; it is a candidate follow-up if sold-during-
checkout incidents appear.

## Decisions (2026-11-10)

| #   | Decision                                                                  |
| --- | ------------------------------------------------------------------------- |
| D1  | Sets with delivery **and** pickup; pickup restricted to the tires' city   |
| D2  | Compatible = same brand, model, size, run-flat type; tread Δ ≤ 2/32"      |
| D3  | DB flags `Single` / `SetOf2` / `SetOf4` ignored in v1; ask owner later    |
| D4  | PDF quote/receipt and WhatsApp sharing are feature 042                    |
| D5  | Single-city sets for delivery too, not only pickup                        |
| D6  | Auto-pick order: closest tread → unpatched → lower price                  |
| D7  | Sold before paying: name it and offer a compatible replacement            |
| D8  | No catalog "Set available" badge in v1                                    |
| D9  | Pickup ready time stays "24–48 business hours" for sets too               |
| D10 | No set discount in v1                                                     |
| D11 | New tires: simplified block (quantity + total, no unit list)              |
| D12 | No set block on a sold tire's page in v1                                  |

## Open questions

- Owner, non-blocking: what the `Single` / `SetOf2` / `SetOf4` flags mean
  (D3) and whether pickup times differ when a set comes from several
  warehouses (D9 keeps today's text meanwhile).

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
