import { trackEcommerce } from '@/app/utils/analytics';
import { EVENTS } from '@/app/utils/analyticsEvents';
import { cartPayload, type TireLike } from '@/app/utils/ecommerce';

/**
 * Cart events shared by the cart drawer and the checkout (feature 046). Thin on
 * purpose: the payload is 040's `cartPayload`, and the decision of *when* to
 * call these — only for the shopper's own actions (D3, D4) — stays at the
 * controls that know it.
 */

/** The cart drawer opened with these tires. Nothing for an empty cart. */
export function trackViewCart(lines: TireLike[]): void {
  if (lines.length === 0) return;
  void trackEcommerce(EVENTS.VIEW_CART, cartPayload(lines));
}

/** The shopper removed these tires (one, a set, or a city's tires). */
export function trackRemoval(lines: TireLike[]): void {
  if (lines.length === 0) return;
  void trackEcommerce(EVENTS.REMOVE_FROM_CART, cartPayload(lines));
}
