import type { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Feature 041 made the server the authority on pickup-by-city; feature 047
 * lifted the rule (pickup at any store). Every request stops at the
 * availability check (409) or — when nothing is wrong — at the WhatsApp
 * branch, so Stripe is never reached and needs no mock beyond the env.
 */

// Stripe mocked so the session parameters can be read (feature 048).
const stripeMock = vi.hoisted(() => ({ params: null as Record<string, unknown> | null }));
vi.mock('stripe', () => ({
  default: class {
    checkout = {
      sessions: {
        create: async (p: Record<string, unknown>) => {
          stripeMock.params = p;
          return { url: 'https://checkout.stripe.com/c/pay/cs_test_x' };
        },
      },
    };
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

const { POST } = await import('./route');
const { locationsData } = await import('@/app/ui/sections/LocationsSlider/locationsData');

const miamiStore = locationsData.find(l => l.city === 'Miami')!;
const orlandoStore = locationsData.find(l => l.city === 'Orlando')!;

type TireStub = {
  status?: string;
  city?: 'Miami' | 'Orlando';
  price?: number;
  image?: string;
  condition?: 'New' | 'Used';
};
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
          model2: 'DEFENDER',
          size: '225/65/17',
          code: id,
          condition: tire.condition ?? 'Used',
          treadDepth: '8.6',
          remainingLife: '86%',
          patched: 'Yes',
          price: tire.price ?? 100,
          status: tire.status ?? 'available',
          city: tire.city ?? 'Miami',
          images: tire.image ? [{ src: tire.image }] : [],
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

describe('POST /api/checkout/create-session — pickup at any store (047)', () => {
  it('accepts a pickup in Miami for a tire in Orlando (AC9)', async () => {
    tires = { '1': { city: 'Orlando' } };
    const res = await POST(
      req({ items: [{ id: '1' }], fulfillmentMethod: 'pickup', pickupStoreId: miamiStore.id })
    );
    expect(res.status).toBe(200);
  });

  it('accepts a pickup for a cart with tires in both cities (AC7)', async () => {
    tires = { '1': { city: 'Orlando' }, '2': { city: 'Miami' } };
    for (const store of [miamiStore, orlandoStore]) {
      const res = await POST(
        req({
          items: [{ id: '1' }, { id: '2' }],
          fulfillmentMethod: 'pickup',
          pickupStoreId: store.id,
        })
      );
      expect(res.status).toBe(200);
    }
  });

  it('still refuses a sold tire on a pickup in another city (AC11)', async () => {
    tires = { '1': { city: 'Orlando', status: 'sold' }, '2': { city: 'Orlando' } };
    const res = await POST(
      req({
        items: [{ id: '1' }, { id: '2' }],
        fulfillmentMethod: 'pickup',
        pickupStoreId: miamiStore.id,
      })
    );
    expect(res.status).toBe(409);
    expect((await res.json()).unavailable).toEqual([
      { id: '1', reason: 'Product is already sold', code: 'sold' },
    ]);
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

describe('POST /api/checkout/create-session — what Stripe shows (048)', () => {
  const PHOTO = 'https://www.usedtires.online/LOTS/PEM/a/images/1.jpg';
  const GENERIC = '/assets/images/generic-tire-image.webp';
  const BLOB = 'https://abc.public.blob.vercel-storage.com/generic-tire.png';

  type Line = {
    quantity: number;
    price_data: {
      unit_amount: number;
      product_data: {
        name: string;
        description?: string;
        images?: string[];
        metadata: Record<string, string>;
      };
    };
  };
  const lines = () => (stripeMock.params?.line_items ?? []) as Line[];

  beforeEach(() => {
    stripeMock.params = null;
    vi.stubEnv('ENABLE_STRIPE_CHECKOUT', 'true');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('CHECKOUT_FALLBACK_IMAGE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.mrgomatires.com');
    vi.stubEnv('API_URL', '');
    vi.stubEnv('ASSETS_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_ASSETS_BASE_URL', '');
  });

  it('sends readable names, descriptions and only fetchable images (AC1–AC4)', async () => {
    tires = {
      '1': { image: PHOTO },
      '2': { image: GENERIC },
      '3': { condition: 'New', image: GENERIC },
    };
    const res = await POST(
      req({
        items: [{ id: '1' }, { id: '2' }, { id: '3' }],
        fulfillmentMethod: 'delivery',
        shippingState: 'FL',
      })
    );
    expect(res.status).toBe(200);
    const [withPhoto, noPhoto, newTire] = lines().map(l => l.price_data.product_data);
    expect(withPhoto.name).toBe('Michelin Defender');
    expect(withPhoto.description).toBe('225/65/17 · Used · 8.6/32 · 86% life · Patched · Stock #1');
    expect(withPhoto.images).toEqual([PHOTO]);
    // The site's own image is never sent: none without a fallback.
    expect(noPhoto.images).toBeUndefined();
    expect(newTire.description).toBe('225/65/17 · New · Stock #3');
    // 040's analytics metadata, unchanged.
    expect(Object.keys(withPhoto.metadata).sort()).toEqual(
      ['brand', 'condition', 'model', 'productId', 'size', 'tireCondition'].sort()
    );
    expect(withPhoto.metadata).toMatchObject({ productId: '1', model: 'DEFENDER' });
    // Free shipping for delivery; no currency setting sent (AC5, AC7).
    expect(JSON.stringify(stripeMock.params?.shipping_options)).toContain('Free shipping');
    expect(stripeMock.params).not.toHaveProperty('adaptive_pricing');
  });

  it('uses the Blob-hosted generic image when configured (AC4)', async () => {
    vi.stubEnv('CHECKOUT_FALLBACK_IMAGE_URL', BLOB);
    tires = { '2': { image: GENERIC } };
    await POST(req({ items: [{ id: '2' }], fulfillmentMethod: 'delivery', shippingState: 'FL' }));
    expect(lines()[0].price_data.product_data.images).toEqual([BLOB]);
  });

  it('keeps the pickup tax line and the amounts (AC5)', async () => {
    tires = { '1': { image: PHOTO, price: 200 } };
    await POST(
      req({ items: [{ id: '1' }], fulfillmentMethod: 'pickup', pickupStoreId: miamiStore.id })
    );
    const [tire, tax] = lines();
    expect(tire.price_data.unit_amount).toBe(20000);
    expect(tax.price_data.product_data.name).toBe('Sales tax (7%)');
    expect(tax.price_data.unit_amount).toBe(1400);
  });

  it('keeps the internal name and ID in the WhatsApp order message', async () => {
    vi.stubEnv('ENABLE_STRIPE_CHECKOUT', 'false');
    tires = { '1': { image: PHOTO } };
    const res = await POST(
      req({ items: [{ id: '1' }], fulfillmentMethod: 'delivery', shippingState: 'FL' })
    );
    const { whatsappUrl } = (await res.json()) as { whatsappUrl: string };
    expect(decodeURIComponent(whatsappUrl)).toContain(
      '(1) | MICHELIN | DEFENDER | 225/65/17 (ID: 1)'
    );
  });
});
