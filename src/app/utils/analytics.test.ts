import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toVercelEcommerceProps, toVercelProps, trackEcommerce, trackEvent } from './analytics';

// Both sinks are mocked so each can be made to fail independently — the point of
// `trackEvent` is that neither platform can take the other down.
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@/app/utils/gtag', () => ({ event: vi.fn(), ecommerceEvent: vi.fn() }));

const { track } = await import('@vercel/analytics');
const { event: gaEvent, ecommerceEvent } = await import('@/app/utils/gtag');

const vercelTrack = vi.mocked(track);
const ga = vi.mocked(gaEvent);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('toVercelProps', () => {
  it('maps category, label and value to their plain names', () => {
    expect(toVercelProps({ action: 'x', category: 'ecom', label: 'Goodyear', value: 5 })).toEqual({
      category: 'ecom',
      label: 'Goodyear',
      value: 5,
    });
  });

  it('forwards extra params under their own keys', () => {
    expect(toVercelProps({ action: 'x', params: { tire_id: '123', featured: true } })).toEqual({
      tire_id: '123',
      featured: true,
    });
  });

  it('passes null through but drops undefined', () => {
    expect(toVercelProps({ action: 'x', params: { kept: null, gone: undefined } })).toEqual({
      kept: null,
    });
  });

  it('returns undefined when there is nothing to send', () => {
    expect(toVercelProps({ action: 'x' })).toBeUndefined();
  });

  it('stringifies a value Vercel cannot store, leaving its siblings intact', () => {
    // AC4: the event must still be delivered and the other properties survive.
    const props = toVercelProps({
      action: 'x',
      label: 'kept',
      params: { nested: { a: 1 } },
    });

    expect(props).toEqual({ label: 'kept', nested: '{"a":1}' });
  });

  it('falls back to String() when a value cannot be serialised', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(toVercelProps({ action: 'x', params: { circular } })).toEqual({
      circular: '[object Object]',
    });
  });
});

describe('trackEvent', () => {
  it('sends the same event name to both platforms', () => {
    trackEvent({ action: 'add_to_cart', category: 'ecom' });

    expect(ga).toHaveBeenCalledWith({ action: 'add_to_cart', category: 'ecom' });
    expect(vercelTrack).toHaveBeenCalledWith('add_to_cart', { category: 'ecom' });
  });

  it('still reaches Vercel when GA is unavailable', () => {
    // AC2: GA no-ops without consent (no `window.gtag`); Vercel is ungated, so
    // the visitor who never accepts the banner is still counted there.
    ga.mockImplementation(() => {
      throw new Error('gtag missing');
    });

    trackEvent({ action: 'open_whatsapp' });

    expect(vercelTrack).toHaveBeenCalledWith('open_whatsapp', undefined);
  });

  it('still reaches GA when Vercel throws', () => {
    vercelTrack.mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => trackEvent({ action: 'call_store' })).not.toThrow();
    expect(ga).toHaveBeenCalledWith({ action: 'call_store' });
  });
});

describe('trackEcommerce (feature 040)', () => {
  const gaEcom = vi.mocked(ecommerceEvent);
  const payload = {
    currency: 'USD',
    value: 241,
    items: [
      { item_id: '1', item_name: 'Used Michelin Defender 225/65R17', price: 120.5, quantity: 2 },
    ],
  };

  it('gives GA the full payload, items included', async () => {
    await trackEcommerce('add_to_cart', payload);
    expect(gaEcom).toHaveBeenCalledWith('add_to_cart', payload, undefined);
  });

  it('gives Vercel a flat summary — no array, no JSON string', async () => {
    await trackEcommerce('add_to_cart', payload);
    expect(vercelTrack).toHaveBeenCalledWith('add_to_cart', {
      currency: 'USD',
      value: 241,
      item_count: 1,
      item_id: '1',
    });
  });

  it('omits item_id when there is more than one item', () => {
    const two = { ...payload, items: [{ item_id: '1' }, { item_id: '2' }] };
    expect(toVercelEcommerceProps(two)).toEqual({ currency: 'USD', value: 241, item_count: 2 });
  });

  it('forwards scalar extras such as shipping_tier', () => {
    expect(toVercelEcommerceProps({ ...payload, shipping_tier: 'pickup' })).toMatchObject({
      shipping_tier: 'pickup',
    });
  });

  it('skips Vercel when asked — purchase is counted there by the server', async () => {
    await trackEcommerce('purchase', payload, { vercel: false });
    expect(gaEcom).toHaveBeenCalled();
    expect(vercelTrack).not.toHaveBeenCalled();
  });

  it('resolves after waitMs when GA never confirms', async () => {
    vi.useFakeTimers();
    let resolved = false;
    void trackEcommerce('add_payment_info', payload, { waitMs: 600 }).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(599);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });

  it('resolves as soon as GA confirms the send', async () => {
    gaEcom.mockImplementationOnce((_n, _p, onSent) => onSent?.());
    vi.useFakeTimers();
    let resolved = false;
    void trackEcommerce('add_payment_info', payload, { waitMs: 600 }).then(() => {
      resolved = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });

  it('still reaches Vercel when GA throws', async () => {
    gaEcom.mockImplementationOnce(() => {
      throw new Error('blocked');
    });
    await expect(trackEcommerce('view_item', payload)).resolves.toBeUndefined();
    expect(vercelTrack).toHaveBeenCalled();
  });
});
