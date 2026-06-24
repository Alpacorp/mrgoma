import { afterEach, describe, expect, it, vi } from 'vitest';

const setGtag = (fn?: (...args: unknown[]) => void) => {
  (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag = fn;
};

describe('gtag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    setGtag(undefined);
  });

  it('is a no-op when GA is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.resetModules();
    const { pageview, event } = await import('./gtag');
    expect(() => pageview('/x')).not.toThrow();
    expect(() => event({ action: 'click' })).not.toThrow();
  });

  it('forwards pageview and event to window.gtag when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
    vi.resetModules();
    const spy = vi.fn();
    setGtag(spy);

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
});
