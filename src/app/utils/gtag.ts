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

export const pageview = (url: string) => {
  try {
    if (!canSend()) return;
    window.gtag('config', GA_ID, {
      page_path: url,
    });
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
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      ...params,
    });
  } catch {
    // no-op
  }
};
