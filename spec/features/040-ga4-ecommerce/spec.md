# Spec — GA4 ecommerce measurement

> Feature: `040-ga4-ecommerce` · Status: Implemented (production check pending) · Created: 2026-11-10
> Roadmap: Track 2 — closes the GA4 half of **S2.4** (follow-up flagged in
> `015-vercel-event-tracking/plan.md` → Risks) · Branch: `feat/040-ga4-ecommerce`

## Why — problem & value

The client's SEO/analytics consultant is building a dashboard to answer one
question: **how many purchases, and how much revenue, does the site produce —
especially from organic search?** Today GA4 cannot answer it.

What the consultant sees in GA4, and what the code confirms (audit 2026-11-10):

| GA4 event           | Status today                                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `view_item`         | **Never sent.** Not implemented.                                                                                                                                                   |
| `add_to_cart`       | Sent, but as a generic click: a text label only — **no product list, value or currency**, so GA4's ecommerce reports ignore it. The add-to-cart on the **tire detail page** is not tracked at all. |
| `begin_checkout`    | Sent, same problem: no products, no value.                                                                                                                                         |
| `add_shipping_info` | Sent, same problem. Also fires on the button press even when the order is then rejected (e.g. a tire sold in the meantime).                                                       |
| `add_payment_info`  | **Never sent, on purpose.** Card details are typed on Stripe's own page, which the site cannot observe.                                                                            |
| `purchase`          | **Never reaches GA4.** It is recorded server-side in Vercel Web Analytics only (a known gap left by feature 015).                                                                  |

Meanwhile the business _is_ selling: Vercel Web Analytics recorded **~17 paid
card orders (~$3,800) between August and 10 November 2026**. GA4 shows zero. The
primary funnel the mission says we steer by ("search → detail → checkout,
tracked in GA4") has no detail step and no end.

Fixing it serves the mission directly: _trust/correctness_ first — the numbers
the business decides on must be true — and the _primary funnel_ success metric.

## User stories

- As the **client's analytics consultant**, I want GA4 to record every step of
  the purchase journey with the products involved, so that I can build a funnel
  and revenue dashboard without guessing.
- As the **business owner**, I want to see how many orders and how much revenue
  come from each acquisition channel (organic, direct, paid, referral), so that I
  can judge whether the SEO work pays off.
- As the **business owner**, I want to know which tires (brand, size, condition)
  are viewed, added and bought, so that I can see what demand converts.
- As a **shopper**, I want none of this to slow down or interfere with buying,
  and I want my cookie choice to be respected.

## Scope

- **In:**
  - `view_item` when a shopper opens a tire detail page.
  - Product data (`items`, `value`, `currency`) on `add_to_cart`,
    `begin_checkout`, `add_shipping_info`, `add_payment_info` and `purchase`.
  - `add_to_cart` from **every** add-to-cart button: the catalog card in `/tires`
    List view (its desktop and its mobile button) and the detail page. The
    catalog's Table view has no add-to-cart button, so there is nothing to track
    there.
  - `add_payment_info` at the closest moment the site can honestly observe.
  - `purchase` in GA4 with order id, revenue, tax, shipping and products, counted
    once per order.
  - Keeping the parallel Vercel Web Analytics reading working (same event names).
  - A written test procedure (local with Stripe test mode, then production) and
    its results, plus a short note for the consultant explaining what each event
    means and its known limits.
- **Out:**
  - Building the consultant's dashboard (Looker Studio or similar) — theirs.
  - GA4 property configuration beyond what the events need (audiences, Search
    Console linking, custom reports). Confirming the property currency (USD) and
    marking `purchase` as a key event **are in scope** (D7, AC12).
  - Changing the cookie banner or consent rules.
  - Google Tag Manager migration.
  - `view_item_list`, `select_item`, `remove_from_cart`, `view_cart`,
    refunds — candidates for a later slice.
  - Payment and purchase events for the WhatsApp ordering path (disabled while
    card payment is on). If it is used, an accepted order still reports
    `add_shipping_info` (FR5) and keeps its own `whatsapp_order_sent`, but never
    `add_payment_info` or `purchase`.

## Functional requirements

- **FR1 — view_item.** Opening a tire detail page reports `view_item` once per
  page view with that tire as the single item, its price as `value` and the
  store currency. This includes the detail page being the first page of the
  visit (e.g. arriving from Google) and moving from one detail page to another
  without a full reload.
- **FR2 — Product description.** Every ecommerce event describes each tire the
  same way: id, name (the full listing title the shopper sees, e.g. "Used
  Michelin Defender 225/65R17"), brand, condition (new/used), size, unit price and
  quantity. The tire id is the same one used in the catalog, the order records
  and Stripe, so a product can be followed from view to sale.
- **FR3 — add_to_cart.** Every add-to-cart action on the site reports
  `add_to_cart` with the tire added, its value and currency. A press on a button
  that does nothing (tire already in cart) is not reported.
- **FR4 — begin_checkout.** Starting checkout reports `begin_checkout` with the
  full cart contents, cart value and currency.
  It is reported **when the checkout page opens with a non-empty cart**, however
  the shopper got there (cart drawer button, direct link, back navigation) — and
  no longer on the drawer button itself, so one visit is never counted twice. It
  is not reported on the confirmation page or when the cart is empty.
- **FR5 — add_shipping_info.** Reports when the shopper has completed the
  delivery/pick-up step, with cart contents, value, currency and the fulfilment
  choice (delivery or pick-up) as the shipping tier. It is reported **only once
  the server accepts the order** (just before the hand-off to payment), not on
  the button press: a rejected attempt (tire sold meanwhile, payment not
  configured, network error) reports nothing. This deliberately breaks
  comparability with feature 015's baseline (which anchored on the press); the
  date of the change is recorded so the series can be read across it.
- **FR6 — add_payment_info.** Since card entry happens on Stripe's page, it is
  reported at the last moment the site sees: the order has been accepted and the
  shopper is being sent to the payment page — immediately after
  `add_shipping_info`. Carries cart contents, value, currency and the payment
  type (card). The consultant's note states plainly that it means "sent to the
  card form", not "card details entered". Not reported for the WhatsApp path.
- **FR7 — purchase.** A paid order reports `purchase` to GA4 with a unique
  transaction id, total revenue, tax, shipping, currency and the purchased tires.
  The synthetic tax line is never reported as a product.
- **FR8 — Once per order.** Reloading, revisiting or sharing the confirmation
  page never produces a second purchase for the same order.
- **FR9 — Channel attribution.** A purchase is attributed in GA4 to the same
  session/channel as the visit that produced it, so revenue by channel (incl.
  Organic Search) is reportable.
  **Decision:** `purchase` is sent to GA4 **from the shopper's browser on the
  confirmation page**, so it joins the visit's own session and channel. Accepted
  limits: it is lost when the shopper declined cookies, blocks analytics or
  closes the tab before the confirmation loads; Vercel's server-side count
  remains the reference for "how many orders really happened". A server-side
  GA4 send (Measurement Protocol) is out of scope — a candidate follow-up if the
  measured gap proves material.
- **FR9a — First page of a load.** Returning from Stripe is a full page load, and
  a detail page is often the landing page. Events raised in those first moments
  must not be lost because analytics is still starting up: they are delivered
  once it is ready (provided consent has been given).
- **FR10 — Consent.** GA4 receives nothing from a visitor who has not accepted
  analytics cookies, exactly as today. Vercel Web Analytics continues to run
  regardless, as decided in feature 015.
- **FR11 — Vercel parity.** Each event keeps reaching Vercel Web Analytics under
  the same name, with flat summary properties (e.g. value, currency, item
  count) since Vercel cannot store product lists. The server-side Vercel
  `purchase` stays the reference count of orders.
- **FR12 — No personal data.** No event carries the shopper's name, email,
  phone, address or payment details.
- **FR13 — Test orders stay out of production data.** Purchases made in Stripe
  test mode never land in the production GA4 reports.
  **Decision:** local and Stripe-test-mode runs send to the production GA4
  property **in debug mode**, so they appear in DebugView for verification and
  stay out of the standard reports. Live production traffic is never in debug
  mode. _Note (2026-11-10):_ the exclusion itself is done by GA4's
  **"Developer Traffic" data filter**, which has to be **Active** — it was
  missing, so the first two local test purchases reached the reports. It was
  created that day; see `results.md`.

## Acceptance criteria (testable)

- [ ] **AC1:** Given cookies accepted, when a shopper opens a tire detail page,
      then GA4 DebugView shows one `view_item` with one item whose id, name,
      brand, condition, size and price match the page, and `value` = that price.
- [ ] **AC2:** Given cookies accepted, when a shopper adds a tire from (a) the
      catalog card's desktop button, (b) the catalog card's mobile button and
      (c) the detail page, then each produces one `add_to_cart` with that item,
      `value` and `currency`.
- [ ] **AC2b:** Given a shopper arriving from a search engine directly on a tire
      detail page (first page of the visit, cookies previously accepted), then
      `view_item` is recorded; and moving to a second detail page without a
      reload records a second `view_item` for the second tire.
- [ ] **AC3:** Given a tire already in the cart, when the shopper presses its
      (disabled) add button, then no `add_to_cart` is sent.
- [ ] **AC4:** Given a cart with two tires, when the checkout page opens (via the
      cart drawer button **or** by typing `/checkout`), then exactly one
      `begin_checkout` is sent, listing both items, with `value` equal to the
      cart subtotal. Given an empty cart, nothing is sent.
- [ ] **AC5:** Given the delivery or pick-up step is completed and the server
      accepts the order, then `add_shipping_info` is sent with the items, value
      and `shipping_tier` = `delivery` or `pickup`.
- [ ] **AC6:** Given a tire that sold meanwhile (server answers 409), or the
      payment step fails for any other reason, when the shopper proceeds, then
      neither `add_shipping_info` nor `add_payment_info` is sent.
- [ ] **AC7:** Given the order is accepted, when the shopper is redirected to
      Stripe, then `add_payment_info` is sent with `payment_type` = card before
      the page leaves, and it appears in DebugView after `add_shipping_info`.
- [ ] **AC8:** Given a completed Stripe test payment run locally, when the
      confirmation page loads (a full page load coming back from Stripe), then
      GA4 DebugView shows one `purchase` with `transaction_id`, value
      equal to the amount charged, tax, shipping, currency and the tires bought —
      and no item for the tax line; the `transaction_id` matches the Stripe
      reference shown on the page.
- [ ] **AC9:** Given that confirmation page is reloaded twice, then GA4 still
      shows a single purchase for that `transaction_id`.
- [ ] **AC10:** Given cookies declined, when the whole journey is completed,
      then no request reaches Google Analytics, and Vercel still records the
      events.
- [ ] **AC10b:** Given a payment that is not settled (Stripe returns the shopper
      but the session is not `paid`), or the shopper cancels on Stripe, then no
      `purchase` is sent.
- [ ] **AC10c:** Given a run in local or Stripe-test mode, then every event is
      sent in debug mode; given the live production site, none is.
- [ ] **AC11:** Given any ecommerce event, then its payload contains no email,
      name, phone or address.
- [ ] **AC12:** Given a production purchase after release, then within 48 h it
      appears in GA4's Monetization → Ecommerce purchases and Traffic acquisition
      reports with revenue and channel, and the order count over a following
      period is documented against Vercel's server-side count (expected lower,
      ratio recorded). The property's currency is confirmed as USD and
      `purchase` is marked as a key event (done by Alejo, who administers the
      property).
- [ ] **AC13:** The consultant receives a one-page note: each event, when it
      fires, its fields, and known limits (consent gating, ad-blockers,
      add_payment_info anchor, add_shipping_info anchor change date).

## Non-functional / constraints

- **Never affect the purchase.** Measurement can fail silently but must never
  block, delay noticeably or break adding to cart, checkout, the redirect to
  Stripe or the confirmation page. One bounded exception: the redirect to Stripe
  may wait **up to 0.6 s** for `add_payment_info` to be acknowledged, only for
  visitors who accepted analytics, behind the existing "Redirecting to
  payment…" loading screen.
- **Performance:** no measurable regression in INP on add-to-cart and checkout,
  or LCP on the detail page (the detail page is server-rendered for speed — keep
  it that way).
- **Consent and privacy:** existing consent gating and withdrawal (features
  015/016) keep working unchanged; privacy policy wording stays accurate.
- **Comparability:** event names unchanged (they are GA4's recommended names)
  and retired names (`place_order`, `quote_submit`) stay retired. Two events
  **change their moment** on the release date, which is recorded in the code,
  this spec and the consultant note so both GA4 and Vercel series can be read
  across it: `begin_checkout` (cart button press → checkout page opened, D4)
  and `add_shipping_info` (button press → order accepted by the server, D3).
- **Honest numbers:** GA4 will undercount versus real orders (consent +
  ad-blockers; measured in Aug 2026 at roughly 1 visitor in 5). The spec does
  not promise GA4 = Stripe; it promises GA4 is correct for what it sees and the
  gap is documented.

## Decisions (clarified 2026-11-10)

| #   | Question                         | Decision                                                                 |
| --- | -------------------------------- | ------------------------------------------------------------------------ |
| D1  | How `purchase` reaches GA4       | Browser, on the confirmation page; Measurement Protocol deferred         |
| D2  | `add_payment_info` anchor        | When the accepted order is handed off to Stripe                          |
| D3  | `add_shipping_info` anchor       | Only after the server accepts the order (moved from the button press)    |
| D4  | `begin_checkout` trigger         | Checkout page opens with a non-empty cart (any route in), not the button |
| D5  | Test traffic                     | Production property in debug mode for local / Stripe test runs           |
| D6  | `item_name`                      | Full listing title the shopper sees                                      |
| D7  | GA4 admin (USD, key event)       | Alejo has access and does it during the production check                 |

## Open questions

None blocking.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
