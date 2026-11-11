# Spec — Sold and removed tire pages

> Feature: `045-sold-tire-pages` · Status: Implemented · Created: 2026-11-10
> Roadmap: fix found while reviewing 043 · Branch: `feat/045-sold-tire-pages`
> (stacked on `feat/043-visitor-city`: it reuses 043's `closestMatch`)

## Why — problem & value

A tire page stays reachable after the tire sells (features 003 and 019): old
links, shares and search results land on it, it says "Not available" and offers
WhatsApp. Reviewing tire #458561 (sold and trashed since 2026-10-01) showed
three defects:

1. Its structured data tells Google **`InStock`** — hard-coded for every tire.
   A search result can advertise a sold tire as in stock, against the mission's
   "transparency over hiding".
2. Tires **moved to the trash without being sold** are still published as "Not
   available" pages.
3. A shopper who lands on a sold tire gets nothing but WhatsApp, while the shop
   often has the same tire in stock.

## User stories

- As a **shopper from a search result**, I want **a sold tire to say it is
  sold, everywhere**, so that **I am not misled**.
- As a **shopper on a sold tire**, I want **a link to the same tire in
  stock**, so that **I can still buy it in one tap**.
- As **Mr. Goma**, I want **trashed tires off the site**, so that **removed
  records are not published**.

## Scope

- **In:** schema.org availability per tire; trashed tires as "not found";
  "N like this in stock" on sold tire pages.
- **Out:** changing indexing — sold pages **stay indexed** (owner's decision,
  2026-11-10); redirects; the catalog and feed (already exclude sold tires).

## Functional requirements

- **FR1:** The tire page's Product structured data says
  `https://schema.org/SoldOut` for a sold tire and `InStock` otherwise.
- **FR2:** Sold tire pages keep `index, follow` (decision D1).
- **FR3:** A tire in the trash **that is not sold** is treated like an unknown
  id: the "Tire Not Found" page with `noindex`, and no structured data. Sold
  tires keep their page (see D2).
- **FR4:** A sold tire page shows, near "Not available", "We have N like this
  in stock →" linking to the closest match (same brand, model, size, run-flat
  and condition; any tread; any city — 041/043 order). Nothing when there is
  none or the lookup fails.
- **FR5:** A sold tire shows **no price** — not on the page (nor the "Free
  Shipping" badge), not in its title or description, not in its structured
  data. Sold records often hold 0 ("$0"). "Not available" takes the price's
  place (D3).

## Acceptance criteria (testable)

- [ ] **AC1:** Given a sold tire, then its JSON-LD offer availability is
      `https://schema.org/SoldOut`; given a tire for sale, `InStock`.
- [ ] **AC2:** Given a sold tire page, then robots stays `index, follow`.
- [ ] **AC3:** Given a trashed tire that never sold, then the page is "Tire Not
      Found", `noindex`, with no Product JSON-LD; given a sold tire (also
      trashed), then its page stays, with `SoldOut`.
- [ ] **AC4:** Given a sold tire with matches in stock, then the page links to
      the closest one with the count; with none, nothing is added.
- [ ] **AC5:** Given a tire for sale, then nothing changes on its page.
- [ ] **AC6:** Given a sold tire, then no price appears on the page, in the
      title, the description or the JSON-LD offer.

## Decisions

- **D1:** Sold pages stay indexed, with `SoldOut` (owner, 2026-11-10).
- **D2 (revised during implementation):** selling a tire also trashes it — on
  2026-11-10 all 19,387 sold records had `Trash = 1`. So the trash hides only
  tires that are **not** sold (~1,080 records); sold tires keep their indexed
  `SoldOut` page per D1.
- **D3:** Hide the price of a sold tire everywhere (owner, 2026-11-10). The
  offer keeps `SoldOut` without `price`; Search Console may flag those offers
  as incomplete, which only costs the rich result of a page that sells nothing.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
