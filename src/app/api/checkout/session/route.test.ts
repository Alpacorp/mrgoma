import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// `h.impl` swaps behaviour without `mockRejectedValue`, which Vitest re-reports
// as an unhandled error even when the code catches it. Same pattern as
// `src/app/api/tires/route.test.ts`.
const h = vi.hoisted(() => ({
  session: {} as Record<string, unknown>,
  existingOrder: null as { orderId: number; orderGuid: string } | null,
  emitCalls: [] as unknown[][],
  emitImpl: (async () => {}) as (...a: unknown[]) => unknown,
}));

vi.mock('@/app/api/checkout/_lib/purchaseEvent', () => ({
  emitPurchase: (...args: unknown[]) => {
    h.emitCalls.push(args);
    return h.emitImpl(...args);
  },
}));

vi.mock('stripe', () => ({
  default: class {
    checkout = {
      sessions: {
        retrieve: async () => h.session,
        listLineItems: async () => ({ data: [] }),
      },
    };
    paymentIntents = { retrieve: async () => ({ latest_charge: null }) };
  },
}));

vi.mock('@/repositories/ordersRepository', () => ({
  getOrderByStripeSessionId: async () => h.existingOrder,
  insertOrder: async () => ({ orderId: 1, orderGuid: 'guid-1' }),
}));
vi.mock('@/repositories/orderDetailsRepository', () => ({
  insertOrderDetailsByOrderId: async () => ({ inserted: 0, orderNumber: null }),
}));
vi.mock('@/repositories/tiresRepository', () => ({
  fetchTiresByIds: async () => [],
  setTiresConditionIdToSoldByIds: async () => ({ updated: 0 }),
}));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

import { GET } from './route';

const req = () =>
  ({
    url: 'https://x.test/api/checkout/session?session_id=cs_1',
    headers: new Headers(),
  }) as unknown as NextRequest;

const paidSession = {
  id: 'cs_1',
  payment_status: 'paid',
  amount_total: 32050,
  currency: 'usd',
  created: 1_750_000_000,
  metadata: { fulfillmentMethod: 'pickup', pickupStoreId: '3' },
  customer_details: { email: 'john@example.com' },
};

beforeEach(() => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
  vi.stubEnv('CHECKOUT_TEST_MODE', '');
  h.session = { ...paidSession };
  h.existingOrder = null;
  h.emitCalls = [];
  h.emitImpl = async () => {};
});

describe('GET /api/checkout/session — purchase reporting', () => {
  it('reports the purchase once for a newly recorded paid order', async () => {
    const res = await GET(req());

    expect(res.status).toBe(200);
    expect(h.emitCalls).toHaveLength(1);
    expect(h.emitCalls[0][0]).toMatchObject({
      orderTotal: 320.5,
      currency: 'USD',
      fulfillmentMethod: 'pickup',
    });
  });

  it('reports nothing when the payment has not settled', async () => {
    h.session = { ...paidSession, payment_status: 'unpaid' };

    await GET(req());

    expect(h.emitCalls).toHaveLength(0);
  });

  it('reports nothing when the order already exists', async () => {
    // AC12: the customer reloading or sharing the confirmation URL must not
    // multiply the sale. The guard is the same one that stops a duplicate order.
    h.existingOrder = { orderId: 1, orderGuid: 'guid-1' };

    await GET(req());
    await GET(req());
    await GET(req());

    expect(h.emitCalls).toHaveLength(0);
  });

  it('reports nothing in checkout test mode', async () => {
    vi.stubEnv('CHECKOUT_TEST_MODE', 'true');

    await GET(req());

    expect(h.emitCalls).toHaveLength(0);
  });

  it('still returns the order when the analytics send fails', async () => {
    // AC15: recording the order always wins.
    h.emitImpl = async () => {
      throw new Error('analytics down');
    };

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.sc_order_id).toBe(1);
    expect(body.payment_status).toBe('paid');
  });

  it('never puts the customer email in the analytics payload', async () => {
    await GET(req());

    expect(JSON.stringify(h.emitCalls)).not.toContain('john@example.com');
  });
});
