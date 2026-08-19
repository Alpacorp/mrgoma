import { describe, expect, it } from 'vitest';

import {
  buildBrandFilters,
  buildTireFilters,
  encodeLocationPairs,
  parseLocationPairs,
} from './filterUtils';

const sp = (query: string) => new URLSearchParams(query);

describe('buildTireFilters', () => {
  it('returns an empty object when there are no params', () => {
    expect(buildTireFilters(sp(''))).toEqual({});
  });

  it('splits comma-separated lists and reads dimensions', () => {
    const f = buildTireFilters(sp('condition=new,used&brands=Michelin,Pirelli&w=225&s=40&d=18'));
    expect(f.condition).toEqual(['new', 'used']);
    expect(f.brands).toEqual(['Michelin', 'Pirelli']);
    expect(f.width).toBe('225');
    expect(f.sidewall).toBe('40');
    expect(f.diameter).toBe('18');
  });

  it('accepts the singular "brand" as an alias of "brands"', () => {
    expect(buildTireFilters(sp('brand=Toyo')).brands).toEqual(['Toyo']);
  });

  it('parses numeric ranges and ignores non-numeric values', () => {
    const f = buildTireFilters(sp('minPrice=50&maxPrice=abc'));
    expect(f.minPrice).toBe(50);
    expect(f.maxPrice).toBeUndefined();
  });

  it('only accepts a digit-only code (injection guard)', () => {
    expect(buildTireFilters(sp('code=12345')).tireCode).toBe('12345');
    expect(buildTireFilters(sp('code=12a')).tireCode).toBeUndefined();
  });
});

describe('buildBrandFilters', () => {
  it('drops the brands filter but keeps the rest', () => {
    const f = buildBrandFilters(sp('brands=Michelin&w=225'));
    expect(f.brands).toBeUndefined();
    expect(f.width).toBe('225');
  });
});

/**
 * The step that makes the shelf filter live.
 *
 * Without it the `locations` param reaches the server and is silently dropped —
 * and every other test still passes, because the clause builder is exercised with
 * an array nothing would ever populate. `/analyze` caught this as a missing task,
 * not as a failing test, which is exactly why it is worth stating here.
 */
describe('locations: the shelf-code pairs', () => {
  const roundTrip = (pairs: { store: string; code: string }[]) =>
    parseLocationPairs(encodeLocationPairs(pairs));

  // AC7 — the awkward real values, through the encoder and back.
  it('round-trips the codes the catalog actually holds', () => {
    const pairs = [
      { store: 'Hialeah', code: '+703C+' },
      { store: '441', code: ':410D:' },
      { store: 'Coral Gables', code: '< >' },
      { store: 'Pembroke WH', code: "''651B ''" },
      { store: '27th Ave', code: '112i (a)' },
      { store: 'Warehouse', code: '{IN}' },
    ];

    expect(roundTrip(pairs)).toEqual(pairs);
  });

  /**
   * `+` is the trap. Most codes look like `+703C+`, and a bare `+` in a query
   * string decodes to a space.
   */
  it('does not let a plus sign become a space', () => {
    const encoded = encodeLocationPairs([{ store: 'Hialeah', code: '+703C+' }]);

    expect(encoded).not.toContain('+');
    expect(parseLocationPairs(encoded)[0].code).toBe('+703C+');
  });

  it('survives a separator inside a code', () => {
    expect(roundTrip([{ store: 'Hialeah', code: 'A~B' }])).toEqual([
      { store: 'Hialeah', code: 'A~B' },
    ]);
  });

  // AC9 — absent or malformed yields no key, never a half-built filter.
  it('produces no filter from an absent or unusable param', () => {
    for (const value of [null, '', 'Hialeah', '~', '~code', 'store~', ',,']) {
      expect(parseLocationPairs(value)).toEqual([]);
    }
  });

  it('drops one malformed pair without losing the rest', () => {
    const good = encodeLocationPairs([{ store: 'Hialeah', code: '+703C+' }]);
    expect(parseLocationPairs(`%E0%A4%A~x,${good}`)).toEqual([
      { store: 'Hialeah', code: '+703C+' },
    ]);
  });

  it('reaches the filters object the repository consumes', () => {
    const params = new URLSearchParams({
      stores: 'Hialeah,441',
      locations: encodeLocationPairs([{ store: 'Hialeah', code: '+690A+' }]),
    });

    expect(buildTireFilters(params).locations).toEqual([{ store: 'Hialeah', code: '+690A+' }]);
  });

  it('sets no locations key when the param is absent', () => {
    expect(buildTireFilters(new URLSearchParams({ stores: 'Hialeah' })).locations).toBeUndefined();
  });
});
