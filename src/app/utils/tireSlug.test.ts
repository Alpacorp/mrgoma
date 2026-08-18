import { describe, expect, it } from 'vitest';

import { buildTireSlug, extractIdFromSlug, matchSlug, slugify } from './tireSlug';

describe('slugify', () => {
  it('lowercases and replaces non-alphanumerics with single hyphens', () => {
    expect(slugify('Pirelli P-Zero')).toBe('pirelli-p-zero');
    expect(slugify('225/40/18')).toBe('225-40-18');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Hello!  ')).toBe('hello');
    expect(slugify('***')).toBe('');
  });
});

describe('buildTireSlug', () => {
  it('joins id, brand and size', () => {
    expect(buildTireSlug('591388', 'SureDrive', '225/40/18')).toBe('591388-suredrive-225-40-18');
  });

  it('omits empty brand/size segments but always keeps the id', () => {
    expect(buildTireSlug('123', '', '')).toBe('123');
    expect(buildTireSlug('123', 'Michelin', '')).toBe('123-michelin');
  });
});

describe('extractIdFromSlug', () => {
  it('returns the first (numeric id) segment', () => {
    expect(extractIdFromSlug('591388-suredrive-225-40-18')).toBe('591388');
    expect(extractIdFromSlug('123')).toBe('123');
  });
});

/**
 * The inverse of `slugify`, and the guard against a bug that made an unbounded
 * URL space indexable.
 *
 * `/tires/size/[size]` used to answer `200` for **any** three-part slug: when the
 * lookup found nothing it split the slug and invented a size from the pieces, so
 * `/tires/size/foo-bar-baz` rendered `foo/bar/baz Tires in Miami — 30-Day
 * Warranty` with a canonical pointing at itself. Any broken link, typo or
 * scraper minted a new page that then claimed to be an original.
 *
 * These run with no database and no mock — the size list is an argument, which
 * is the whole reason the rule lives here rather than beside the query.
 */
describe('matchSlug', () => {
  /** Shaped like the real `RealSize` column: a slash-separated triple. */
  const SIZES = ['235/50/20', '225/40/18', '265/70/17', '31/10.50/15', '155/80/13'];
  const BRANDS = ['MICHELIN', 'BFGOODRICH', 'GT RADIAL', 'BACK COUNTRY '];

  // AC9 — driven from the list, not from a hand-picked example, so it cannot
  // pass by accident and stays true as stock changes.
  it.each(SIZES)('resolves the slug of %s back to that exact value', size => {
    expect(matchSlug(SIZES, slugify(size))).toBe(size);
  });

  it.each(BRANDS)('round-trips brand names too, including %s', brand => {
    expect(matchSlug(BRANDS, slugify(brand))).toBe(brand);
  });

  /**
   * AC10 — the property `src/app/sitemap.ts` depends on.
   *
   * The sitemap publishes `/tires/size/${slugify(size)}` for every size the
   * catalog returns. If one of those slugs failed to resolve, we would be asking
   * Google to crawl a 404 we published ourselves.
   */
  it('resolves every slug the sitemap would publish', () => {
    for (const slug of SIZES.map(slugify)) {
      expect(matchSlug(SIZES, slug)).not.toBeNull();
    }
  });

  // AC8 — the fabricated space, gone.
  it.each([
    ['foo-bar-baz', 'three word segments'],
    ['999-999-999', 'a plausible-looking size we do not stock'],
    ['235-50-r20', 'the "r" variant that made the site look like it published two URLs per size'],
    ['a-b-c', 'the shortest possible three-part slug'],
    ['235-50-20-19', 'four segments'],
    ['235-50', 'two segments'],
    ['', 'nothing at all'],
  ])('refuses to invent a value for %s (%s)', slug => {
    expect(matchSlug(SIZES, slug)).toBeNull();
  });

  it('matches the slug, not the raw value or a near miss', () => {
    expect(matchSlug(SIZES, '235/50/20')).toBeNull();
    expect(matchSlug(SIZES, '235_50_20')).toBeNull();
    expect(matchSlug(SIZES, '235-50-2')).toBeNull();
    expect(matchSlug(SIZES, '235-50-20 ')).toBeNull();
  });

  it('handles a stored value that does not slugify to three segments', () => {
    // `31/10.50/15` becomes `31-10-50-15` — four segments. The old fallback
    // demanded exactly three, so it would have rejected this real size while
    // happily inventing `foo/bar/baz`. Exact matching gets both right.
    expect(slugify('31/10.50/15')).toBe('31-10-50-15');
    expect(matchSlug(SIZES, '31-10-50-15')).toBe('31/10.50/15');
  });

  it('returns null against an empty catalog rather than throwing', () => {
    expect(matchSlug([], '235-50-20')).toBeNull();
  });
});
