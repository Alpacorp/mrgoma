import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));

const { trackEcommerce } = await import('@/app/utils/analytics');
const { trackRemoval, trackViewCart } = await import('./cartTracking');
const sent = vi.mocked(trackEcommerce);

const line = (id: number, price = 100) => ({
  id,
  name: `(C${id}) | MICHELIN | DEFENDER | 225/65/17`,
  price,
  quantity: 1,
});

beforeEach(() => sent.mockClear());

describe('cart events (046)', () => {
  it('view_cart carries the whole cart with value and currency (AC5)', () => {
    trackViewCart([line(1, 100), line(2, 50), line(3, 25)]);
    expect(sent).toHaveBeenCalledTimes(1);
    const [name, payload] = sent.mock.calls[0];
    expect(name).toBe('view_cart');
    expect(payload).toMatchObject({ currency: 'USD', value: 175 });
    expect(payload.items).toHaveLength(3);
  });

  it('remove_from_cart carries the removed tires once (AC6)', () => {
    trackRemoval([line(1), line(2), line(3), line(4)]);
    expect(sent).toHaveBeenCalledTimes(1);
    expect(sent.mock.calls[0][0]).toBe('remove_from_cart');
    expect(sent.mock.calls[0][1].items).toHaveLength(4);
  });

  it('sends nothing for an empty list', () => {
    trackViewCart([]);
    trackRemoval([]);
    expect(sent).not.toHaveBeenCalled();
  });
});
