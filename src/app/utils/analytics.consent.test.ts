import { afterEach, describe, expect, it, vi } from 'vitest';

import { CONSENT_KEY } from './consent';

/**
 * AC10 of feature 040, end to end through the real `gtag.ts`: a visitor who has
 * not accepted analytics sends nothing to Google, while Vercel — cookie-free and
 * deliberately ungated (feature 015, D1) — still records the event.
 */
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

const setGtag = (fn?: (...args: unknown[]) => void) => {
  (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag = fn;
};

afterEach(() => {
  vi.unstubAllEnvs();
  setGtag(undefined);
  window.localStorage.clear();
});

const load = async () => {
  vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST');
  vi.resetModules();
  const { track } = await import('@vercel/analytics');
  vi.mocked(track).mockClear();
  const { trackEcommerce } = await import('./analytics');
  return { trackEcommerce, track: vi.mocked(track) };
};

const payload = { currency: 'USD', value: 80, items: [{ item_id: '7' }] };

describe('trackEcommerce and consent', () => {
  it('without consent: nothing to GA, the flat event to Vercel', async () => {
    const ga = vi.fn();
    setGtag(ga);
    const { trackEcommerce, track } = await load();

    await trackEcommerce('add_to_cart', payload);

    expect(ga).not.toHaveBeenCalled();
    expect(track).toHaveBeenCalledWith('add_to_cart', expect.objectContaining({ item_id: '7' }));
  });

  it('with consent: both', async () => {
    const ga = vi.fn();
    setGtag(ga);
    window.localStorage.setItem(CONSENT_KEY, 'true');
    const { trackEcommerce, track } = await load();

    await trackEcommerce('add_to_cart', payload);

    expect(ga).toHaveBeenCalledWith('event', 'add_to_cart', expect.objectContaining(payload));
    expect(track).toHaveBeenCalled();
  });
});
