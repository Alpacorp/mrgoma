import { describe, expect, it } from 'vitest';

import type { CartItem } from '@/app/context/CartContext';

import { citiesLabel, groupCartLines, setUnitToLine, treadRangeLabel } from './cartSets';

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

describe('citiesLabel (047, D5)', () => {
  it('names one city once, and both when a set mixes them', () => {
    expect(citiesLabel(['Orlando', 'Orlando'])).toBe('Orlando');
    expect(citiesLabel(['Orlando', 'Miami', 'Orlando'])).toBe('Miami and Orlando');
  });

  it('skips lines without a city', () => {
    expect(citiesLabel([undefined, 'Miami'])).toBe('Miami');
    expect(citiesLabel([undefined])).toBe('');
  });
});

describe('setUnitToLine (047, owner review)', () => {
  it('carries what the cart compares: tread, life, patch and DOT', () => {
    const line = setUnitToLine(
      {
        id: '9',
        code: 'C9',
        price: 120,
        tread: 8.6,
        life: '86%',
        patched: true,
        dot: '2325',
        image: null,
        condition: 'Used',
        city: 'Orlando',
      },
      { brand: 'CONTINENTAL', model2: 'PROCONTACT TX', size: '235/50/19' }
    );
    expect(line).toMatchObject({
      tread: 8.6,
      life: '86%',
      patched: true,
      dot: '2325',
      city: 'Orlando',
    });
  });
});
