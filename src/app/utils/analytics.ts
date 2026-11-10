import { track } from '@vercel/analytics';

import { ecommerceEvent, event as gaEvent, type GaEventParams } from '@/app/utils/gtag';

/**
 * Send one interaction to both analytics platforms.
 *
 * GA4 is the primary source of truth but sees only a fraction of reality: it is
 * blocked by ad-blockers and gated behind the cookie banner, and measurement in
 * August 2026 put it at roughly one visitor in five. Vercel Web Analytics is
 * first-party and cookie-free, so it runs ungated and gives a second, fuller
 * reading of the same click. The gap between the two counts is itself the
 * measurement — see `spec/features/015-vercel-event-tracking/spec.md`.
 *
 * Callers keep using the declarative `data-track` markup; `InteractionTracker`
 * routes every one of them through here. Import `trackEvent` directly only when
 * the moment worth recording is not a click — a resolved request, say.
 */

/** What Vercel Web Analytics stores. Nested objects are not supported. */
type AllowedPropertyValue = string | number | boolean | null;

export type VercelEventProps = Record<string, AllowedPropertyValue>;

const isAllowed = (v: unknown): v is AllowedPropertyValue =>
  v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

/**
 * Force a value into something Vercel will store.
 *
 * Vercel silently *drops* properties it dislikes in production, which would make
 * a bad property invisible rather than loud. Converting here instead means the
 * data always arrives in a shape we chose and can test.
 */
const coerce = (v: unknown): AllowedPropertyValue => {
  if (isAllowed(v)) return v;
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    // Circular structures throw; a lossy label beats losing the property.
    return String(v);
  }
};

/**
 * Flatten a GA-shaped event into Vercel's flat property bag.
 *
 * GA's payload uses `event_category` / `event_label`; Vercel gets the plain
 * names. Event *names* stay identical across both platforms so a number in one
 * dashboard can be compared against the other without a translation table.
 */
export function toVercelProps({
  category,
  label,
  value,
  params,
}: GaEventParams): VercelEventProps | undefined {
  const props: VercelEventProps = {};

  if (category !== undefined) props.category = coerce(category);
  if (label !== undefined) props.label = coerce(label);
  if (value !== undefined) props.value = coerce(value);

  for (const [key, val] of Object.entries(params ?? {})) {
    if (val === undefined) continue;
    props[key] = coerce(val);
  }

  return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Report `e` to GA4 and to Vercel Web Analytics.
 *
 * The two sends are isolated from each other: a platform that is blocked,
 * unconfigured or throwing must not take the other down with it, because the
 * whole point of the second reading is that it survives what stops the first.
 */
export function trackEvent(e: GaEventParams): void {
  // A stray import from a Server Component must not throw: Vercel's `track`
  // raises off-browser in development, and there is nothing useful to send.
  if (typeof window === 'undefined') return;

  try {
    gaEvent(e);
  } catch {
    // no-op
  }

  try {
    track(e.action, toVercelProps(e));
  } catch {
    // no-op
  }
}

/** A GA4 ecommerce payload: `items` plus scalars (value, currency, tiers…). */
export type EcommercePayload = {
  items: Array<{ item_id: string }>;
} & Record<string, unknown>;

export type TrackEcommerceOptions = {
  /**
   * Also report to Vercel. Off for `purchase`, which Vercel already counts on
   * the server once per recorded order — a second, browser-side copy would
   * double it.
   */
  vercel?: boolean;
  /**
   * Wait up to this long for GA to confirm the hit left (gtag's
   * `event_callback`). For a caller about to navigate away; 0 resolves at once.
   */
  waitMs?: number;
};

/**
 * Flatten an ecommerce payload for Vercel, which stores no arrays and would
 * otherwise get the product list as a JSON string. It gets the summary —
 * `item_count`, the single `item_id` when there is exactly one, and every
 * scalar the payload carries (value, currency, shipping_tier, payment_type…).
 */
export function toVercelEcommerceProps(payload: EcommercePayload): VercelEventProps {
  const props: VercelEventProps = {};
  for (const [key, val] of Object.entries(payload)) {
    if (key === 'items' || val === undefined) continue;
    if (isAllowed(val)) props[key] = val;
  }
  props.item_count = payload.items.length;
  if (payload.items.length === 1) props.item_id = payload.items[0].item_id;
  return props;
}

/**
 * Report a GA4 ecommerce event (feature 040).
 *
 * GA4 gets the full payload, `items` included — without them its ecommerce
 * reports ignore the event, which is why the `data-track` markup cannot be used
 * here. Vercel gets the flat summary under the same event name.
 *
 * Never rejects. The returned promise resolves when GA confirms the send, after
 * `waitMs`, or at once when `waitMs` is 0 — whichever comes first — so a
 * blocked or absent GA can never hold up the caller longer than it allowed.
 */
export function trackEcommerce(
  name: string,
  payload: EcommercePayload,
  { vercel = true, waitMs = 0 }: TrackEcommerceOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise<void>(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    try {
      ecommerceEvent(name, payload, waitMs > 0 ? finish : undefined);
    } catch {
      // no-op
    }

    if (vercel) {
      try {
        track(name, toVercelEcommerceProps(payload));
      } catch {
        // no-op
      }
    }

    if (waitMs > 0) setTimeout(finish, waitMs);
    else finish();
  });
}
