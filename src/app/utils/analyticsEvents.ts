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
   * A shopper opened a tire detail page. Carries the tire as the single item.
   * Feature 040.
   */
  VIEW_ITEM: 'view_item',

  /**
   * A listing showed a new result — first load, another page, a filter or sort
   * change (feature 046, D1). Carries the list id and name and every tire
   * shown, with its position on the whole result.
   */
  VIEW_ITEM_LIST: 'view_item_list',

  /**
   * The shopper opened a tire's page from a listing (photo or title of a card,
   * or a chat set card). Carries the tire, the list and its position (046, D2).
   */
  SELECT_ITEM: 'select_item',

  /** The cart drawer opened with tires in it (046, D3). Not sent on /checkout. */
  VIEW_CART: 'view_cart',

  /**
   * The shopper removed tires from the cart — one tire or a set (046, D4).
   * ("Remove the {city} tire" at checkout went away with the one-city pickup
   * rule, 047.) Never for a tire the site removes because it sold.
   */
  REMOVE_FROM_CART: 'remove_from_cart',

  /**
   * A tire search by size landed on /tires: from the home search by size or by
   * text, or a size facet of the catalog (046, D5). Only a change of size is a
   * new search. Carries `search_term` and `tire_*` parameters.
   */
  SEARCH: 'search',

  /**
   * A tire was put in the cart from a shopper-facing button (catalog card or
   * detail page). Never from the seller dashboard, which shares the cart.
   */
  ADD_TO_CART: 'add_to_cart',

  /**
   * The checkout page opened with a non-empty cart, however the shopper got
   * there.
   *
   * **Anchor changed with the release of feature 040** (deploy date recorded in
   * `spec/features/040-ga4-ecommerce/results.md`). Before that, it fired on
   * the press of the cart drawer's "Checkout" button, so a direct visit to
   * `/checkout` was missed. Read the series across the release with care.
   */
  BEGIN_CHECKOUT: 'begin_checkout',

  /**
   * The server accepted the order — fulfilment method and state or store are
   * complete — and the customer is about to be handed off (to Stripe or, when
   * card payment is off, to WhatsApp).
   *
   * **Anchor changed with the release of feature 040** (deploy date recorded in
   * `spec/features/040-ga4-ecommerce/results.md`). Before that, it fired on
   * the button press, so an order the server then rejected (a tire sold in the
   * meantime) still counted. Read the series across the release with care.
   */
  ADD_SHIPPING_INFO: 'add_shipping_info',

  /**
   * The accepted order is being handed off to Stripe's card form.
   *
   * Card details are typed on Stripe's own page, which we cannot observe, so
   * this means "sent to the card form", **not** "card details entered". It is
   * the last moment the site can honestly report. Never sent for WhatsApp.
   */
  ADD_PAYMENT_INFO: 'add_payment_info',

  /**
   * A payment settled. Reported twice, to two places, on purpose:
   *
   * - **Vercel**, from the server, once per recorded order — the count that no
   *   ad-blocker can suppress, and the reference for how many orders happened.
   * - **GA4**, from the shopper's browser on the confirmation page (feature 040),
   *   so the sale joins the visit's own session and channel. Consent-gated and
   *   blockable, so it will read lower than Vercel.
   */
  PURCHASE: 'purchase',

  /**
   * A shopper added a set of 2, 3 or 4 tires built on a detail page (feature
   * 041). Sent alongside the set's `add_to_cart`, so the feature's use can be
   * counted apart from single adds. Carries `set_size`, `swaps` (how many units
   * the shopper changed from the suggestion) and `condition`.
   */
  SET_BUILT: 'set_built',

  /**
   * The visitor opened "N like this in {city}" on a tire from the other city
   * (feature 043). Sent through `data-track`, with the city as the label.
   */
  CITY_MATCH_OPEN: 'city_match_open',

  /**
   * The shopper opened a set the AI chat proposed (feature 044). Sent through
   * `data-track` on the card's link, with `position` (1–3), `set_size` and
   * `city` — never anything typed by the customer.
   */
  CHAT_SET_OPEN: 'chat_set_open',

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

  /**
   * The assistant looked up sets and showed at least one card (feature 044).
   * Carries `surface`, `dimensions`, `outcome` (`found`, `any_city` or
   * `smaller`; `other_city` until feature 047) and `sets` (how many cards). A lookup with none is
   * {@link AI_CHAT_NO_RESULTS}.
   */
  AI_CHAT_SETS_SHOWN: 'ai_chat_sets_shown',
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
