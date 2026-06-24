import { describe, expect, it } from 'vitest';

import { buildBrandFilters, buildTireFilters } from './filterUtils';

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
