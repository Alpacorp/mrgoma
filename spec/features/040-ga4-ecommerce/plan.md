# Plan — GA4 ecommerce measurement

> Feature: `040-ga4-ecommerce` · Based on: [spec.md](./spec.md) · Created: 2026-11-10

## Technical approach

Keep the existing two-sink architecture (`trackEvent` → GA4 + Vercel) and add a
**typed ecommerce path** next to it, because the declarative `data-track`
markup cannot carry an `items` array and GA4 ignores ecommerce events without
one.

1. **One item builder.** A pure module turns any tire we already hold (catalog
   card, detail page, cart line, Stripe line) into a GA4 item. It reuses
   `cartLine()` / `brandName()` so the name in GA4 is the name the shopper read.
2. **One send path.** `trackEcommerce(name, payload, opts)` sends the full
   payload to GA4 and a **flat summary** (`value`, `currency`, `item_count`,
   single `item_id`) to Vercel — Vercel cannot store arrays (see
   `analytics.ts`). `purchase` opts out of Vercel, which already counts it on
   the server (FR11).
3. **No lost first events (FR9a).** Today `gtag.ts` drops any event raised
   before the `ga-init` inline script has defined `window.gtag`. The return
   from Stripe and organic landings on a detail page are exactly that moment.
   `gtag.ts` gains a small bounded queue: when consent is granted but `gtag`
   is not yet defined, the call is held and flushed when `ga-init` signals
   ready. No consent → nothing is queued.
4. **Debug mode (D5).** `debug_mode: true` is added to the GA4 config and to
   every event when not running the production build (or when
   `NEXT_PUBLIC_GA_DEBUG=true`, for a preview test). Omitted entirely otherwise —
   GA4 treats `debug_mode: false` as _on_.
5. **Events wired at the moment they really happen** (D2–D4): component
   effects for `view_item` / `begin_checkout`, button handlers for
   `add_to_cart`, the server's acceptance for `add_shipping_info` /
   `add_payment_info`, the settled session for `purchase`.

Everything is client-side except two small server changes that enrich what the
confirmation page receives (brand/model/size per line, and a tax total).

## Reuse first

- `src/app/utils/analytics.ts` — `trackEvent`, `toVercelProps`, `coerce`: the
  Vercel half of `trackEcommerce` reuses the flattening rules.
- `src/app/utils/gtag.ts` — `canSend()` and the consent gate; the queue lives
  here so it inherits the same gate.
- `src/app/utils/consent.ts` — `hasConsent()`; still the only consent reader.
- `src/app/utils/analyticsEvents.ts` — `EVENTS` table (add names here, not as
  string literals); `retiredEvents.guard.test.ts` keeps working.
- `src/app/utils/cartLine.ts` (`cartLine`) and `src/app/utils/tireNaming.ts`
  (`brandName`, `parseTireName`, `tireTitle`) — naming, so GA4 does not invent
  a fourth way to name a tire (see feature 028).
- `CartContext` (`cartItems`, `cartTotal`) — the cart snapshot for checkout
  events.
- `/api/checkout/session` payload (`items`, `amount_total`, `shipping_total`,
  `currency`, `payment_status`) — already fetched by `Checkout.tsx` on success.
- `create-session` — already reads `brand`, `model2`, `size` from `/api/tire`;
  only needs to forward them into Stripe product metadata.
- Test conventions: Vitest + jsdom, `vi.mock('@vercel/analytics')` as in
  `analytics.test.ts`, Testing Library as in `Checkout.test.tsx`.

## Files to add / change

**Add**

- `src/app/utils/ecommerce.ts` — pure builders: `toGaItem()` from a cart/tire
  shape, `toGaItemFromStripeLine()` from a session line, `cartPayload(items)`
  (`value`, `currency`, `items`), `STORE_CURRENCY`. No imports of analytics.
- `src/app/utils/ecommerce.test.ts` — item shape, name composition, price
  parsing (string/number/invalid → 0), tax line excluded, legacy cart items
  (no model/size) fall back to `name`, key set has no personal data (AC11).
- `src/app/ui/components/ViewItemTracker/ViewItemTracker.tsx` — `'use client'`
  island rendering `null`; `useEffect` keyed on the tire id sends `view_item`
  once per id (ref guard against Strict Mode double effects). Fed props by the
  server-rendered detail page, so LCP is untouched.
- `src/app/ui/components/ViewItemTracker/ViewItemTracker.test.tsx`.

**Change**

- `src/app/utils/analyticsEvents.ts` — add `VIEW_ITEM`, `ADD_TO_CART`,
  `BEGIN_CHECKOUT`, `ADD_PAYMENT_INFO`; document the anchor change of
  `BEGIN_CHECKOUT` (now: checkout page opened) and `ADD_SHIPPING_INFO` (now:
  server acceptance), both dated with the release date, and rewrite the
  `PURCHASE` doc (GA4 now receives it from the browser).
- `src/app/utils/gtag.ts` — `GA_DEBUG`; `ecommerceEvent(name, params)` (raw
  `gtag('event', …)` without `event_category`/`event_label` noise, plus optional
  `event_callback`); bounded pending queue (max ~20) + `flushPending()`;
  `debug_mode` appended when `GA_DEBUG`. `pageview` also carries it.
- `src/app/utils/gtag.test.ts` — queue: held without `gtag`, flushed in order on
  ready, dropped without consent, capped; debug flag present/absent.
- `src/app/utils/analytics.ts` — `trackEcommerce(name, payload, { vercel?,
waitMs? })` returning a `Promise<void>` that resolves on GA's
  `event_callback` or after `waitMs` (default 0 → resolves immediately), never
  rejects.
- `src/app/utils/analytics.test.ts` — GA gets items; Vercel gets the flat
  summary only; `vercel: false` skips Vercel; promise resolves on timeout when
  GA is absent.
- `src/app/ui/components/GoogleAnalytics/GoogleAnalytics.tsx` — `ga-init`
  adds `debug_mode` when `GA_DEBUG`, and ends with
  `window.dispatchEvent(new Event('ga:ready'))`; the component (or `gtag.ts`)
  listens and calls `flushPending()`.
- `src/app/ui/sections/TireCard/TireCard.tsx` — drop `data-track="add_to_cart"`
  from both buttons (desktop and mobile of the List view; the Table view has no
  add-to-cart); `handleAddToCart` calls
  `trackEcommerce(ADD_TO_CART, …)`. Disabled buttons emit no click → AC3.
- `src/app/ui/components/AddToCartButton/AddToCartButton.tsx` — same call in
  `handleAddToCart` (detail page; closes the untracked gap).
- `src/app/ui/sections/TireInformation/TireInformation.tsx` — render
  `<ViewItemTracker>` with the tire's id/name/brand/model2/size/condition/price.
  Rendered for sold tires too: the page was still viewed, and dropping it would
  hide demand for stock that sold out.
- `src/app/context/CartContext.tsx` — expose `isCartReady`
  (`loadedFromStorage`) so checkout does not read the pre-hydration empty cart.
- `src/app/ui/sections/CartModal/CartModal.tsx` — remove
  `data-track="begin_checkout"` from the Checkout link (D4: moves to page open).
- `src/app/(shop)/checkout/container/Checkout/Checkout.tsx`
  - `begin_checkout`: effect once per page load when `mounted && isCartReady &&
orderState === 'idle' && !success && !whatsappFlag && cartItems.length > 0`.
  - remove `data-track={EVENTS.ADD_SHIPPING_INFO}` from the button.
  - in `proceedToPayment`, after a 2xx: send `add_shipping_info` (with
    `shipping_tier`). If `data.url` (Stripe): `await trackEcommerce(
ADD_PAYMENT_INFO, { …, payment_type: 'card' }, { waitMs: 600 })` then
    `window.location.assign`. WhatsApp path: `add_shipping_info` only.
  - `purchase`: effect when `sessionDetails?.payment_status === 'paid'`; guard
    with `localStorage` key `ga-purchase:<session_id>` (set only after the send
    is attempted with consent); payload `transaction_id = session id`, `value =
amount_total/100`, `tax`, `shipping`, `currency`, `items` excluding
    `productId === 'tax'`.
- `src/app/(shop)/checkout/container/Checkout/Checkout.test.tsx` — begin_checkout
  once / not on empty cart; 409 sends neither shipping nor payment (AC6);
  accepted Stripe order sends both then redirects; purchase once across
  re-renders and reload (localStorage), not when unpaid (AC10b), tax line
  excluded.
- `src/app/api/checkout/create-session/route.ts` — add `brand`, `model`, `size`
  to `product_data.metadata` (strings, ≤500 chars — Stripe limit). No change to
  price or name.
- `src/app/api/checkout/session/route.ts` — each item also returns `brand`,
  `model`, `size` from metadata (null for older sessions → builder falls back to
  parsing `description` with `parseTireName`); payload adds `tax_total` (cents)
  = `total_details.amount_tax` + the synthetic `tax` line.
- `src/app/api/checkout/session/route.test.ts` — the new fields; `tax_total`
  for pickup (synthetic line) and delivery (automatic tax).
- `spec/tech-stack.md` (Analytics section) — one paragraph: ecommerce events go
  through `trackEcommerce`, not `data-track`.
- `spec/features/040-ga4-ecommerce/consultant-note.md` — AC13 (Spanish, for the
  consultant).
- `spec/features/040-ga4-ecommerce/results.md` — test evidence (local DebugView,
  production check, GA4 vs Vercel ratio).

## Data & flow

```
Detail page (server) ──props──▶ ViewItemTracker ──▶ view_item
TireCard / AddToCartButton click ──▶ add_to_cart  (+ addToCart())
/checkout opens, cart ready & non-empty ──▶ begin_checkout
"Proceed to payment" ─POST /api/checkout/create-session─▶ 2xx?
      ├─ no (409/501/5xx/network) ──▶ nothing
      ├─ whatsappUrl ──▶ add_shipping_info, whatsapp_order_sent (unchanged)
      └─ url ──▶ add_shipping_info, add_payment_info (≤600 ms wait) ──▶ Stripe
Stripe ──▶ /checkout?success=1&session_id=… (full load)
      GET /api/checkout/session ──▶ paid? ──▶ purchase (once per session_id)
      (server: Vercel purchase, unchanged, still once per order)
```

GA4 item shape (`ecommerce.ts`):

| Field           | Source                                                      |
| --------------- | ----------------------------------------------------------- |
| `item_id`       | tire id (TireId — same in catalog, cart, Stripe, SC_Order)  |
| `item_name`     | `${Condition} ${cartLine().title} ${size}` trimmed          |
| `item_brand`    | `brandName(brand)`                                          |
| `item_category` | `Used` / `New` (normalized condition)                       |
| `item_variant`  | size                                                        |
| `price`         | unit price, number, major units                             |
| `quantity`      | integer ≥ 1                                                 |

Currency: `NEXT_PUBLIC_STRIPE_CURRENCY` uppercased, default `USD`.

No DB reads or writes change. No new routes, env vars are optional
(`NEXT_PUBLIC_GA_DEBUG`).

## Acceptance criteria → implementation

| AC    | How it's met                                                                      | How it's verified/tested                                                                                 |
| ----- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| AC1   | `ViewItemTracker` in `TireInformation` + `toGaItem`                               | Unit test (payload); manual: DebugView on a local detail page                                            |
| AC2   | `trackEcommerce(ADD_TO_CART)` in `TireCard` (desktop + mobile) and `AddToCartButton`   | Unit tests on both handlers; manual: three adds visible in DebugView                                     |
| AC2b  | Queue in `gtag.ts` flushed on `ga:ready`; effect keyed on id                      | `gtag.test.ts` queue tests; `ViewItemTracker` test re-render with new id; manual: hard reload on detail  |
| AC3   | Disabled button emits no click; no `data-track` left                              | Test: click disabled → no send                                                                           |
| AC4   | Effect in `Checkout` gated on `isCartReady`, non-empty, idle; link attr removed   | `Checkout.test.tsx`: once with 2 items, value = subtotal; none when empty                                |
| AC5   | Sent after 2xx with `shipping_tier`                                               | `Checkout.test.tsx` (delivery + pickup)                                                                  |
| AC6   | Sends only inside the success branches of `proceedToPayment`                      | `Checkout.test.tsx` with mocked 409 and 500                                                              |
| AC7   | `await trackEcommerce(ADD_PAYMENT_INFO, …, { waitMs: 600 })` before `assign`      | Test: order of calls; manual: DebugView shows it after shipping                                          |
| AC8   | Purchase effect from session payload; tax line filtered; `transaction_id`=session | `Checkout.test.tsx`; manual: local Stripe test card 4242… with `CHECKOUT_TEST_MODE=true`                 |
| AC9   | `localStorage` guard + GA4 transaction_id dedup                                   | Test: remount → one send; manual: reload confirmation twice                                              |
| AC10  | Unchanged consent gate; queue refuses without consent                             | `gtag.test.ts`; manual: decline banner, DevTools Network filter `collect` empty, Vercel still receives   |
| AC10b | Purchase requires `payment_status === 'paid'`; cancel path has no session         | `Checkout.test.tsx` (unpaid, canceled)                                                                   |
| AC10c | `GA_DEBUG` from build mode / env                                                  | `gtag.test.ts` both ways; manual: production `collect` requests carry no `_dbg`                          |
| AC11  | Builders whitelist fields                                                         | `ecommerce.test.ts` exact key-set assertion                                                              |
| AC12  | Real sale after deploy; GA4 admin by Alejo (USD, key event)                       | `results.md`: GA4 Ecommerce purchases + Traffic acquisition screenshot; GA4 vs Vercel count & ratio     |
| AC13  | `consultant-note.md`                                                              | Reviewed by the user before sending                                                                      |

## Tradeoffs / alternatives

- **Typed calls vs extending `data-track`.** Encoding `items` as JSON in data
  attributes would keep the declarative style but put serialized product data in
  the DOM and parsing logic in the tracker. Rejected: ecommerce events need
  state (cart, server responses) that a click listener does not have.
- **Emitting `add_to_cart` inside `CartContext.addToCart`.** One place, but the
  seller dashboard (`DashboardTable`) also calls `addToCart`, which would mix
  staff activity into shopper data. Rejected; emit from the two shopper buttons.
- **Queue vs the standard `dataLayer` stub.** Defining `window.gtag` early
  would put our events ahead of `js`/`config` in the dataLayer, where GA4's
  handling is not something we want to depend on. An explicit queue flushed
  after `config` keeps the order guaranteed and testable.
- **Brand/size for `purchase`: Stripe metadata vs snapshotting the cart.** The
  cart is cleared on return and may differ from what was paid; Stripe is the
  authoritative record of what was bought. Metadata chosen, with name parsing as
  fallback for sessions created before deploy.
- **Measurement Protocol** — deferred by D1.

## Risks

- **Redirect cuts `add_payment_info`.** Navigation can abort a pending hit.
  _Mitigation:_ wait for GA's `event_callback`, capped at 600 ms; gtag.js uses
  beacon transport. Cost: up to 0.6 s added before the Stripe redirect, only for
  consenting visitors, behind the existing "Redirecting to payment…" loader.
- **Counting the same purchase twice** (reload, back button, shared link).
  _Mitigation:_ `localStorage` guard + GA4's own transaction_id dedup. A
  different browser opening the shared link could still send once more; GA4
  dedup covers that.
- **`add_shipping_info` series break.** Moving the anchor lowers its count vs
  history. _Mitigation:_ date recorded in `analyticsEvents.ts`, spec and the
  consultant note.
- **Double `page_view` already present.** `ga-init` config and the
  `GoogleAnalytics` effect both send a page view on first load. Pre-existing,
  not caused here; noted in `results.md` for a follow-up rather than changed now
  (it would shift the consultant's traffic baseline mid-project).
- **JS budget.** `ecommerce.ts` + tracker are small; run `npm run perf:budget`.
- **Older Stripe sessions** lack metadata → parsed from `description`; tested.
- **`begin_checkout` series break** (button press → page open), same treatment
  as `add_shipping_info`: dated in code, spec and consultant note.
- **Shared cart between the seller dashboard and the shop.** Both use the same
  `cart` key in `localStorage`; a staff member opening `/checkout` with a cart
  built in the dashboard would count as `begin_checkout`. _Accepted:_ the
  dashboard sends orders via WhatsApp and does not route staff through
  `/checkout`, so this needs someone to do it on purpose.
- **jsdom vs `@vercel/analytics`** (see 015 Risks): mock it in every new test.

## Out of scope

- Server-side GA4 purchase (Measurement Protocol) — follow-up if the GA4/Vercel
  purchase ratio from `results.md` shows a material gap.
- `view_item_list`, `select_item`, `remove_from_cart`, `view_cart`, `refund`.
- Fixing the duplicate first `page_view` (see Risks).
- GA4 property settings beyond USD + key event; the consultant's dashboard.

---

_The concrete steps live in [tasks.md](./tasks.md)._
