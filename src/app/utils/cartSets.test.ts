import { describe, expect, it } from 'vitest';

import type { CartItem } from '@/app/context/CartContext';

import { cartCities, groupCartLines, oddCity, treadRangeLabel } from './cartSets';

const item = (id: string, over: Partial<CartItem> = {}): CartItem => ({
  id,
  name: id,
  price: 100,
  quantity: 1,
  ...over,
});

describe('groupCartLines', () => {
  it('groups lines of one set with total and range, keeps singles apart', () => {
    const groups = groupCartLines([
      item('1', { setId: 's', tread: 9 }),
      item('x'),
      item('2', { setId: 's', tread: 10, price: 120 }),
    ]);
    expect(groups).toEqual([
      {
        kind: 'set',
        setId: 's',
        items: [expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })],
        total: 220,
        range: '9–10/32',
      },
      { kind: 'single', item: expect.objectContaining({ id: 'x' }) },
    ]);
  });

  it('shows a set reduced to one tire as a single tire', () => {
    expect(groupCartLines([item('1', { setId: 's' })])).toEqual([
      { kind: 'single', item: expect.objectContaining({ id: '1' }) },
    ]);
  });
});

describe('treadRangeLabel', () => {
  it('handles uniform, mixed and missing treads', () => {
    expect(treadRangeLabel([10, 10])).toBe('10/32');
    expect(treadRangeLabel([8.5, 10])).toBe('8.5–10/32');
    expect(treadRangeLabel([null, undefined])).toBeNull();
  });
});

describe('cartCities', () => {
  it('lists the cities and flags lines saved before cities were stored', () => {
    expect(
      cartCities([item('1', { city: 'Miami' }), item('2', { city: 'Orlando' }), item('3')])
    ).toEqual({
      cities: ['Miami', 'Orlando'],
      unknown: true,
    });
  });
});

describe('oddCity', () => {
  it('names the city with fewer tires, and nothing for one city or a tie', () => {
    const m = (id: string) => item(id, { city: 'Miami' });
    const o = (id: string) => item(id, { city: 'Orlando' });
    expect(oddCity([m('1'), m('2'), o('3')])).toEqual({ city: 'Orlando', count: 1 });
    expect(oddCity([m('1'), m('2')])).toBeNull();
    expect(oddCity([m('1'), o('2')])).toBeNull();
  });
});
