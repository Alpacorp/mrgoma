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
    // A production build, so no `debug_mode` is added (see the debug tests below).
    vi.stubEnv('NODE_ENV', 'production');
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

/**
 * Feature 040. Everything below loads a fresh module per test: `GA_DEBUG` is read
 * at import, and the pending queue is module state.
 */
const load = async (env: { nodeEnv?: string; debug?: string } = {}) => {
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
  vi.stubEnv('NODE_ENV', env.nodeEnv ?? 'production');
  if (env.debug !== undefined) vi.stubEnv('NEXT_PUBLIC_GA_DEBUG', env.debug);
  vi.resetModules();
  return import('./gtag');
};

describe('debug mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setGtag(undefined);
    window.localStorage.clear();
  });

  it('omits debug_mode entirely in a production build — GA reads `false` as on', async () => {
    const spy = vi.fn();
    setGtag(spy);
    grant();
    const { ecommerceEvent, pageview, GA_DEBUG } = await load();

    expect(GA_DEBUG).toBe(false);
    pageview('/x');
    ecommerceEvent('view_item', { value: 1 });
    for (const call of spy.mock.calls) expect(call[2]).not.toHaveProperty('debug_mode');
  });

  it('adds debug_mode: true outside a production build', async () => {
    const spy = vi.fn();
    setGtag(spy);
    grant();
    const { ecommerceEvent, pageview } = await load({ nodeEnv: 'development' });

    pageview('/x');
    ecommerceEvent('view_item', { value: 1 });
    expect(spy).toHaveBeenCalledWith('config', 'G-TEST', { page_path: '/x', debug_mode: true });
    expect(spy).toHaveBeenCalledWith('event', 'view_item', { value: 1, debug_mode: true });
  });

  it('can be switched on for a production build with NEXT_PUBLIC_GA_DEBUG', async () => {
    const { GA_DEBUG } = await load({ debug: 'true' });
    expect(GA_DEBUG).toBe(true);
  });
});

describe('ecommerceEvent', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setGtag(undefined);
    window.localStorage.clear();
  });

  it('sends the params untouched, without event_category / event_label', async () => {
    const spy = vi.fn();
    setGtag(spy);
    grant();
    const { ecommerceEvent } = await load();

    const params = { currency: 'USD', value: 120, items: [{ item_id: '1' }] };
    ecommerceEvent('add_to_cart', params);
    expect(spy).toHaveBeenCalledWith('event', 'add_to_cart', params);
  });

  it('passes the callback as event_callback', async () => {
    const spy = vi.fn();
    setGtag(spy);
    grant();
    const { ecommerceEvent } = await load();
    const onSent = vi.fn();

    ecommerceEvent('add_payment_info', { value: 1 }, onSent);
    expect(spy.mock.calls[0][2]).toMatchObject({ event_callback: onSent });
  });
});

describe('pending queue — events raised before gtag exists', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setGtag(undefined);
    window.localStorage.clear();
  });

  it('holds an event until ga:ready, then replays it in order', async () => {
    grant();
    const { ecommerceEvent, pendingCount, GA_READY_EVENT } = await load();

    ecommerceEvent('view_item', { n: 1 });
    ecommerceEvent('add_to_cart', { n: 2 });
    expect(pendingCount()).toBe(2);

    const spy = vi.fn();
    setGtag(spy);
    window.dispatchEvent(new Event(GA_READY_EVENT));

    expect(pendingCount()).toBe(0);
    expect(spy.mock.calls.map(c => c[1])).toEqual(['view_item', 'add_to_cart']);
  });

  it('holds nothing when consent was never given', async () => {
    const { ecommerceEvent, pendingCount } = await load();
    ecommerceEvent('view_item', {});
    expect(pendingCount()).toBe(0);
  });

  it('drops what it held if consent is withdrawn before gtag is ready', async () => {
    grant();
    const { ecommerceEvent, flushPending, pendingCount } = await load();
    ecommerceEvent('purchase', { value: 100 });
    expect(pendingCount()).toBe(1);

    window.localStorage.clear(); // withdrawn
    const spy = vi.fn();
    setGtag(spy);
    flushPending();

    expect(spy).not.toHaveBeenCalled();
    expect(pendingCount()).toBe(0);
  });

  it('keeps at most 20 calls, dropping the oldest', async () => {
    grant();
    const { ecommerceEvent, flushPending, pendingCount } = await load();
    for (let i = 0; i < 25; i++) ecommerceEvent('e', { i });
    expect(pendingCount()).toBe(20);

    const spy = vi.fn();
    setGtag(spy);
    flushPending();
    expect(spy.mock.calls[0][2]).toEqual({ i: 5 });
  });
});
