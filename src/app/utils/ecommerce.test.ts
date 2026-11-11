import { describe, expect, it } from 'vitest';

import {
  LISTS,
  cartPayload,
  listPayload,
  searchParams,
  selectPayload,
  normalizeCondition,
  purchasePayload,
  toGaItem,
  toGaItemFromStripeLine,
} from './ecommerce';

const ITEM_KEYS = [
  'item_brand',
  'item_category',
  'item_id',
  'item_name',
  'item_variant',
  'price',
  'quantity',
];

const tire = {
  id: 259893,
  name: '(259893) | MICHELIN | DEFENDER | 225/65R17',
  price: '120.5',
  brand: 'MICHELIN',
  model: 'DEFENDER',
  size: '225/65R17',
  condition: 'Used',
};

describe('toGaItem', () => {
  it('names the tire the way the shopper read it', () => {
    expect(toGaItem(tire)).toEqual({
      item_id: '259893',
      item_name: 'Used Michelin Defender 225/65R17',
      item_brand: 'Michelin',
      item_category: 'Used',
      item_variant: '225/65R17',
      price: 120.5,
      quantity: 1,
    });
  });

  it('emits exactly the GA4 item fields and nothing else', () => {
    // The safeguard against personal data reaching Google: no field can appear
    // here unless this module names it.
    const withExtras = { ...tire, email: 'a@b.c', address: '1 Main St' } as typeof tire;
    expect(Object.keys(toGaItem(withExtras)).sort()).toEqual(ITEM_KEYS);
  });

  it('falls back to the stored name for cart items saved before model/size existed', () => {
    const legacy = { id: 1, name: 'Goodyear 205/55R16', price: 80, condition: 'Used' };
    expect(toGaItem(legacy)).toMatchObject({
      item_name: 'Used Goodyear 205/55R16',
      item_category: 'Used',
    });
    expect(toGaItem(legacy)).not.toHaveProperty('item_variant');
  });

  it('reads brand, model and size from a composed name when they are not fields', () => {
    const card = {
      id: '42',
      name: '(ABC) | Michelin | Pilot | 225/40/18',
      price: '99',
      condition: 'new',
    };
    expect(toGaItem(card)).toMatchObject({
      item_name: 'New Michelin Pilot 225/40/18',
      item_brand: 'Michelin',
      item_variant: '225/40/18',
    });
  });

  it.each([
    ['99.9', 99.9],
    [45, 45],
    ['abc', 0],
    [null, 0],
    [-3, 0],
  ])('reads price %p as %p', (price, expected) => {
    expect(toGaItem({ ...tire, price }).price).toBe(expected);
  });

  it('keeps quantity a whole number of at least one', () => {
    expect(toGaItem({ ...tire, quantity: 0 }).quantity).toBe(1);
    expect(toGaItem({ ...tire, quantity: 2.7 }).quantity).toBe(2);
    expect(toGaItem({ ...tire, quantity: 4 }).quantity).toBe(4);
  });
});

describe('normalizeCondition', () => {
  it.each([
    ['used', 'Used'],
    [' NEW ', 'New'],
    ['sold', undefined],
    [null, undefined],
  ])('%p → %p', (input, expected) => {
    expect(normalizeCondition(input)).toBe(expected);
  });
});

describe('cartPayload', () => {
  it('sums value over price × quantity in store currency', () => {
    const payload = cartPayload([
      { ...tire, quantity: 2 },
      { ...tire, id: 2, price: 60.1 },
    ]);
    expect(payload.currency).toBe('USD');
    expect(payload.value).toBe(301.1);
    expect(payload.items).toHaveLength(2);
  });

  it('is zero and empty for an empty cart', () => {
    expect(cartPayload([])).toEqual({ currency: 'USD', value: 0, items: [] });
  });
});

const stripeLine = {
  productId: '259893',
  description: '(259893) | MICHELIN | DEFENDER | 225/65R17',
  condition: 'Used',
  quantity: 2,
  amount_total: 24100,
  brand: 'MICHELIN',
  model: 'DEFENDER',
  size: '225/65R17',
};

describe('toGaItemFromStripeLine', () => {
  it('uses the unit price, not the line total', () => {
    expect(toGaItemFromStripeLine(stripeLine)).toMatchObject({
      item_id: '259893',
      item_name: 'Used Michelin Defender 225/65R17',
      price: 120.5,
      quantity: 2,
    });
  });

  it('takes the condition from tireCondition, not the stock status in condition', () => {
    const line = { ...stripeLine, condition: 'Available', tireCondition: 'New' };
    expect(toGaItemFromStripeLine(line)).toMatchObject({
      item_name: 'New Michelin Defender 225/65R17',
      item_category: 'New',
    });
  });

  it('prices the item before tax when Stripe added tax to the line (delivery)', () => {
    const taxed = { ...stripeLine, quantity: 1, amount_subtotal: 17500, amount_total: 18638 };
    expect(toGaItemFromStripeLine(taxed)?.price).toBe(175);
  });

  it('is null for the synthetic tax line and for a line without a product', () => {
    expect(toGaItemFromStripeLine({ ...stripeLine, productId: 'tax' })).toBeNull();
    expect(toGaItemFromStripeLine({ ...stripeLine, productId: null })).toBeNull();
  });

  it('parses brand, model and size from the description of older sessions', () => {
    const old = { ...stripeLine, brand: null, model: null, size: null };
    expect(toGaItemFromStripeLine(old)).toMatchObject({
      item_name: 'Used Michelin Defender 225/65R17',
      item_brand: 'Michelin',
      item_variant: '225/65R17',
    });
  });
});

describe('purchasePayload', () => {
  it('reports what Stripe charged, with tax and shipping apart and no tax item', () => {
    const payload = purchasePayload({
      id: 'cs_test_123',
      amount_total: 25787,
      currency: 'usd',
      shipping_total: 0,
      tax_total: 1687,
      items: [
        stripeLine,
        {
          productId: 'tax',
          description: 'Sales tax (7%)',
          condition: 'n/a',
          quantity: 1,
          amount_total: 1687,
        },
      ],
    });
    expect(payload).toMatchObject({
      transaction_id: 'cs_test_123',
      currency: 'USD',
      value: 257.87,
      tax: 16.87,
      shipping: 0,
    });
    expect(payload.items).toHaveLength(1);
    expect(Object.keys(payload).sort()).toEqual([
      'currency',
      'items',
      'shipping',
      'tax',
      'transaction_id',
      'value',
    ]);
  });
});

describe('listPayload / selectPayload (046)', () => {
  const tire = (id: number) => ({
    id,
    name: `(C${id}) | MICHELIN | DEFENDER | 225/65/17`,
    price: 100,
    brand: 'MICHELIN',
    condition: 'Used',
  });

  it('positions every tire on the whole result', () => {
    const p = listPayload(LISTS.catalog, [tire(1), tire(2)], 20);
    expect(p.item_list_id).toBe('catalog');
    expect(p.item_list_name).toBe('All tires');
    expect(p.items.map(i => i.index)).toEqual([21, 22]);
  });

  it("carries exactly 040's item keys plus the list keys (AC11)", () => {
    const [item] = listPayload(LISTS.usedTires, [tire(7)]).items;
    expect(Object.keys(item).sort()).toEqual(
      [
        'index',
        'item_brand',
        'item_category',
        'item_id',
        'item_list_id',
        'item_list_name',
        'item_name',
        'item_variant',
        'price',
        'quantity',
      ].sort()
    );
  });

  it('caps a list at 200 items', () => {
    const many = Array.from({ length: 250 }, (_, i) => tire(i + 1));
    expect(listPayload(LISTS.catalog, many).items).toHaveLength(200);
  });

  it('puts every tire of a selection at the same position', () => {
    const p = selectPayload(LISTS.chatSets, [tire(1), tire(2)], 2);
    expect(p.items.map(i => [i.item_id, i.index])).toEqual([
      ['1', 2],
      ['2', 2],
    ]);
  });

  it('names brand and size lists', () => {
    expect(LISTS.brand('Michelin')).toEqual({ id: 'brand_tires', name: 'Brand: Michelin' });
    expect(LISTS.size('225/45/17')).toEqual({ id: 'size_tires', name: 'Size: 225/45/17' });
  });
});

describe('searchParams (046, AC8)', () => {
  it('reads a full size as a shopper writes it', () => {
    expect(searchParams({ w: '225', s: '45', d: '17' })).toEqual({
      search_term: '225/45R17',
      tire_width: '225',
      tire_profile: '45',
      tire_rim: '17',
    });
  });

  it('reads partial sizes', () => {
    expect(searchParams({ w: '225', s: '45' })?.search_term).toBe('225/45');
    expect(searchParams({ w: '225' })?.search_term).toBe('225');
    expect(searchParams({ d: '17' })?.search_term).toBe('R17');
  });

  it('adds brand and condition when chosen', () => {
    expect(
      searchParams({ w: '225', s: '45', d: '17', brands: 'Michelin,Pirelli', condition: 'Used' })
    ).toMatchObject({ tire_brand: 'Michelin,Pirelli', tire_condition: 'used' });
  });

  it('is not a size search without a size part', () => {
    expect(searchParams({ brands: 'Michelin' })).toBeNull();
  });

  it('cuts values to 100 characters', () => {
    const p = searchParams({ w: '225', brands: 'X'.repeat(300) });
    expect(p?.tire_brand).toHaveLength(100);
  });
});
