# Spec — Event tracking in Vercel Web Analytics, alongside GA4

> Feature: `015-vercel-event-tracking` · Status: Clarified — ready for `/plan` ·
> Created: 2026-08-04 · Clarified: 2026-08-04
> Roadmap: Backlog (measurement) · Branch: `feat/015-vercel-event-tracking`

## Why — problem & value

The mission says we measure success on one **primary funnel — search → detail →
checkout** — and today that funnel is visible in exactly one place: Google
Analytics 4. That is a single point of failure for the only numbers we steer by.
GA4 is blocked by a large share of ad-blockers, and it only reports for visitors
who accept the cookie banner, so the funnel we look at is a partial sample of an
unknown size. We cannot tell how wrong it is, because we have nothing to compare
it against.

Vercel Web Analytics is already paid for on the Pro plan and its script is
already on every page, but no product event has ever been sent to it. Wiring the
events we already collect into a second, first-party, cookie-free platform gives
us a control reading: two independent counts of the same click. Where they
agree, we can trust the number; where they diverge, the gap itself tells us how
much GA4 is under-reporting.

Two further problems surface once the numbers matter. First, **the two events we
care most about are wrong**: `place_order` and `quote_submit` fire the moment the
button is clicked, whether or not the payment or the form submission ever
succeeded — so every abandoned or failed attempt is currently counted as a
conversion. Second, **anything measured in the browser can be blocked**, and a
purchase is precisely the number that must not be. The server knows when a
payment actually settled and nothing in the browser can suppress that.

None of this changes what GA4 receives. GA4 stays the primary source of truth;
this feature adds a second reading and corrects two counts that are wrong in
both.

## User stories

- As the **business owner**, I want to see clicks on WhatsApp, calls, add-to-cart
  and checkout in the Vercel dashboard, so that I can read the funnel without
  depending on a single provider that ad-blockers can silence.
- As the **business owner**, I want a conversion to be counted only when the
  customer actually completed it, so that the conversion rate I make decisions on
  reflects real orders and real quote requests rather than button presses.
- As the **business owner**, I want purchases counted on the server, so that the
  revenue-bearing number is immune to ad-blockers, browser extensions and people
  closing the tab before the confirmation page renders.
- As a **developer**, I want to keep marking interactive elements the one
  declarative way I already know, so that instrumenting a new button reaches both
  platforms with no extra work and no chance of wiring only one.
- As a **visitor**, I want the privacy policy to accurately name every analytics
  tool the site uses and say which ones run before I accept cookies, so that the
  consent I give (or withhold) is informed.

## Scope

- **In:**
  - Every existing `data-track` interaction reports to **both** GA4 and Vercel
    Web Analytics, from the single place that handles them today.
  - GA4 keeps its exact current behaviour: same event names, same payload, same
    consent gate. This feature must be invisible in the GA4 data.
  - Event properties are adapted to what Vercel accepts, without loss of meaning.
  - `place_order` and `quote_submit` are **retired** and replaced by events named
    for what they actually observe (see _Event vocabulary_ below).
  - A **purchase event sent from the server**, once per real paid order.
  - A distinct, lower-confidence event for orders handed off to WhatsApp, which
    is never counted as a purchase.
  - Privacy policy and cookie-banner copy updated to name both analytics tools
    and state which one runs before consent.
  - A stated, enforced rule that no personal data may travel in an event
    property.
  - Correcting the cookie banner's stale comment (it documents a 30-day
    re-prompt; the intended and actual behaviour is 1 day).

- **Out:**
  - Any change to which elements are instrumented. New `data-track` marks on
    currently untracked elements are a separate piece of work.
  - Any change to GA4 configuration, goals or the GA4 property itself.
  - Vercel Speed Insights (a different product; not installed).
  - Reworking the cookie banner's behaviour or its accept/decline mechanics. Only
    its wording and its stale comment change; the 1-day re-prompt is confirmed
    correct and stays.
  - Dashboards, reports or alerting built on top of the collected events.
  - Server-side reporting to GA4 (Measurement Protocol). The server event goes to
    Vercel only, which is why no transaction identifier is needed anywhere.

## Event vocabulary

The decisions below settle what each event means. Sixteen of the eighteen
existing events are untouched; only the checkout and quote paths change.

The vocabulary is **eighteen** names, not the sixteen a search for literal
`data-track="…"` strings suggests: `ProductImageZoom` computes its name at
runtime and so emits either `tire_image_zoom_in` or `tire_image_zoom_out`
depending on state. Any inventory of tracked events must account for computed
names, or it will silently miss some.

| Event                 | Sent from  | Fires when                                                                                                                                |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `add_shipping_info`   | browser    | The customer submits the checkout form — fulfilment method, and state or store, are complete — and is handed off to the payment provider. |
| `purchase`            | **server** | A payment has settled and the order has been recorded. Once per order.                                                                    |
| `whatsapp_order_sent` | browser    | The order was handed off to WhatsApp because card payment is disabled.                                                                    |
| `generate_lead`       | browser    | The server accepted a quote request.                                                                                                      |
| ~~`place_order`~~     | _retired_  | Counted a button press, not an order.                                                                                                     |
| ~~`quote_submit`~~    | _retired_  | Counted a button press, not a submitted request.                                                                                          |

`begin_checkout` already marks entering the checkout page and is unchanged, so
the funnel reads `add_to_cart → begin_checkout → add_shipping_info → purchase`.

Three of these are GA4's own recommended ecommerce names, which GA recognises as
conversions with no configuration. `add_shipping_info` is used rather than
`add_payment_info` because it is the accurate one: the checkout button is
disabled until fulfilment details are complete, so the click genuinely submits
shipping information — whereas payment information is entered on the payment
provider's own page, which we cannot observe. There is deliberately no
`add_payment_info` event, because we have no honest moment to fire it.

## Baseline — how far apart the two platforms already are

Measured 2026-07-28 → 2026-08-03, same window, both dashboards:

| Measure          | Vercel | GA4           |
| ---------------- | ------ | ------------- |
| Visitors / users | 746    | 139           |
| Page views       | 2,182  | ~219 sessions |

GA4 currently sees roughly **one visitor in five**. Four separate causes stack up
and must not be conflated:

1. **The consent gate** — almost certainly the largest. GA4 fires nothing until a
   visitor accepts the banner, and most never do.
2. **Different definitions of "visitor."** Vercel derives its visitor identifier
   from a salt that rotates daily, so one person visiting on three days counts as
   three; GA4's persistent identifier counts them once. Over a 7-day window this
   structurally inflates Vercel. **This is a counting difference, not
   under-reporting.**
3. **Ad-blockers**, which stop Google and not a first-party endpoint.
4. **Bots** — 16% of Vercel's traffic is from China, implausible for a Miami tire
   shop, and GA4 filters more of that out.

This matters for how the feature is verified. **Event counts will compare far
more cleanly than visitor counts**, because cause 2 vanishes once we are counting
clicks rather than unique people — a click is a click. The ratio between the two
platforms' event counts is therefore the first honest measurement we will have of
how much GA4 under-reports, and it is a deliverable of this feature in its own
right, not merely a side effect.

It also settles D1 after the fact: had we gated the Vercel events behind the same
banner, we would have reproduced GA4's ~19% sample exactly and learned nothing.

**Sanity check for implementation:** for any given event, the Vercel count should
come out **higher** than the GA4 count. If it comes out lower, the fan-out is
dropping events and something is wrong.

### The "before" snapshot, captured 2026-08-04

GA4 → Engagement → Events, **2026-07-07 → 2026-08-03 (28 days)**: **3,730 events
across 496 users, under 16 distinct names.**

A 7-day window was read first and proved actively misleading at these volumes —
two events that show zero over 7 days are non-zero over 28. **28 days is the
baseline; the 7-day figures are kept only where noted, as an illustration of how
much noise a short window carries here.**

GA4's four automatic events account for 3,453 of the 3,730:

| Automatic event   | Events | Users |
| ----------------- | ------ | ----- |
| `page_view`       | 1,403  | 496   |
| `session_start`   | 838    | 496   |
| `user_engagement` | 748    | 308   |
| `first_visit`     | 464    | 464   |

Everything this project instruments is the remaining **277 events — 7.4% of
volume**:

| Our event                | Events | Users |
| ------------------------ | ------ | ----- |
| `add_to_cart`            | 52     | 26    |
| `open_cart`              | 31     | 16    |
| `open_ai_chat`           | 30     | 24    |
| `open_home_more_filters` | 29     | 23    |
| `begin_checkout`         | 24     | 16    |
| `open_whatsapp`          | 24     | 21    |
| `ai_chat_send`           | 23     | 11    |
| `call_store`             | 23     | 17    |
| `apply_home_filters`     | 21     | 17    |
| `place_order`            | 11     | 6     |
| `ai_chat_example`        | 6      | 5     |
| `open_tire_image_zoom`   | 3      | 3     |

3,453 + 277 = 3,730, so this is the complete list.

**The six names that never fired in 28 days:** `quote_submit`,
`clear_home_filters`, `remove_home_filter`, `open_tire_3d`, `tire_image_zoom_in`,
`tire_image_zoom_out`.

### The commerce funnel, as GA4 sees it

By distinct users, over 28 days:

| Step             | Users | Of previous step | Of all visitors |
| ---------------- | ----- | ---------------- | --------------- |
| Any visit        | 496   | —                | 100%            |
| `add_to_cart`    | 26    | 5.2%             | 5.2%            |
| `begin_checkout` | 16    | 62%              | 3.2%            |
| `place_order`    | 6     | 38%              | 1.2%            |
| Paid order       | 0     | 0%               | 0%              |

Zero paid orders is expected, not alarming: card payment is not live yet (Track 2
of the roadmap is entirely unstarted), so `place_order` here counts WhatsApp
hand-offs. `add_to_cart` averages two events per user, consistent with people
adding tires in pairs.

**This table is the reason the baseline had to be captured before shipping.** It
is the only "before" that exists, every step of it is about to be renamed or
re-anchored, and after deployment it cannot be reconstructed.

Findings, each bearing on a decision already taken:

1. **`place_order` fired 11 times across 6 users**, not zero as a 7-day window
   suggested. The history that retiring it destroys (D2) is negligible but real,
   and the decision stands on that basis rather than on an absence. `quote_submit`
   is absent from all 16 names and so remains at zero.
2. **The checkout funnel now has numbers**: 16 users reach checkout and 6 press
   the final button — **38% by users, or 46% by raw events** (24 → 11). These are
   the figures `add_shipping_info` must reproduce after the rename. A large
   deviation means the replacement is wired to the wrong moment, not that
   behaviour changed. Without this baseline the rename would be unverifiable.
3. **The instrumentation is not broken.** `open_tire_3d` and
   `open_tire_image_zoom` — the visual-transparency features the mission names as
   a core pillar — read zero over 7 days, which looked like a wiring fault, so it
   was checked: both sit on real `<button>` elements with real `onClick` handlers
   that the delegated listener resolves correctly. Over 28 days
   `open_tire_image_zoom` does report 3 events from 3 users, confirming it works.
   Nothing needs fixing before the fan-out.
4. **But we still cannot tell whether those features are little-used or largely
   unmeasured**, and this is the sharpest illustration of why the feature exists.
   If GA4 sees roughly one visitor in five, then 3 recorded zoom opens may
   represent about 15 real ones, and a 3D view that GA4 cannot see at all may
   still be in daily use. GA4 cannot currently distinguish "nobody opens the 3D
   tread view" from "it is used every day and we cannot see it" — about a pillar
   of the product strategy. A second, ungated reading is the only way to settle
   it.
5. **At these volumes under-reporting stops being an accounting nuance and starts
   invalidating decisions.** `open_whatsapp` at 24 recorded clicks over 28 days
   may represent roughly 120 real attempts to make contact — about one a day
   versus about one every four days. Those are different businesses, and today's
   data cannot tell them apart.
6. **A short window lies here, and that is a durable lesson.** Every conclusion
   drawn from the 7-day read had to be revised: `place_order` went from "never
   fired, history empty" to 11 events, and `open_tire_image_zoom` from zero to 3.
   At counts this small, absence of evidence was mistaken for evidence of absence.
   Any future analysis of these events must use 28 days or more.

Findings 4 and 5 raise the value of this feature rather than lowering it: the
smaller the counts, the more a five-fold under-count distorts them.

**Sequencing note.** Group C (`purchase`, server-side) will fire rarely or never
until Stripe goes live in Track 2 of the roadmap. Its value is mostly forward-
looking — it means the revenue number is correct from the first real payment
rather than being retrofitted after the fact. Groups A and B pay off immediately.

## Functional requirements

**Group A — fan-out (independently shippable)**

- **FR1:** Every interaction currently marked with `data-track` must produce a
  correspondingly named event in Vercel Web Analytics, in addition to the GA4
  event it produces today.
- **FR2:** An event must carry the same name in both platforms, so that a number
  in one dashboard can be compared to the other without a translation table.
- **FR3:** The descriptive information attached to an event today (category,
  label, numeric value and any additional attributes) must reach Vercel as
  event properties. Where the shape of that information is not something Vercel
  can store, it must be adapted rather than silently dropped, and the adaptation
  must be predictable and documented.
- **FR4:** GA4's payload, event names and consent gating must be byte-for-byte
  unchanged. A failure in the Vercel path must never prevent the GA4 event from
  being sent, and vice versa.
- **FR5:** Sending an event must never break the page. If either analytics
  platform is unavailable, unconfigured, blocked or not yet loaded, the
  interaction the user triggered must complete normally and no error may surface
  to the user or to the console in production.
- **FR6:** Instrumenting a new element must continue to require only the
  existing declarative markup, with no per-platform code.

**Group B — conversion accuracy**

- **FR7:** `generate_lead` must be emitted only once the server has accepted a
  quote request.
- **FR8:** A failed, rejected or abandoned quote submission must emit no
  conversion event of any kind.
- **FR9:** `add_shipping_info` must be emitted on the checkout button click, and
  must not represent a completed order.
- **FR10:** A completed order must be counted as `purchase`, and nothing else may
  be counted as `purchase`.
- **FR11:** `place_order` and `quote_submit` must no longer be emitted anywhere.
  Retiring the names rather than redefining them is deliberate: a name that
  quietly changes meaning corrupts every future year-over-year comparison, and
  the histories being broken are small because card payments are not yet live.
  The retirement date must be recorded in this spec so anyone reading a gap in
  the GA4 history can find the reason.
- **FR12:** `whatsapp_order_sent` must be emitted when an order is handed off to
  WhatsApp, and must never be counted as or aggregated with `purchase`. It
  records an order we cannot confirm was completed, and must remain visibly
  distinct from one we can.

**Group C — server-side purchase**

- **FR13:** `purchase` must be emitted from the server when, and only when, a
  payment has actually settled and the corresponding order has been recorded.
- **FR14:** `purchase` must be emitted exactly once per order, no matter how many
  times the customer reloads, revisits or shares the confirmation page.
- **FR15:** `purchase` must carry exactly four pieces of information: the **order
  total and its currency**, the **fulfilment method** (pick-up or delivery), the
  **store** the goods came from, and the **number of items**. Nothing else. Each
  answers a question the owner has actually asked; anything beyond them is
  collected without a purpose and is therefore out.
- **FR16:** Test-mode checkouts must not emit `purchase`, so that test payments
  never contaminate production analytics.
- **FR17:** A failure to emit the analytics event must never fail, delay or roll
  back the order itself. Recording the order always wins.

**Group D — privacy**

- **FR18:** No personal data may be sent in an event name or an event property.
  This means, at minimum: no email address, no phone number, no personal name, no
  postal address, no payment identifier, and no identifier that can be traced
  back to an individual customer. This applies to browser and server events
  alike, and is most at risk in `purchase`, which is emitted from a request
  handler that holds the customer's email, address and Stripe session.
- **FR19:** The privacy policy must name both analytics tools, state that one
  uses cookies and runs only after the visitor accepts, and state that the other
  stores nothing on the visitor's device and runs always.
- **FR20:** The cookie banner's wording must be consistent with FR19 and must not
  imply that all analytics on the site are cookie-based.
- **FR21:** The privacy-policy and banner copy must be reviewed and approved by
  the owner before this feature is merged. It is visitor-facing legal text, and
  the judgement behind it — that a cookie-free, non-persistent audience measure
  needs disclosure but not consent — is not an engineering call. The rest of the
  feature may ship independently of that review.
- **FR22:** The cookie banner's stale comment must be corrected to match the
  1-day re-prompt in the code, which is confirmed to be the intended behaviour.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a visitor who has accepted cookies, when they click any
      element marked for tracking, then the event appears in GA4 exactly as it
      does today **and** an event of the same name appears in Vercel Web
      Analytics.
- [ ] **AC2:** Given a visitor who has **not** accepted cookies, when they click
      a tracked element, then no GA4 event is sent and the Vercel event still is.
- [ ] **AC3:** Given an event that carries a category, a label, a numeric value
      and an extra attribute, when it is sent, then all four are visible as
      separate, filterable properties on the Vercel event, and the GA4 event is
      identical to the one sent before this feature.
- [ ] **AC4:** Given a property whose shape Vercel cannot store, when the event is
      sent, then the event is still delivered, the remaining properties survive,
      and the handling of the offending property matches what the documentation
      says it does.
- [ ] **AC5:** Given either analytics platform is unavailable or blocked, when a
      tracked element is clicked, then the other platform still receives its
      event, the click's own behaviour completes normally, and nothing is logged
      to the console in production.
- [ ] **AC6:** Given the quote form, when the server rejects the submission or the
      request fails, then no `generate_lead` is emitted in either platform.
- [ ] **AC7:** Given the quote form, when the server accepts the submission, then
      exactly one `generate_lead` is emitted in each platform.
- [ ] **AC8:** Given the checkout page, when the customer clicks the checkout
      button, then `add_shipping_info` is emitted and no `purchase` is.
- [ ] **AC9:** Given the whole codebase and the running app, when they are
      searched, then the strings `place_order` and `quote_submit` appear nowhere
      as event names.
- [ ] **AC10:** Given card payment is disabled, when an order is handed off to
      WhatsApp, then exactly one `whatsapp_order_sent` is emitted and no
      `purchase` is.
- [ ] **AC11:** Given a customer who reaches the payment provider and abandons it
      without paying, then no `purchase` exists in either platform.
- [ ] **AC12:** Given a payment that settles, then exactly one `purchase` is
      emitted from the server, and it is still exactly one after the confirmation
      page has been requested five more times with the same session.
- [ ] **AC13:** Given a `purchase` event, when its properties are inspected, then
      they are exactly: order total, currency, fulfilment method, store, and item
      count — no more and no fewer.
- [ ] **AC14:** Given test mode is enabled, when a test checkout completes, then
      no `purchase` is emitted.
- [ ] **AC15:** Given the analytics platform is unreachable or throws from the
      server, when a payment settles, then the order is still recorded, the tires
      are still marked sold, and the customer still receives their confirmation
      response.
- [ ] **AC16:** Given the payload of any event this feature emits, when it is
      inspected by an automated test, then it contains no email address, phone
      number, personal name, postal address or payment identifier. This is
      asserted against the built payload, not verified by reading the code.
- [ ] **AC17:** Given a visitor reads the privacy policy, then it names both
      analytics tools and states which of them runs before consent is given.
- [ ] **AC18:** Given the privacy-policy and banner copy, when the feature is
      proposed for merge, then the owner has read and approved that copy.
- [ ] **AC19:** Given the full test suite, type check, linter, production build
      and performance budget, when they run, then all pass — and the GA4-related
      tests that existed before this feature pass unmodified.
- [ ] **AC20:** Given the `mrgomatires` production project after this ships, when
      the Events panel of its Vercel Analytics dashboard is opened, then it no
      longer reads "No custom events" and the event names listed match the _Event
      vocabulary_ table above.

## Non-functional / constraints

- **No user-visible cost.** Tracking is a side effect of an interaction and must
  not delay it. Nothing about sending an event may block navigation, a form
  submission or a redirect.
- **No measurable payload growth.** The Vercel analytics client is already loaded
  on every page; this feature must not add a new third-party script or a new
  network origin. Performance is a feature (mission) and the perf budget must
  stay green.
- **Server work stays off the critical path.** The purchase event must not add
  perceptible latency to the confirmation the customer is waiting for.
- **Correctness over completeness.** Where the two goals conflict, a missing
  event is better than a wrong one — an under-count we know about is recoverable,
  an inflated conversion rate that we trust is not. This follows the mission's
  ordering: trust/correctness first.
- **Data minimisation.** Collect what answers a question we actually ask. An
  event property that no one will ever filter on is a liability, not an asset.
- **Accessibility and UI unchanged.** This feature adds no interface. Any copy
  edited (policy, banner) must remain WCAG 2.1 AA compliant and readable on a
  phone.
- **US English** for all visitor-facing copy.

## Dependencies & prerequisites

- **P1 — Web Analytics enabled on the Vercel project. ✅ Satisfied (2026-08-04).**
  Confirmed from the dashboard: Analytics is on and collecting, with real traffic
  (746 visitors / 2,182 page views over 7 days), and the Events panel reads **"No
  custom events"** — which is precisely the gap this feature closes. Pageviews
  arrive; no product event ever has.
- **P2 — Owner approval of the legal copy** (FR21, AC18), required before merge
  but not before implementation.

### Which Vercel project this is

Production runs as project **`mrgomatires`**, in the team **"MrGoma Tires'
projects" (Pro)**. It is _not_ the `mrgoma` project under "Alejandro Palacios
Arvalo's projects" (Hobby), which is a different project that shares a similar
name — querying that one is what first produced a misleading
`404 "Web Analytics not found"`.

The Vercel MCP integration is authorised only for the Hobby team, so **it cannot
read the production project at all**. Every verification against production
analytics in this feature must therefore be done in the dashboard by the owner,
or by first re-authorising the integration for the MrGoma Tires team. Do not
treat an API answer about `mrgoma` as an answer about production.

## Decisions

Resolved during `/clarify` on 2026-08-04. No blocking unknowns remain.

- **D1 — Vercel events are not gated behind the cookie banner.** Vercel Web
  Analytics writes no cookie and stores nothing on the device, and its
  `<Analytics />` script already runs ungated today, so gating the events would
  be inconsistent with the site's own current behaviour. Gating them would also
  defeat the purpose: Vercel would then see the same partial sample as GA4 and
  the second reading would tell us nothing new. The obligation this carries is
  disclosure, not consent — hence FR19 to FR21.
- **D2 — `place_order` and `quote_submit` are retired**, not redefined, and are
  replaced by GA4's recommended ecommerce names. Retirement date: **2026-08-04**.
  A gap in the GA4 history for those two names from that date onward is expected
  and explained here.
- **D3 — The checkout click is `add_shipping_info`, not `add_payment_info`,** for
  the reason given under _Event vocabulary_: it is the one we can honestly
  observe.
- **D4 — A WhatsApp hand-off is its own event and never a purchase.** It records
  an order we cannot confirm, and conflating it with a settled payment would
  reintroduce exactly the inflation this feature exists to remove.
- **D5 — `purchase` carries order total, currency, fulfilment method, store and
  item count.** No transaction identifier, because the server reports to Vercel
  only and nothing needs deduplicating downstream.
- **D6 — The owner reviews the legal copy before merge** (FR21). The rest of the
  feature is not blocked on that review.
- **D7 — The cookie banner's 1-day re-prompt is correct**; the comment claiming
  30 days is the error and is fixed here (FR22). No behavioural change.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
