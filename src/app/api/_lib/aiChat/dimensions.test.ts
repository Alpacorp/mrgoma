import { describe, expect, it } from 'vitest';

import { dimensionsParam, unusedDimensions, usedDimensions } from './dimensions';

describe('usedDimensions', () => {
  it('reports a brand-only search as brand', () => {
    expect(usedDimensions({ brands: 'Michelin' })).toEqual(['brand']);
  });

  it('reports a rim-only search as rim', () => {
    expect(usedDimensions({ d: 17 })).toEqual(['rim']);
  });

  it('collapses a price range to one dimension', () => {
    // A shopper gave "between $40 and $80" once; reporting price twice would
    // describe the query params rather than the person.
    expect(usedDimensions({ minPrice: 40, maxPrice: 80 })).toEqual(['price']);
  });

  it('treats a full size as size, not size plus rim', () => {
    // 225/45R17 sets all three params but is one thing the customer said.
    expect(usedDimensions({ w: 225, s: 45, d: 17 })).toEqual(['size']);
  });

  it('ignores sort entirely', () => {
    // Ordering is not a way of searching; counting it would inflate a number
    // meant to describe how people narrow.
    expect(usedDimensions({ sort: 'price-asc' })).toEqual([]);
    expect(usedDimensions({ brands: 'Pirelli', sort: 'price-asc' })).toEqual(['brand']);
  });

  it('ignores absent, null and empty values', () => {
    expect(usedDimensions({ brands: '', d: null, condition: undefined })).toEqual([]);
  });

  it('reports the dashboard-only filters when staff use them', () => {
    expect(usedDimensions({ code: '12345' })).toEqual(['code']);
    expect(usedDimensions({ kindSale: 'yes', local: 'no' })).toEqual(['sale_kind', 'local']);
  });
});

describe('unusedDimensions', () => {
  it('offers the rest after a brand-only search, and never brand again', () => {
    const rest = unusedDimensions({ brands: 'Michelin' });

    expect(rest).not.toContain('brand');
    expect(rest).toEqual(expect.arrayContaining(['rim', 'condition', 'price']));
  });

  it('stops offering rim once a full size is given', () => {
    // A rim diameter is part of 225/45R17 — asking again asks for what was said.
    expect(unusedDimensions({ w: 225, s: 45, d: 17 })).not.toContain('rim');
  });

  it('offers nothing when every offerable dimension is in play', () => {
    expect(
      unusedDimensions({
        w: 225,
        s: 45,
        d: 17,
        brands: 'Michelin',
        condition: 'used',
        minPrice: 40,
        minTreadDepth: 5,
        stores: 'Hialeah',
      })
    ).toEqual([]);
  });

  it('never offers a dashboard-only filter to a customer', () => {
    const rest = unusedDimensions({});
    for (const internal of ['sale_kind', 'local', 'code']) {
      expect(rest).not.toContain(internal);
    }
  });
});

describe('dimensionsParam', () => {
  it('joins the names into a flat scalar', () => {
    expect(dimensionsParam({ brands: 'Michelin', d: 17 })).toBe('rim,brand');
  });

  it('is empty when nothing was filtered', () => {
    expect(dimensionsParam({})).toBe('');
  });
});
