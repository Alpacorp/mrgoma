import { describe, expect, it } from 'vitest';

import { dimensionsParam } from './dimensions';

/**
 * Guard: what a customer typed never reaches an analytics property.
 *
 * Event values are forwarded verbatim to two third parties. The brand someone
 * searched for, the store they picked, the budget they set — that is their
 * business, and none of it is needed to answer the question these events exist
 * for, which is *how* people narrow, not *to what*.
 *
 * The unit tests next door check that `dimensionsParam` names the right
 * dimensions. This checks the other half: that it names nothing else. A future
 * change that "helpfully" appended the value alongside the name would pass those
 * and fail this.
 */
const FILTERS_WITH_DISTINCTIVE_VALUES = {
  w: 225,
  s: 45,
  d: 17,
  brands: 'Michelin,Pirelli',
  condition: 'used',
  patched: false,
  minPrice: 41,
  maxPrice: 83,
  minTreadDepth: 6,
  maxTreadDepth: 9,
  minRemainingLife: 55,
  maxRemainingLife: 95,
  stores: 'Hialeah,Cutler Bay',
  sort: 'price-asc',
  kindSale: 'yes',
  local: 'no',
  code: '12345',
};

describe('no customer input escapes into an event property', () => {
  const result = dimensionsParam(FILTERS_WITH_DISTINCTIVE_VALUES);

  it('names dimensions, not values', () => {
    expect(result).toBe('size,brand,condition,price,tread,store,sale_kind,local,code');
  });

  it('leaks no value from any filter', () => {
    const values = ['Michelin', 'Pirelli', 'Hialeah', 'Cutler Bay', '225', '45', '17', '12345', '41', '83'];

    for (const value of values) {
      expect(result, `"${value}" reached the event property`).not.toContain(value);
    }
  });

  it('emits only names from the known vocabulary', () => {
    const vocabulary = new Set([
      'size',
      'rim',
      'brand',
      'condition',
      'price',
      'tread',
      'store',
      'sale_kind',
      'local',
      'code',
    ]);

    for (const name of result.split(',')) {
      expect(vocabulary.has(name), `unexpected property value "${name}"`).toBe(true);
    }
  });
});
