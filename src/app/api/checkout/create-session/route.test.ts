import type { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Feature 041: the server is the authority on pickup-by-city. Every request
 * stops at the availability check (409) or — when nothing is wrong — at the
 * WhatsApp branch, so Stripe is never reached and needs no mock beyond the env.
 */

vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

const { POST } = await import('./route');
const { locationsData } = await import('@/app/ui/sections/LocationsSlider/locationsData');

const miamiStore = locationsData.find(l => l.city === 'Miami')!;
const orlandoStore = locationsData.find(l => l.city === 'Orlando')!;

type TireStub = { status?: string; city?: 'Miami' | 'Orlando'; price?: number };
let tires: Record<string, TireStub | null> = {};

beforeEach(() => {
  vi.stubEnv('ENABLE_STRIPE_CHECKOUT', 'false');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const id = new URL(url).searchParams.get('productId') ?? '';
      const tire = tires[id];
      if (!tire) return { ok: false, status: 404, json: async () => ({}) };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          name: `(${id}) | MICHELIN | 225/65/17`,
          brand: 'MICHELIN',
          price: tire.price ?? 100,
          status: tire.status ?? 'available',
          city: tire.city ?? 'Miami',
          images: [],
        }),
      };
    })
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  tires = {};
});

const req = (body: unknown) =>
  ({
    url: 'https://x.test/api/checkout/create-session',
    headers: new Headers(),
    json: async () => body,
  }) as unknown as NextRequest;

describe('POST /api/checkout/create-session — pickup by city', () => {
  it('rejects a pickup in Miami for a tire in Orlando, with code "city" (AC10)', async () => {
    tires = { '1': { city: 'Orlando' } };
    const res = await POST(
      req({ items: [{ id: '1' }], fulfillmentMethod: 'pickup', pickupStoreId: miamiStore.id })
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.unavailable).toEqual([expect.objectContaining({ id: '1', code: 'city' })]);
  });

  it('accepts a pickup in the tires’ own city', async () => {
    tires = { '1': { city: 'Orlando' }, '2': { city: 'Orlando' } };
    const res = await POST(
      req({
        items: [{ id: '1' }, { id: '2' }],
        fulfillmentMethod: 'pickup',
        pickupStoreId: orlandoStore.id,
      })
    );
    expect(res.status).toBe(200);
  });

  it('does not apply the city rule to delivery', async () => {
    tires = { '1': { city: 'Orlando' }, '2': { city: 'Miami' } };
    const res = await POST(
      req({ items: [{ id: '1' }, { id: '2' }], fulfillmentMethod: 'delivery', shippingState: 'FL' })
    );
    expect(res.status).toBe(200);
  });

  it('marks a sold tire with code "sold" and keeps the human reason', async () => {
    tires = { '1': { status: 'sold' } };
    const res = await POST(req({ items: [{ id: '1' }], fulfillmentMethod: 'delivery' }));
    expect(res.status).toBe(409);
    expect((await res.json()).unavailable).toEqual([
      { id: '1', reason: 'Product is already sold', code: 'sold' },
    ]);
  });

  it('marks a missing tire as "unavailable"', async () => {
    const res = await POST(req({ items: [{ id: '9' }], fulfillmentMethod: 'delivery' }));
    expect((await res.json()).unavailable[0]).toMatchObject({ id: '9', code: 'unavailable' });
  });
});
