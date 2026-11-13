# Spec — Tires as they appear on Stripe Checkout

> Feature: `048-stripe-line-items` · Status: Implemented (owner review pending) · Created: 2026-11-13
> Roadmap: Track 2 — Payments go-live (Stripe), before S2.6 (live smoke test) ·
> Branch: `feat/048-stripe-line-items`

## Why — problem & value

The owner opened Stripe's payment page in production from a phone on
2026-11-13 and saw a set of four tires like this:

- every tire with a **broken image** (a "?" icon);
- names in the inventory's internal format —
  "(264890) | PIRELLI | SCORPION TM MS LR XL | …" — cut off on a phone;
- prices in **Colombian pesos** (COP) instead of dollars.

The payment page is the last thing a buyer sees before paying. The mission's
_trustworthy closing_ pillar says the buyer must know exactly what they pay
for; a page of broken images and codes is the opposite, at the moment trust
matters most.

What was found (2026-11-13):

1. **Images.** 72% of the tires for sale (4,875 of 6,775) have no photo; the
   site then uses its own generic tire image, and that is what Stripe receives.
   Every image served from `www.mrgomatires.com` answers Stripe with a
   security challenge page instead of the image (the site's firewall), so
   Stripe shows a broken icon. A Stripe test session proved it: the site's
   generic image and another image from the site are broken; a real tire photo
   (hosted on the photo supplier's domain) shows correctly.
2. **Names.** The line is named with the inventory's internal text, not the
   way the site and the cart name a tire ("Pirelli Scorpion TM MS LR XL").
3. **Currency.** Stripe's "Adaptive Pricing" shows prices in the visitor's
   local currency by IP and lets them switch to USD. The store sells in the US
   only; a buyer in the US sees USD. The owner pays in dollars either way.

Production still runs the code of PR #201, but this part of the checkout is
the same on `main`: publishing 040–047 does not fix it.

## User stories

- As a **buyer on Stripe's payment page**, I want to see each tire by its
  name, size and condition, so that I know exactly what I am paying for.
- As a **buyer**, I want no broken images on the payment page, so that the
  store looks trustworthy when I pay.
- As **Mr. Goma**, I want the payment page to say what the site says (name,
  size, condition, tread, stock number), so that a buyer and the store talk
  about the same tire.

## Scope

- **In:**
  - The name and the short description of each tire line on Stripe's page.
  - What image a tire line carries: its real photo when it has one, and no
    broken image when it has none.
  - **Option 1 (explored):** a firewall exception, set by the owner in the
    Vercel dashboard, so Stripe can fetch the site's images; this feature
    writes down the exact rule and how to check it, since the firewall cannot
    be read or changed from code.
  - **Option 2 (built):** the code changes above.
- **Out:**
  - Prices, taxes (the 7% pickup tax line), free shipping, and how totals
    are computed — unchanged.
  - The information sent to analytics with each line (feature 040) —
    unchanged.
  - Taking photos for tires without one.
  - The rest of Track 2 (order persistence, receipt, live keys).

## Functional requirements

- **FR1 — A readable name.** Each tire line is named the way the cart names
  it: brand and model ("Pirelli Scorpion TM MS LR XL"), never the inventory's
  internal text with codes and bars.
- **FR2 — A short description.** Under the name, the line says what tells
  this tire apart: size, condition, and for used tires tread, remaining life
  and whether it is patched, plus the stock number ("235/50/19 · Used · 8.6/32
  · 86% life · Patched · Stock #264890"), as the tire page and the cart say
  it (D3). Only what the tire has: a new tire has no tread line, an unknown
  fact is left out.
- **FR3 — Real photos.** A tire with its own photo sends that photo, as today
  (it already shows correctly).
- **FR4 — No broken image (D1, D5).** A tire without a photo shows the
  site's generic tire image, served from a public Vercel Blob store — outside
  the site's firewall — whose address is configured for the checkout. Until
  that address is configured, the line carries no image at all. Never the
  site's own image address, which Stripe cannot fetch.
- **FR5 — Option 1, documented, not applied (D2).** The feature writes down
  the narrowest Vercel firewall rule that would let Stripe fetch the site's
  images (`GET` to `/assets/images/*` only) and a check to run after setting
  it, for the day it is needed. It is **not** set now: with FR4 nothing needs
  it, and the firewall stays as tight as September left it.
- **FR6 — Currency (D4).** Stripe's Adaptive Pricing stays as it is: a buyer
  outside the US may see their local currency and can switch to USD; a buyer
  in the US sees USD; the store is paid in dollars. No change.
- **FR7 — Nothing else changes.** Prices are still set by the server, the
  pickup tax line and free shipping stay, and each line keeps the analytics
  information feature 040 reads after payment.
- **FR8 — No internal data.** No warehouse name or shelf code appears on
  Stripe's page, as today.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a cart with a used Pirelli Scorpion TM MS LR XL
      235/50/19, stock #264890, when the buyer reaches Stripe's page, then the
      line's name is "Pirelli Scorpion TM MS LR XL" (brand in normal case) and
      contains no parentheses, bars or stock number.
- [ ] **AC2:** Given that tire with tread 8.6/32, 86% life and a patch, then
      the line's description reads as FR2 decides, with only the facts the tire
      has.
- [ ] **AC3:** Given a tire with its own photo, then Stripe's page shows that
      photo.
- [ ] **AC4:** Given a tire without a photo and the Blob address configured,
      then Stripe's page shows the generic tire image for it; given the
      address is not configured, the line has no image; in neither case a
      broken image, and never an image address on `www.mrgomatires.com`.
- [ ] **AC5:** Given a pickup order, then the 7% tax line is still there; given
      any order, totals, free shipping and the analytics information per line
      are the same as before this feature.
- [ ] **AC6:** Given the feature's notes, then they hold the exact option-1
      rule (`GET`, `/assets/images/*`) and a one-line check (a non-browser
      request gets the image, not a challenge page), marked as not applied.
- [ ] **AC7:** Given any order, then the checkout session does not change
      Stripe's currency behaviour (no Adaptive Pricing setting is sent).
- [ ] **AC8:** Given any order, then no warehouse name or shelf code reaches
      Stripe.

## Non-functional / constraints

- **Trust first:** what Stripe shows must match what the site and the cart
  show for the same tire.
- **Stripe's limits:** names and descriptions must fit what Stripe shows on a
  phone; images must be publicly fetchable.
- **Security:** any firewall exception is as narrow as possible (paths and
  method) and does not reopen the site to the bot traffic stopped in
  September 2026.
- **Verifiable:** checked on a Stripe test-mode session, phone width included.

## Decisions (owner, 2026-11-13)

- **D1:** A tire without a photo shows a generic tire image hosted outside the
  site's firewall; without that address configured, no image.
- **D2:** The firewall exception (option 1) is documented, not applied.
- **D3:** The description says it all, as the site does: size, condition,
  tread, life, patch, stock number.
- **D4:** Adaptive Pricing stays on.
- **D5:** The generic image lives in a public Vercel Blob store in the team.
  Creating the store and uploading the image is an account action the owner
  approves when it comes.

## Open questions

None.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
