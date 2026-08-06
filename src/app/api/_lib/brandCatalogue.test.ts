import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchBrands: () => ['Michelin', 'Pirelli'] }));

import { parseBrands, unknownBrands } from './brandCatalogue';

const CATALOGUE = ['Michelin', 'Pirelli', 'BF Goodrich'];

describe('unknownBrands', () => {
  it('matches however the customer capitalised it', () => {
    expect(unknownBrands(['michelin'], CATALOGUE)).toEqual([]);
    expect(unknownBrands(['MICHELIN'], CATALOGUE)).toEqual([]);
    expect(unknownBrands(['Michelin '], CATALOGUE)).toEqual([]);
  });

  it('matches across spacing and punctuation', () => {
    // Announcing we don't carry a brand sitting in the warehouse is worse than
    // the vague message it replaces, because it sounds certain.
    expect(unknownBrands(['bfgoodrich'], CATALOGUE)).toEqual([]);
    expect(unknownBrands(['BF-Goodrich'], CATALOGUE)).toEqual([]);
  });

  it('reports a brand the catalogue really lacks', () => {
    expect(unknownBrands(['Nokian'], CATALOGUE)).toEqual(['Nokian']);
  });

  it('returns the customer spelling, not a normalized one', () => {
    // The reply names the brand back the way they wrote it.
    expect(unknownBrands(['nokian'], CATALOGUE)).toEqual(['nokian']);
  });

  it('separates the known from the unknown in a mixed request', () => {
    expect(unknownBrands(['Michelin', 'Nokian'], CATALOGUE)).toEqual(['Nokian']);
  });

  it('ignores blanks', () => {
    expect(unknownBrands(['', '  '], CATALOGUE)).toEqual([]);
  });
});

describe('parseBrands', () => {
  it('splits the tool value', () => {
    expect(parseBrands('Michelin,Pirelli')).toEqual(['Michelin', 'Pirelli']);
  });

  it('trims and drops empties', () => {
    expect(parseBrands('Michelin , , Pirelli')).toEqual(['Michelin', 'Pirelli']);
  });

  it('tolerates a missing or non-string value', () => {
    expect(parseBrands(undefined)).toEqual([]);
    expect(parseBrands(17)).toEqual([]);
  });
});
