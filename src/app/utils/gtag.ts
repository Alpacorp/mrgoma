import { GA_ID, hasConsent } from '@/app/utils/consent';

// `GA_ID` now lives in `consent.ts` — revoking needs it to set Google's opt-out
// property, and this module needs `hasConsent()`, so keeping the id here would
// make the two import each other. Re-exported so existing importers are unaffected.
export { GA_ID };

// Minimal typings for the global gtag function
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Every send is gated on `hasConsent()`, not merely on `window.gtag` existing.
 *
 * The difference matters the moment a visitor withdraws consent mid-session: the
 * script has already run, so `window.gtag` is still a perfectly good function
 * and the old guard let events straight through. That path was unreachable until
 * feature 016 gave visitors a way to change their mind — which is exactly the
 * kind of bug that waits quietly for the feature that exposes it.
 *
 * `ga-disable-<GA_ID>` also stops Google's library sending, so this is a second
 * lock rather than the only one. Both are wanted: the intent should be visible
 * in our own code, not resting on a third party's internal flag.
 */
const canSend = (): boolean =>
  Boolean(GA_ID) &&
  typeof window !== 'undefined' &&
  typeof window.gtag === 'function' &&
  hasConsent();

/**
 * Send GA4 hits in debug mode, so they show in DebugView and stay out of the
 * standard reports (feature 040, decision D5).
 *
 * On for anything that is not a production build — `npm run dev`, which is
 * where Stripe test payments are made — and on demand for a preview deploy via
 * `NEXT_PUBLIC_GA_DEBUG=true`. Live production traffic is never in debug mode.
 */
export const GA_DEBUG =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

/**
 * GA4 reads *any* `debug_mode` key as "on", `false` included — the documented way
 * to stay out of debug is to omit it. So it is added, never set to `false`.
 */
export const withDebug = <T extends Record<string, unknown>>(params: T): T =>
  GA_DEBUG ? { ...params, debug_mode: true } : params;

/**
 * Calls held while consent is given but gtag is not defined yet.
 *
 * `window.gtag` only exists once the `ga-init` inline script has run, which is
 * after hydration. Anything raised before it — `view_item` on a page someone
 * landed on from Google, `purchase` on the full page load back from Stripe —
 * used to be dropped. Those are exactly the events that matter most, so they
 * wait here and are replayed, in order, once `ga-init` dispatches `ga:ready`.
 *
 * Bounded so a page where GA never loads (blocked script) cannot grow it.
 */
const MAX_PENDING = 20;
const pending: unknown[][] = [];

export const GA_READY_EVENT = 'ga:ready';

const send = (...args: unknown[]) => {
  try {
    if (!GA_ID || typeof window === 'undefined' || !hasConsent()) return;
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
      return;
    }
    pending.push(args);
    if (pending.length > MAX_PENDING) pending.shift();
  } catch {
    // no-op
  }
};

/** Replay held calls. Consent is re-read: it may have been withdrawn meanwhile. */
export const flushPending = () => {
  const held = pending.splice(0, pending.length);
  if (!canSend()) return;
  for (const args of held) {
    try {
      window.gtag(...args);
    } catch {
      // no-op
    }
  }
};

/** Exposed for tests only. */
export const pendingCount = () => pending.length;

if (typeof window !== 'undefined') {
  window.addEventListener(GA_READY_EVENT, flushPending);
}

export const pageview = (url: string) => {
  try {
    if (!canSend()) return;
    window.gtag(
      'config',
      GA_ID,
      withDebug({
        page_path: url,
      })
    );
  } catch {
    // no-op
  }
};

export type GaEventParams = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  params?: Record<string, unknown>;
};

export const event = ({ action, category, label, value, params }: GaEventParams) => {
  try {
    if (!canSend()) return;
    window.gtag(
      'event',
      action,
      withDebug({
        event_category: category,
        event_label: label,
        value,
        ...params,
      })
    );
  } catch {
    // no-op
  }
};

/**
 * A GA4 ecommerce event: the params go through untouched — no
 * `event_category` / `event_label`, which GA's ecommerce reports ignore — and,
 * unlike `event`, it is held rather than dropped when gtag has not loaded yet.
 *
 * `onSent` is passed as gtag's `event_callback`, so a caller about to navigate
 * away can wait for the hit to leave.
 */
export const ecommerceEvent = (
  name: string,
  params: Record<string, unknown>,
  onSent?: () => void
) => {
  send('event', name, withDebug(onSent ? { ...params, event_callback: onSent } : params));
};
