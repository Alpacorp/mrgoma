import { track } from '@vercel/analytics/server';

import { EVENTS } from '@/app/utils/analyticsEvents';
import { logger } from '@/utils/logger';

/**
 * The `purchase` event, reported from the server.
 *
 * A purchase is the one number that must not be suppressible. Anything measured
 * in the browser can be blocked by an extension or lost when the customer closes
 * the tab before the confirmation page renders; the server knows a payment
 * settled and nothing downstream can silence it.
 *
 * This goes to Vercel Web Analytics only. GA4 has no server-side counterpart
 * here, so GA4 currently has no order-completion event at all — a known gap,
 * documented in `spec/features/015-vercel-event-tracking/plan.md` under Risks,
 * to be closed with the Measurement Protocol alongside roadmap step S2.4.
 */

/** What a settled order may tell analytics. Nothing here identifies a person. */
export interface PurchaseInput {
  /** Order total in major currency units (dollars, not cents). */
  orderTotal: number;
  /** ISO currency code, e.g. `USD`. */
  currency: string;
  /** `pickup` or `delivery`, as recorded in the payment session metadata. */
  fulfillmentMethod?: string;
  /** Which store the goods came from, or `MIXED`. */
  store?: string;
  /** Number of physical items, excluding the synthetic tax line. */
  itemCount: number;
}

export type PurchaseProps = {
  value: number;
  currency: string;
  fulfillment_method: string;
  store: string;
  item_count: number;
};

/**
 * Build the event payload.
 *
 * Pure and free of any analytics import so it can be asserted directly — which
 * matters more than usual here, because the caller is a request handler holding
 * the customer's email, postal address and Stripe session. The safeguard against
 * any of that leaking is that this function names its five fields explicitly and
 * a test asserts the key set is exactly those five, rather than merely including
 * them.
 */
export function buildPurchaseProps({
  orderTotal,
  currency,
  fulfillmentMethod,
  store,
  itemCount,
}: PurchaseInput): PurchaseProps {
  return {
    value: Number.isFinite(orderTotal) ? orderTotal : 0,
    currency: (currency || 'USD').toUpperCase(),
    fulfillment_method: fulfillmentMethod || 'unknown',
    store: store || 'unknown',
    item_count: Number.isFinite(itemCount) ? itemCount : 0,
  };
}

/** Give up on the send after this long rather than hold up the confirmation. */
const SEND_TIMEOUT_MS = 1500;

/**
 * Send the purchase event, and never let it affect the order.
 *
 * Recording the order always wins. Two things are swallowed here on purpose:
 *
 * - **Rejections.** The caller sits inside the route's outer `try`, whose
 *   `catch` logs "Failed to insert SC_Order after payment". An analytics error
 *   escaping this function would be reported as a failure on the money path and
 *   send whoever reads that log looking in entirely the wrong place.
 * - **Hangs.** `track` performs a network call with no timeout of its own, so a
 *   stalled analytics endpoint would otherwise stall a customer's confirmation.
 */
export async function emitPurchase(input: PurchaseInput): Promise<void> {
  try {
    await Promise.race([
      track(EVENTS.PURCHASE, buildPurchaseProps(input)),
      new Promise<void>(resolve => setTimeout(resolve, SEND_TIMEOUT_MS)),
    ]);
  } catch (err) {
    logger.warn(`Analytics: failed to report ${EVENTS.PURCHASE}`, err);
  }
}
