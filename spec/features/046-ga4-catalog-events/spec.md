# Spec — Catalog and search events in GA4

> Feature: `046-ga4-catalog-events` · Status: Implemented (owner review pending) · Created: 2026-11-11
> Roadmap: "Catalog and search events in GA4 (`046`)" — follows 040 ·
> Branch: `feat/046-ga4-catalog-events`

## Why — problem & value

Feature 040 gave GA4 the purchase funnel from the tire page on: `view_item`,
`add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info` and
`purchase`, all with products, value and currency. The consultant's review of
2026-11-11 found what is still missing around it:

1. **Before the tire page** GA4 sees nothing of the catalog: which tires were
   listed (`view_item_list`) and which one the shopper chose from a list
   (`select_item`). Without them GA4 cannot say which listings sell, or how
   many shoppers see results and open none.
2. **The cart** has no `view_cart` and no `remove_from_cart`: GA4 sees tires
   go in but never sees them reviewed or taken out.
3. **The search** is invisible. The home "Search" by size sends no event at
   all; the home filters (`apply_home_filters`) send only *how many* filters
   were applied, and the catalog filters (`filter_apply`) only a text label.
   No report can say which sizes and brands people look for — the demand the
   store buys stock for.

(The consultant also saw `add_to_cart`, `begin_checkout` and
`add_shipping_info` without `currency`, `value` or `items`. That is the
production site running the code from before 040: 040 already sends them
complete, and publishing it fixes that. Not part of this feature.)

This serves the mission's measure of success — knowing what shoppers look for
and where they drop — and keeps the store's analytics rules: no personal
data, GA4 when the visitor consents and Vercel Analytics always.

## User stories

- As the **SEO / analytics consultant**, I want **GA4's recommended list,
  cart and search events with product data**, so that **the standard
  ecommerce reports (item list performance, cart-to-purchase, search terms)
  fill in without custom work**.
- As **Mr. Goma**, I want **to know which sizes, brands and conditions people
  search for**, so that **I buy and price stock on real demand**.
- As **Mr. Goma**, I want **to see which listings lead to a tire page and
  which tires are removed from carts**, so that **I can tell listing problems
  from price problems**.

## Scope

- **In:**
  - `view_item_list` and `select_item` on the tire listings: `/tires`,
    `/tires/new`, `/tires/used`, and the AI chat's set cards (044).
  - `view_cart` and `remove_from_cart` in the cart drawer and on `/checkout`.
  - GA4's `search` event for the home search by size.
  - The size (width, profile, rim), brand and condition as their own
    parameters on the home filters and the catalog filters.
  - Items in 040's format: id, name, brand, category (condition), variant
    (size), price, quantity — plus the list they came from where GA4 expects
    it.
- **Out:**
  - Publishing 040 to production, and validating `purchase` in a test
    environment (a deploy and a test, no code).
  - GA4 configuration (custom dimensions, reports, audiences) — the
    consultant's side; this feature lists the parameter names they need.
  - Promotions (`view_promotion`, `select_promotion`), wishlists, refunds.
  - The dashboard (staff) surfaces.

## Functional requirements

- **FR1 — `view_item_list`:** each time a listing shows a **new result** —
  first load, another page, a filter or sort change — GA4 receives the list's
  id and name and **every tire shown** (20 per page today), each with its
  position (D1). The same result shown again (a re-render, coming back to it)
  is not sent twice in a row.
- **FR2 — `select_item`:** **any click that opens a tire's page from a
  listing** — photo, title, "View" or any link of the card — sends
  `select_item` with that tire, the list and its position (D2). The card's
  "Add to Cart" is not a selection: it stays `add_to_cart`.
- **FR3 — Lists named consistently:** fixed ids and names: `catalog`
  ("All tires", `/tires`), `new_tires` (`/tires/new`), `used_tires`
  (`/tires/used`), `brand_tires` ("Brand: {brand}", `/tires/brands/…`),
  `size_tires` ("Size: {size}", `/tires/size/…`) and `chat_sets` (AI chat set
  cards). The brand and size pages share the listing with the others; left
  unnamed they would be invisible in the list report.
- **FR4 — `view_cart`:** when the shopper **opens the cart drawer** with
  tires, GA4 receives the whole cart with value and currency. `/checkout`
  keeps sending only `begin_checkout` (D3).
- **FR5 — `remove_from_cart`:** when **the shopper** removes a tire, a whole
  set, or presses "Remove the {city} tire" at checkout, GA4 receives the
  tires removed with their value. A tire the site removes because it sold is
  not reported as a removal (D4).
- **FR6 — `search`:** GA4's `search` event, once per search (never per
  keystroke), for: the home search by size, the size selectors on `/tires`
  when a size is applied, and the home search by text (D5). Only a **change
  of size** is a new search: choosing a brand or condition in the `/tires`
  filters with a size already set is a filter (`filter_apply`), not a search.
  The home text search accepts only a full size (`225/45/17`), so it reports
  like the size search. The event carries a readable `search_term`
  (`225/45R17`, or a partial size such as `225/45`) and `tire_width`,
  `tire_profile` and `tire_rim`; `tire_brand` and `tire_condition` when
  chosen.
- **FR7 — Filters with their values:** `apply_home_filters` carries
  `tire_brand` (brands, comma-separated) and `tire_condition`; `filter_apply`
  carries `filter_group` and `filter_value` (e.g. `brand` / `Michelin`). The
  existing count and label stay, so current reports keep working (D6).
- **FR8 — One shape everywhere:** every tire in these events is described
  exactly as in 040's events (same id, name, brand, category, variant), so a
  tire can be followed from the list to the purchase.
- **FR9 — No personal data:** no parameter holds a name, email, phone,
  address or payment detail. The text search term is the only free text; it
  is cut to 100 characters (GA4's limit).
- **FR10 — No duplicates:** each event fires once per action.

## Acceptance criteria (testable)

- [ ] **AC1:** Given `/tires` showing 20 tires, then one `view_item_list`
      arrives with `item_list_id` `catalog`, `item_list_name` "All tires" and
      the 20 tires in order, positions 1–20, in 040's item format.
- [ ] **AC2:** Given the shopper moves to page 2, or applies a filter or a
      sort, then a new `view_item_list` arrives with the new tires (positions
      continue from the page: 21–40 on page 2); given the same result is
      rendered again, nothing new is sent.
- [ ] **AC3:** Given the shopper opens the third tire of `/tires/used` by its
      photo, or by its title, then `select_item` arrives with that tire,
      `used_tires` and position 3; pressing the card's "Add to Cart" sends
      `add_to_cart`, not `select_item`.
- [ ] **AC4:** Given the chat shows 3 set cards and the shopper opens the
      second, then the cards were reported as one `chat_sets` list and
      `select_item` arrives with the second set's tires at position 2.
- [ ] **AC5:** Given a cart with 3 tires, when the shopper opens the cart
      drawer, then `view_cart` arrives with the 3 tires, `value` = their sum
      and `currency` = `USD`; opening `/checkout` sends `begin_checkout` and
      no `view_cart`.
- [ ] **AC6:** Given a cart with a set of 4, when the shopper removes one
      tire, then `remove_from_cart` arrives with that tire and its price;
      when they remove the whole set, it arrives once with the 4 tires; when
      they press "Remove the Orlando tire" at checkout, it arrives with that
      tire.
- [ ] **AC7:** Given a tire in the cart sold meanwhile and the site removes
      it, then no `remove_from_cart` is sent.
- [ ] **AC8:** Given the home search with 225 / 45 / 17, when the shopper
      presses Search, then `search` arrives with `search_term` `225/45R17`,
      `tire_width` 225, `tire_profile` 45, `tire_rim` 17; given only 225 / 45,
      `search_term` `225/45`; given a size applied on `/tires`, the same
      event; given the text search `225/45/17`, the same as the size
      search; given a size already set on `/tires` and the shopper applies
      the brand Michelin, no new `search` (only `filter_apply`).
- [ ] **AC9:** Given the home filters with brands Michelin and Pirelli and
      condition Used, when applied, then `apply_home_filters` carries
      `tire_brand` "Michelin,Pirelli", `tire_condition` "used" and still its
      count.
- [ ] **AC10:** Given the catalog filter "Brand: Michelin", then
      `filter_apply` carries `filter_group` `brand`, `filter_value`
      `Michelin`, and still its label `brand:Michelin`.
- [ ] **AC11:** Given any of these events, then no parameter holds a name,
      email, phone, address or payment detail, and items have exactly 040's
      keys plus `item_list_id`, `item_list_name` and `index` where GA4
      defines them.
- [ ] **AC12:** Given a visitor who declined cookies, then GA4 receives
      nothing and Vercel Analytics receives the event's flat summary, as
      with 040's events.
- [ ] **AC13:** Given `/tires/brands/michelin` and `/tires/size/225-45-17`,
      then their `view_item_list` carry `brand_tires` / "Brand: Michelin" and
      `size_tires` / "Size: 225/45/17".

## Non-functional / constraints

- **Performance:** no measurable cost on the catalog (the busiest pages); no
  growth of the shared JS budget of every page beyond a few hundred bytes.
- **Analytics rules (`tech-stack.md`):** ecommerce events through the one
  ecommerce path that carries items (040), never through `data-track`;
  non-ecommerce clicks through `data-track`; consent read only through
  `consent.ts`; nothing personal; event names are what happened.
- **GA4 limits:** at most 200 items per event; parameter values cut at 100
  characters.
- **Accessibility and behaviour:** no visible change to any page.

## Decisions (owner, 2026-11-11)

- **D1:** `view_item_list` on every new result (load, page, filter, sort),
  with all tires shown; an identical result is not resent.
- **D2:** Any link that opens the tire's page from a card is a
  `select_item`; the card's Add to Cart is not.
- **D3:** `view_cart` only when the cart drawer opens; `/checkout` keeps
  `begin_checkout` alone.
- **D4:** `remove_from_cart` only for the shopper's own removals (including
  "Remove the {city} tire"); tires removed because they sold are not.
- **D5:** `search` for the home search by size, the size selectors on
  `/tires` and the home text search; not for the AI chat (it has its own
  events).
- **D6:** Parameter names `tire_width`, `tire_profile`, `tire_rim`,
  `tire_brand`, `tire_condition`, `filter_group`, `filter_value`; listed in a
  note for the consultant to register as custom dimensions.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
