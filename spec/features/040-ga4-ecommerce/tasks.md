# Tasks — GA4 ecommerce measurement

> Feature: `040-ga4-ecommerce` · Based on: [plan.md](./plan.md) · Created: 2026-11-10

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Every new test file mocks `@vercel/analytics` (see 015 Risks).

## Foundations

- [x] **T1** — Add `VIEW_ITEM`, `ADD_TO_CART`, `BEGIN_CHECKOUT`,
      `ADD_PAYMENT_INFO` to `EVENTS`; document the **dated anchor change** of
      `BEGIN_CHECKOUT` (button press → checkout page opened) and
      `ADD_SHIPPING_INFO` (button press → server acceptance), and rewrite the
      `PURCHASE` doc (GA4 from the browser, Vercel from the server) · files:
      `src/app/utils/analyticsEvents.ts` · check: `retiredEvents.guard.test.ts`
      green; `tsc` green.
- [x] **T2** — Pure item builders: `STORE_CURRENCY`, `toGaItem()` (cart/tire
      shape), `toGaItemFromStripeLine()` (session line, with `parseTireName`
      fallback when brand/size are missing), `cartPayload()` (`value`,
      `currency`, `items`) · files: `src/app/utils/ecommerce.ts`,
      `src/app/utils/ecommerce.test.ts` · check: tests for name composition
      (`Used Michelin Defender 225/65R17`), legacy cart items (no model → `name`),
      price string/number/invalid, quantity ≥ 1, tax line excluded, **exact key
      set** per item (no personal data).
- [x] **T3** — `GA_DEBUG` (non-production build or
      `NEXT_PUBLIC_GA_DEBUG=true`); `debug_mode: true` appended to `pageview` and
      events only when on, omitted otherwise · files: `src/app/utils/gtag.ts`,
      `src/app/utils/gtag.test.ts` · check: tests for both modes (key absent, not
      `false`).
- [x] **T4** — Bounded pending queue in `gtag.ts`: when consent is granted but
      `window.gtag` is undefined, hold the call (max 20, oldest dropped);
      `flushPending()` replays in order; no consent → not queued; flush re-checks
      consent · files: `src/app/utils/gtag.ts`, `src/app/utils/gtag.test.ts` ·
      check: tests — held, flushed in order, dropped without consent, cap,
      consent withdrawn before flush → nothing sent.
- [x] **T5** — `ecommerceEvent(name, params, callback?)` in `gtag.ts`: plain
      `gtag('event', …)` without `event_category`/`event_label`, through the same
      gate and queue, passing `event_callback` when given · files:
      `src/app/utils/gtag.ts`, `src/app/utils/gtag.test.ts` · check: test asserts
      exact params sent.
- [x] **T6** — `ga-init` adds `debug_mode` when `GA_DEBUG` and ends with
      `window.dispatchEvent(new Event('ga:ready'))`; a listener calls
      `flushPending()` · files:
      `src/app/ui/components/GoogleAnalytics/GoogleAnalytics.tsx`,
      `src/app/utils/gtag.ts` · check: `gtag.test.ts` — dispatching `ga:ready`
      flushes the queue; manual in T16.
- [x] **T7** — `trackEcommerce(name, payload, { vercel = true, waitMs = 0 })`:
      full payload to GA4 via `ecommerceEvent`; flat Vercel props (`value`,
      `currency`, `item_count`, `item_id` when single item, plus scalar extras
      like `shipping_tier`/`payment_type`); returns a promise resolving on
      `event_callback` or after `waitMs`, never rejecting · files:
      `src/app/utils/analytics.ts`, `src/app/utils/analytics.test.ts` · check:
      tests — GA gets `items`; Vercel gets no array/JSON string; `vercel:false`
      skips Vercel; resolves on timeout with GA absent; resolves early on
      callback; **without consent GA receives nothing and Vercel still receives
      the flat event** (AC10).

## Events

- [x] **T8** — `view_item`: `ViewItemTracker` client island (renders `null`,
      effect keyed on id, ref guard against duplicate effects) and render it in
      `TireInformation` for every tire, sold included · files:
      `src/app/ui/components/ViewItemTracker/ViewItemTracker.tsx` (+ test),
      `src/app/ui/sections/TireInformation/TireInformation.tsx` · check: test —
      one send on mount, none on re-render with same id, a second on new id;
      payload has one item and `value` = price.
- [x] **T9** — `add_to_cart` from the catalog card (List view; desktop and
      mobile buttons — Table view has no add-to-cart): remove both
      `data-track="add_to_cart"` attrs; call `trackEcommerce(ADD_TO_CART, …)` in
      `handleAddToCart` · files: `src/app/ui/sections/TireCard/TireCard.tsx` (+
      test) · check: test — desktop and mobile buttons each send one event with
      the item; disabled (in-cart) button sends nothing; `grep data-track=\"add_to_cart\"` empty.
- [x] **T10** — `add_to_cart` from the detail page · files:
      `src/app/ui/components/AddToCartButton/AddToCartButton.tsx` (+ test) ·
      check: test — click sends one event; disabled sends nothing.
- [x] **T11** — Expose `isCartReady` from `CartContext` (the existing
      `loadedFromStorage`) · files: `src/app/context/CartContext.tsx` · check:
      `tsc` green; existing cart tests green.
- [x] **T12** — `begin_checkout` on `/checkout` open: effect once per page load
      when `mounted && isCartReady && orderState === 'idle'` and cart non-empty;
      remove `data-track="begin_checkout"` from the drawer link · files:
      `src/app/(shop)/checkout/container/Checkout/Checkout.tsx`,
      `src/app/ui/sections/CartModal/CartModal.tsx`, `Checkout.test.tsx` · check:
      tests — once with two items and value = subtotal; none with empty cart;
      none on `success=1` / `whatsapp=1`.
- [x] **T13** — `add_shipping_info` + `add_payment_info` on server acceptance:
      remove `data-track` from the button; after 2xx send `add_shipping_info`
      (`shipping_tier`); Stripe branch awaits `add_payment_info`
      (`payment_type: 'card'`, `waitMs: 600`) before `location.assign`; WhatsApp
      branch sends `add_shipping_info` only · files: `Checkout.tsx`,
      `Checkout.test.tsx` · check: tests — 409 and 500 send neither; Stripe sends
      shipping then payment then redirects; pickup sets `shipping_tier: 'pickup'`;
      WhatsApp sends no payment event.
- [x] **T14** — Stripe line metadata + session payload: `create-session` adds
      `brand`, `model`, `size` to `product_data.metadata` (strings, trimmed to
      500 chars); `session` returns them per item (null if absent) and adds
      `tax_total` (cents) = `total_details.amount_tax` + synthetic `tax` line ·
      files: `src/app/api/checkout/create-session/route.ts`,
      `src/app/api/checkout/session/route.ts`, `session/route.test.ts` · check:
      tests — fields present; `tax_total` for pickup and delivery; old session
      without metadata → nulls.
- [x] **T15** — `purchase` on the confirmation page: effect when
      `sessionDetails.payment_status === 'paid'`; skip if
      `localStorage['ga-purchase:<id>']`; payload `transaction_id`, `value`,
      `tax`, `shipping`, `currency`, `items` (tax line excluded) via
      `trackEcommerce(PURCHASE, …, { vercel: false })`; set the key only when
      consent was given · files: `Checkout.tsx`, `Checkout.test.tsx` · check:
      tests — one send; none on remount with key set; none when unpaid; none
      on `canceled=1`; no `tax` item; Vercel `track` not called.

## Verification & docs

- [x] **T16** — Local end-to-end with Stripe test mode (`npm run dev`,
      `CHECKOUT_TEST_MODE=true`, card `4242 4242 4242 4242`) watched in GA4
      DebugView + DevTools Network (`collect`): detail landing (hard reload),
      add from the card (desktop and mobile width) and detail, open `/checkout`, rejected order (409 via a
      sold id), delivery and pickup payments, reload confirmation twice, decline
      cookies and repeat · files: `spec/features/040-ga4-ecommerce/results.md` ·
      check: every AC1–AC11 observed and recorded with screenshots/notes;
      payloads contain no personal data.
- [x] **T17** — Docs: `tech-stack.md` Analytics paragraph (ecommerce events use
      `trackEcommerce`, not `data-track`); `consultant-note.md` in Spanish (each
      event, when it fires, fields, limits: consent/ad-blockers, add_payment_info
      = "sent to card form", the dated anchor change of `begin_checkout` and
      `add_shipping_info`, WhatsApp path gets shipping only, GA4 < real orders)
      · files: `spec/tech-stack.md`,
      `spec/features/040-ga4-ecommerce/consultant-note.md` · check: user reviews
      the note.
- [x] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` green; manual check on
      `/tires`, a detail page and `/checkout` on mobile width; changes left
      **staged, not committed**, until the user has tested.
- [ ] **T18** — _After deploy (user pushes):_ GA4 admin — confirm currency USD,
      mark `purchase` as key event; first real sale appears in Monetization →
      Ecommerce purchases and Traffic acquisition within 48 h; after ~28 days
      record GA4 vs Vercel `purchase` count and ratio · files: `results.md` ·
      check: AC12 recorded.

## Traceability

| Task  | Acceptance criteria                        |
| ----- | ------------------------------------------ |
| T1    | AC5, AC7, AC8 (names), AC13 (dated anchor) |
| T2    | AC1, AC2, AC4, AC8, AC11                   |
| T3    | AC10c                                      |
| T4    | AC2b, AC8, AC10                            |
| T5    | AC1–AC8, AC11                              |
| T6    | AC2b, AC8, AC10c                           |
| T7    | AC7, AC11 (Vercel side), FR11              |
| T8    | AC1, AC2b                                  |
| T9    | AC2, AC3                                   |
| T10   | AC2, AC3                                   |
| T11   | AC4                                        |
| T12   | AC4                                        |
| T13   | AC5, AC6, AC7                              |
| T14   | AC8                                        |
| T15   | AC8, AC9, AC10b                            |
| T16   | AC1–AC11, AC2b, AC10b, AC10c (observed)    |
| T17   | AC13                                       |
| T18   | AC12                                       |
| T-DoD | all (regression gate)                      |
