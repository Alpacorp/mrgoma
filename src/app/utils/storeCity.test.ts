import { describe, expect, it } from 'vitest';

import { productDescription, productSocialTitle } from './seo';
import { KNOWN_VAULTS, MIAMI_VAULTS, ORLANDO_VAULTS, storeCity } from './storeCity';
import { generateTireDescription } from './tireDescription';

/**
 * Every tire page, every Product JSON-LD node and every Google Merchant item
 * used to end with "Available at MrGoma Tires in Miami, FL." — a sentence with
 * no store in it. **793 of 4.157 sellable tires are in Orlando**, so one listing
 * in five named the wrong city, on the storefront and in the feed alike.
 *
 * The defect survived because nothing varied: a single literal, in one file, with
 * no input that could contradict it. So these tests are written over *variation*
 * rather than over the string — a builder that ignores its city fails here even
 * if the Miami wording is still spelled correctly.
 */

describe('storeCity', () => {
  it.each(ORLANDO_VAULTS)('puts %s in Orlando', vault => {
    expect(storeCity(vault)).toBe('Orlando');
  });

  it.each(MIAMI_VAULTS)('puts %s in Miami', vault => {
    expect(storeCity(vault)).toBe('Miami');
  });

  it('ignores casing and stray whitespace, as stored values do carry it', () => {
    expect(storeCity(' clifton ')).toBe('Orlando');
    expect(storeCity('SEMORAN')).toBe('Orlando');
    expect(storeCity('  Coral Gables')).toBe('Miami');
  });

  /**
   * The fallback is Miami because that is the status quo and the larger group —
   * but it is a fallback, not an answer. A warehouse opening in Kissimmee would
   * read as Miami until someone adds it to the list.
   */
  it('falls back to Miami for a warehouse it has never heard of', () => {
    expect(storeCity('Kissimmee')).toBe('Miami');
    expect(storeCity('')).toBe('Miami');
    expect(storeCity(undefined)).toBe('Miami');
    expect(storeCity(null)).toBe('Miami');
  });

  it('classifies all ten known warehouses, with none listed twice', () => {
    expect(KNOWN_VAULTS).toHaveLength(10);
    expect(new Set(KNOWN_VAULTS).size).toBe(10);
  });
});

/**
 * The guard that matters. Each builder is asked for the same tire in the two
 * cities, and its answers must differ. A builder that hardcodes a city passes
 * every other test in this repository and fails this one.
 */
describe('every per-tire sentence follows the tire', () => {
  const tire = {
    brand: 'BRIDGESTONE',
    model: 'DUELER H/P SPORT AS XL',
    size: '245/50/19',
    condition: 'Used',
    remainingLife: '63%',
    treadDepth: '6.3',
    patched: 'No',
    price: 155,
  };

  const builders: [name: string, build: (city: 'Miami' | 'Orlando') => string][] = [
    ['the visible description', city => generateTireDescription({ ...tire, city })],
    ['the meta description', city => productDescription({ ...tire, city })],
    ['the social card title', city => productSocialTitle({ ...tire, city })],
  ];

  it.each(builders)('%s names Orlando for an Orlando tire', (_name, build) => {
    const text = build('Orlando');
    expect(text).toContain('Orlando');
    expect(text).not.toContain('Miami');
  });

  it.each(builders)('%s still names Miami for a Miami tire', (_name, build) => {
    const text = build('Miami');
    expect(text).toContain('Miami');
    expect(text).not.toContain('Orlando');
  });

  // The real tire from the report: it lives in Clifton, and the page said Miami.
  it('gets the reported tire right, end to end from the warehouse name', () => {
    const city = storeCity('Clifton');
    expect(city).toBe('Orlando');
    expect(generateTireDescription({ ...tire, city })).toContain(
      'Available at MrGoma Tires in Orlando, FL.'
    );
  });
});
