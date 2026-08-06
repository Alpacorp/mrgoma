/**
 * The event vocabulary, in one place.
 *
 * **No imports, on purpose.** This module is pulled into the browser bundle by
 * `analytics.ts` *and* into a route handler by `api/checkout/_lib/purchaseEvent`.
 * Importing anything environment-specific here would drag the browser analytics
 * client onto the server, so it stays a plain table of strings.
 *
 * Full definitions of when each event fires live in
 * `spec/features/015-vercel-event-tracking/spec.md`.
 */
export const EVENTS = {
  /**
   * The checkout form was submitted — fulfilment method and state or store are
   * complete — and the customer is handed off to the payment provider.
   *
   * Deliberately *not* `add_payment_info`: payment details are entered on the
   * provider's own page, which we cannot observe. This is the moment we can
   * honestly report.
   */
  ADD_SHIPPING_INFO: 'add_shipping_info',

  /** A payment settled and the order was recorded. Server-side, once per order. */
  PURCHASE: 'purchase',

  /**
   * An order was handed off to WhatsApp because card payment is disabled. We can
   * see the hand-off; we can never see whether the order was completed, so this
   * must never be counted as or aggregated with `PURCHASE`.
   */
  WHATSAPP_ORDER_SENT: 'whatsapp_order_sent',

  /** The server accepted a quote request. */
  GENERATE_LEAD: 'generate_lead',

  /**
   * The assistant produced a filtered listing and the customer was taken to it.
   *
   * The outcome, not the attempt: it fires when filters are applied, never on
   * opening the chat or sending a message, and **never on an empty result set** —
   * nothing was filtered then, and counting it would blur "I took you to a list"
   * into "we had nothing". That case is {@link AI_CHAT_NO_RESULTS}.
   *
   * Carries `surface` (which assistant) and `dimensions` (the names of what was
   * filtered on — never the values the customer typed).
   */
  AI_CHAT_FILTERS_APPLIED: 'ai_chat_filters_applied',

  /**
   * The assistant ran a search and the catalogue had nothing.
   *
   * Public surface only: the dashboard route never queries the catalogue, so it
   * cannot know. This is demand we could not meet — which brands and sizes people
   * ask for and leave without — so it is buying information, not only analytics,
   * and must never be aggregated with {@link AI_CHAT_FILTERS_APPLIED}.
   */
  AI_CHAT_NO_RESULTS: 'ai_chat_no_results',
} as const;

/**
 * Names retired on 2026-08-04 because they counted a button press rather than an
 * outcome — `place_order` fired whether or not payment ever happened, and
 * `quote_submit` whether or not the form was accepted.
 *
 * They must never come back: a name that once meant "order placed" and later
 * means "checkout started" corrupts every year-over-year comparison drawn from
 * it. `retiredEvents.guard.test.ts` enforces this against the whole source tree.
 */
export const RETIRED_EVENTS = ['place_order', 'quote_submit'] as const;
