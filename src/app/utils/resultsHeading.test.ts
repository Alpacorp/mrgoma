import { describe, expect, it } from 'vitest';

import { resultsHeading } from './resultsHeading';

/**
 * The heading read **"All tires" whatever was applied**. On the one page whose
 * purpose is narrowing, the single line that should say what you narrowed to
 * said the opposite — and nothing failed, because nothing varied.
 *
 * So this is asserted over *variation*, the same way `027`'s city fix was: two
 * different filter sets must produce two different headings. A builder that
 * ignores its filters passes every other test in this repository and fails here.
 */

describe('resultsHeading', () => {
  it('says "All tires" only when nothing is applied', () => {
    expect(resultsHeading({})).toBe('All tires');
  });

  it.each([
    [{ brands: ['PIRELLI'] }],
    [{ diameter: '20' }],
    [{ condition: ['used'] }],
    [{ minPrice: 100, maxPrice: 149 }],
    [{ minRemainingLife: 90 }],
    [{ patched: ['no'] }],
    [{ kindSale: ['yes'] }],
  ])('never says "All tires" once something is applied: %j', filters => {
    expect(resultsHeading(filters)).not.toBe('All tires');
  });

  it('names what is applied', () => {
    expect(resultsHeading({ brands: ['PIRELLI'], diameter: '20' })).toBe('Tires: 20" · Pirelli');
    expect(resultsHeading({ condition: ['used'] })).toBe('Tires: Used');
    expect(resultsHeading({ minPrice: 100, maxPrice: 149 })).toBe('Tires: $100 – $149');
  });

  it('keeps a complete size in the words a buyer arrived saying', () => {
    expect(resultsHeading({ width: '225', sidewall: '50', diameter: '19' })).toBe(
      '225/50/19 tires'
    );
  });

  it('gives two different filter sets two different headings', () => {
    // The assertion the old heading would have failed while looking correct.
    const a = resultsHeading({ brands: ['PIRELLI'] });
    const b = resultsHeading({ brands: ['MICHELIN'] });
    expect(a).not.toBe(b);
  });

  it('writes brand names for a reader, not as they are stored', () => {
    expect(resultsHeading({ brands: ['BFGOODRICH'] })).toContain('BFGoodrich');
  });
});
