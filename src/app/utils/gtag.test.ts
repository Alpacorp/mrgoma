import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CONSENT_KEY } from './consent';

const setGtag = (fn?: (...args: unknown[]) => void) => {
  (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag = fn;
};

/**
 * Consent gating was added in feature 016. Before it, these tests only had to
 * make `window.gtag` exist; now they must also record consent, because a
 * measurement call with no agreement behind it is precisely what the guard is
 * there to stop.
 */
const grant = () => window.localStorage.setItem(CONSENT_KEY, 'true');

beforeEach(() => {
  window.localStorage.clear();
});

describe('gtag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    setGtag(undefined);
    window.localStorage.clear();
  });

  it('is a no-op when GA is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.resetModules();
    const { pageview, event } = await import('./gtag');
    expect(() => pageview('/x')).not.toThrow();
    expect(() => event({ action: 'click' })).not.toThrow();
  });

  it('forwards pageview and event to window.gtag when configured and consented', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    const spy = vi.fn();
    setGtag(spy);
    grant();

    const { pageview, event } = await import('./gtag');

    pageview('/home');
    expect(spy).toHaveBeenCalledWith('config', 'G-TEST', { page_path: '/home' });

    event({ action: 'add_to_cart', category: 'ecom', value: 5 });
    expect(spy).toHaveBeenCalledWith(
      'event',
      'add_to_cart',
      expect.objectContaining({ event_category: 'ecom', value: 5 })
    );
  });

  it('sends nothing while consent is absent, even though gtag is loaded', async () => {
    // The bug feature 016 exposed. Withdrawing consent mid-session cannot unload
    // a script that has already run: `window.gtag` stays a callable function, so
    // a guard that only checks for its existence keeps sending to Google after
    // the visitor has said no. Unreachable before there was a way to change your
    // mind — which is what made it worth finding then rather than later.
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    const spy = vi.fn();
    setGtag(spy);
    // No consent recorded — the visitor declined, or withdrew a moment ago.

    const { pageview, event } = await import('./gtag');

    pageview('/home');
    event({ action: 'add_to_cart' });

    expect(spy).not.toHaveBeenCalled();
  });

  it('stops sending the instant consent is withdrawn, with no reload', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    const spy = vi.fn();
    setGtag(spy);
    grant();

    const { event } = await import('./gtag');
    const { revokeConsent, WITHDRAW_DAYS } = await import('./consent');

    event({ action: 'before' });
    expect(spy).toHaveBeenCalledTimes(1);

    revokeConsent(WITHDRAW_DAYS);

    event({ action: 'after' });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
