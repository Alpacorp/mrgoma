import { beforeEach, describe, expect, it, vi } from 'vitest';

// Two traps this repo has hit before, both avoided here:
//
// 1. The suite runs in jsdom, so `window` exists — and the real
//    `@vercel/analytics/server` throws by design when it sees `window` outside
//    production. The module must be mocked or every test fails for the wrong
//    reason.
// 2. A `vi.fn` that rejects is re-reported by Vitest as an unhandled error even
//    when the code catches it, so a swappable plain function (`h.impl`) is used
//    instead of `mockRejectedValue` — the same pattern as
//    `src/app/api/tires/route.test.ts`.
const h = vi.hoisted(() => ({
  impl: (async () => {}) as (...a: unknown[]) => unknown,
  calls: [] as unknown[][],
}));

vi.mock('@vercel/analytics/server', () => ({
  track: (...args: unknown[]) => {
    h.calls.push(args);
    return h.impl(...args);
  },
}));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

import { buildPurchaseProps, emitPurchase } from './purchaseEvent';

const INPUT = {
  orderTotal: 320.5,
  currency: 'usd',
  fulfillmentMethod: 'pickup',
  store: '3',
  itemCount: 4,
};

beforeEach(() => {
  h.impl = async () => {};
  h.calls = [];
  vi.clearAllMocks();
});

describe('buildPurchaseProps', () => {
  it('returns exactly the five agreed fields', () => {
    // Exact key-set equality, not a subset: a payload that merely *includes* the
    // right fields would let anything else ride along unnoticed.
    expect(Object.keys(buildPurchaseProps(INPUT)).sort()).toEqual([
      'currency',
      'fulfillment_method',
      'item_count',
      'store',
      'value',
    ]);
  });

  it('normalises the currency and carries the total in major units', () => {
    expect(buildPurchaseProps(INPUT)).toMatchObject({ value: 320.5, currency: 'USD' });
  });

  it('labels missing metadata rather than emitting undefined', () => {
    const props = buildPurchaseProps({ orderTotal: 10, currency: 'USD', itemCount: 1 });

    expect(props.fulfillment_method).toBe('unknown');
    expect(props.store).toBe('unknown');
  });

  it('never lets personal data into the payload', () => {
    // The caller is a request handler holding all of this. Build from a fixture
    // that carries it and assert none of it survives.
    const props = buildPurchaseProps({
      ...INPUT,
      ...({
        email: 'john@example.com',
        phone: '305-555-0134',
        name: 'John Doe',
        address: '123 Biscayne Blvd, Miami',
        stripeSessionId: 'cs_test_a1b2c3',
      } as unknown as object),
    });

    const serialised = JSON.stringify(props);
    for (const secret of ['john@example.com', '305-555-0134', 'John Doe', 'Biscayne', 'cs_test']) {
      expect(serialised).not.toContain(secret);
    }
  });
});

describe('emitPurchase', () => {
  it('sends the purchase event with the built payload', async () => {
    await emitPurchase(INPUT);

    expect(h.calls).toHaveLength(1);
    expect(h.calls[0][0]).toBe('purchase');
    expect(h.calls[0][1]).toMatchObject({ value: 320.5, item_count: 4 });
  });

  it('resolves quietly when the send rejects', async () => {
    h.impl = async () => {
      throw new Error('analytics endpoint down');
    };

    await expect(emitPurchase(INPUT)).resolves.toBeUndefined();
  });

  it('resolves even when the send never settles', async () => {
    // A stalled analytics endpoint must not stall a customer's confirmation.
    vi.useFakeTimers();
    h.impl = () => new Promise(() => {});

    const pending = emitPurchase(INPUT);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(pending).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
