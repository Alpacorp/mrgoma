# Spec — Shop by your city (Miami or Orlando)

> Feature: `043-visitor-city` · Status: Implemented, reduced by D8 (Preview geo check pending) · Created: 2026-11-10
> Roadmap: Backlog `043` (follows 041) · Branch: `feat/043-visitor-city`

## Why — problem & value

Mr. Goma has seven stores in two cities, Miami and Orlando, and every used tire
is one physical unit sitting in one of them. Since feature 041 the city matters
to the shopper in three concrete ways:

- **Sets are built per city.** A Miami shopper looking at an Orlando tire sees
  "We have 12 more of this tire in Orlando" — true, but useless if they will
  pick up in Miami, and they are never told that the same tire may exist in
  Miami.
- **Pickup is per city.** At checkout the shopper picks a store from a list of
  seven, though only the stores of the tires' city are valid — and nothing
  suggests the store nearest to them.
- **Nothing on the site knows where the shopper is.** Every visitor is treated
  as if they could be anywhere, so the shopper does the sorting in their head.

Knowing the visitor's **approximate city** — and letting them change it in one
tap — turns those dead ends into help: "This tire is in Orlando. We have 3
like it in Miami", the nearest store preselected at checkout. It serves the
mission's "frictionless search" and "trustworthy closing" pillars without
asking the shopper anything.

The location is approximate (from the network, not GPS), never stored, and
never changes what search engines see.

## User stories

- As a **Miami shopper**, I want **the site to assume Miami and say so**, so
  that **sets and pickup suggestions fit where I actually am**.
- As a **shopper the site guessed wrong** (or who shops for someone else), I
  want **to change the city in one tap and have it remembered**, so that **the
  wrong guess never gets in my way**.
- As a **shopper looking at a tire in the other city**, I want **to be told if
  the same tire is available in my city**, so that **I can pick up close to
  home instead of giving up**.
- As a **shopper choosing store pickup**, I want **the store nearest to me
  preselected (when my tires are in my city)**, so that **checkout takes one
  step less**.
- As a **shopper outside Florida**, I want **nothing to change for me**, so
  that **delivery-only shopping stays as simple as today**.
- As **Mr. Goma**, I want **search engines to see the same page as everyone**,
  so that **personalization never risks the site's ranking**.

## Scope

- **In:**
  - **Approximate city** from the visitor's network location: Miami area,
    Orlando area, or none (anywhere else, or unknown).
  - ~~City indicator with "change"~~ — **removed after the implementation
    review (D8)**: the city is used silently, never shown as a setting.
  - **Tire page, other city:** when the tire is in the other city than the
    visitor's, say so and, if matching tires exist in the visitor's city, offer
    a link to them.
  - **Checkout pickup:** preselect the store nearest to the visitor, only among
    the stores valid for the cart (041 city rule), and only when such a store
    exists.
  - **Privacy:** a short mention in the privacy policy.
  - Analytics on the "same tire in your city" link (no
    location data beyond the city name).
- **Out:**
  - **Browser GPS / precise location** (only ever on an explicit request — not
    in v1).
  - **Catalog ranking or filtering by city** (D1) — the catalog stays one
    cached page for everyone; a visible "near me" option can come later.
  - **Different content for search engines or different HTML per city**
    (cloaking), and city-specific URLs.
  - **Storing the location** on our side (server logs aside) or in analytics as
    anything finer than the city.
  - Prices, promotions or stock rules that differ by city.
  - Anything from 042 (not approved).

## Functional requirements

- **FR1 — City guess.** A visitor whose network location is in the Miami area
  is treated as "Miami", in the Orlando area as "Orlando", and anywhere else or
  unknown as "no city". The rule (D2): if the visitor's approximate position is
  **within 60 miles of one of our stores**, the city is that store's city;
  otherwise "no city" (e.g. Tampa, Fort Myers, Jacksonville, out of state).
- **FR2 / FR3 — Withdrawn (D8).** The visitor no longer picks or sees a
  "shopping city". On a site where every tire is one unit in one place, the
  cart's tires decide pickup; a visible city setting promised a filtering the
  shop does not do and contradicted the cart at checkout.
- **FR4 — Same page for everyone.** The page HTML and its cached copies are the
  same for every visitor and for search engines; city-dependent parts are
  added in the browser after the page loads, without moving the content above
  them (no layout shift).
- **FR5 — Tire in the other city.** Every tire page states, for every visitor
  and identically, where the tire is ("Located in Orlando") next to its key
  specs. When the tire's city differs from the visitor's city, the page adds — if the
  visitor's city has tires of the same brand, model and size — links to them
  with their count ("We have 3 like this in Miami"). "Like this" (D6) is 041's
  rule **without the tread limit**: same brand, model, size, run-flat type and
  condition (new/used), any tread. The link leads to the **page of the best
  match** — tread closest to this tire, then unpatched, then cheaper (041's
  order) — where the shopper can build a set (D5). When there is none, it says
  nothing more. The tire's own "Build your set" block (041) is unchanged.
  Warehouse stock counts as Miami, as in 041 (D7).
- **FR6 — Nearest pickup store.** At checkout, when the shopper chooses store
  pickup and the cart's tires are in the visitor's city, the store nearest to
  the visitor's approximate location is preselected; the shopper can change it.
  With mixed cities, tires in the other city, or no visitor city, nothing is
  preselected (today's behavior).
- **FR7 — No location kept.** We do not store the visitor's location; the only
  thing remembered is the city (Miami / Orlando / none) in the visitor's own
  browser. Analytics receive at most the city name.
- **FR8 — Privacy policy.** The privacy policy states that the site estimates
  the visitor's city from their network to show local stores and stock, that
  it is not stored, and how to change it.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a first visit from a network located within 60 miles of a
      Miami store, then the site uses Miami as the estimated city (for FR5 and
      FR6) without showing any city setting; within 60 miles of an Orlando
      store, Orlando.
- [ ] **AC2:** Given a first visit located more than 60 miles from every store
      (e.g. Tampa, or out of state) or unknown, then no city is assumed and
      checkout and the tire page behave as today — apart from the "Located in
      {city}" line every visitor sees.
- [ ] **AC3:** ~~Visitor changes the city~~ — withdrawn with FR2/FR3 (D8).
- [ ] **AC4:** Given a Miami visitor on the page of an Orlando tire whose brand,
      model and size exist in Miami, then the page says the tire is in Orlando
      and offers a link "We have N like this in Miami", where N counts Miami
      tires (Warehouse included) of the same brand, model, size, run-flat type
      and condition at any tread, and the link opens the page of the one with
      the closest tread (then unpatched, then cheaper).
- [ ] **AC5:** Given the same visitor on an Orlando tire with no match in Miami,
      then the page only says the tire is in Orlando.
- [ ] **AC6:** Given a Miami visitor whose cart has only Miami tires, when they
      choose store pickup, then the Miami store nearest to them is preselected
      and can be changed.
- [ ] **AC7:** Given a Miami visitor whose cart has only Orlando tires (or mixed
      cities), or a visitor who chose a city without any network estimate (e.g.
      out of state, picked Miami), or who chose a city different from the
      estimate, then no store is preselected and the 041 rules apply
      unchanged.
- [ ] **AC8:** Given any two visitors from different cities (and a search
      engine crawler), when they request the same page, then they receive the
      same HTML; the city-dependent parts appear only after load and cause no
      visible layout shift (CLS unchanged) — including the header indicator.
- [ ] **AC9:** Given the site, then nothing stores the visitor's location on our
      side, and analytics events carry at most the city name.
- [ ] **AC10:** Given the privacy policy, then it explains the city estimate, that
      it is not stored, and how to change it.
- [ ] **AC11:** ~~City chooser accessibility~~ — withdrawn with the chooser
      (D8); the new controls (set panel, checkout method) keep WCAG 2.1 AA.
- [ ] **AC12:** Given the "same tire in your city" link is used, then an
      analytics event is recorded with the city name only.
- [ ] **AC13:** Given the network location is unavailable (local development,
      a privacy relay, a VPN), then the site behaves as "no city" and nothing
      fails.
- [ ] **AC14:** Given the catalog `/tires`, then its order and content are the
      same for every city (no ranking or filtering by city in v1).

## Non-functional / constraints

- **SEO:** identical HTML for all visitors and crawlers (FR4); no redirects by
  city; no city in URLs.
- **Performance:** no added server rendering cost for cached pages (they stay
  cached); the extra lookup for "same tire in your city" happens only on tire
  pages of the other city, after load, and is cached; client JS growth stays
  within the budget (~48 KB headroom of 680 KB).
- **Bots:** the extra lookup must not become a new crawl target (the catalog's
  2026-09 bot load is the precedent).
- **Accessibility:** WCAG 2.1 AA; no layout shift when the city-dependent parts
  appear.
- **Privacy:** approximate city only, never stored by us, changeable at any
  time, mentioned in the privacy policy.
- **Language:** US English, plain; "Shopping in Miami" rather than technical
  wording.

## Decisions (clarified 2026-11-10)

- **D1 — Catalog:** no ranking or filtering by city in v1.
- **D2 — Areas:** within 60 miles of a store → that store's city; otherwise
  no city.
- **D3 — Indicator:** in the site header on every page; its exact UX/UI is
  worked out in `/plan` with `modern-web-guidance` (phones first, no layout
  shift).
- **D4 — Remembering the choice:** 90 days, functional preference, not tied to
  the cookie banner; stated in the privacy policy.
- **D5 — "Like this" link:** opens the best matching tire's page in the
  visitor's city (041 preference order); no new pages.
- **D6 — "Like this" rule:** same brand, model, size, run-flat and condition;
  any tread.
- **D7 — Warehouse:** counts as Miami, as in 041.
- **D8 — No visible city (2026-11-10, after seeing it implemented):** the
  header chip / phone strip and the manual choice are removed. A shopper who
  picked Orlando saw Miami stores at checkout for a Miami cart — correct, but
  contradictory. The estimate stays, silent, for the "like this in your city"
  link and the nearest-store preselection; "Located in {city}" stays for all.

## Open questions

None blocking.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
