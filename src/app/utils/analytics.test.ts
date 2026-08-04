import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toVercelProps, trackEvent } from './analytics';

// Both sinks are mocked so each can be made to fail independently — the point of
// `trackEvent` is that neither platform can take the other down.
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@/app/utils/gtag', () => ({ event: vi.fn() }));

const { track } = await import('@vercel/analytics');
const { event: gaEvent } = await import('@/app/utils/gtag');

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
