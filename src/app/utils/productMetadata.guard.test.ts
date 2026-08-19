import { describe, expect, it } from 'vitest';

import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  brandName,
  productDescription,
  productMetadata,
  productTitle,
} from './seo';

/**
 * The tire detail page is 1.622 URLs built from database strings, and nothing
 * about a title that is too long announces itself. The page renders, the build
 * passes, the test suite is green — Google simply cuts the string and the part
 * that was supposed to earn the click never appears.
 *
 * That is what happened for the whole life of this route: **every** title ran
 * past 60 characters (median 96), so the price and "Free Shipping" that `014`
 * added to lift click-through were paid for on every page and delivered on none.
 *
 * These fixtures are real records, not invented ones. The two long models below
 * are the actual worst cases in the catalog at 51 characters, and they are what
 * forces the ladder down to its lower rungs.
 */

type Fixture = {
  label: string;
  brand?: string;
  model?: string;
  size?: string;
  condition?: string;
  price?: number | string;
  remainingLife?: string;
  patched?: string;
};

const FIXTURES: Fixture[] = [
  {
    label: 'typical used tire',
    brand: 'BRIDGESTONE',
    model: 'WEATHERPEAK',
    size: '225/55/18',
    condition: 'Used',
    price: 145,
    remainingLife: '90%',
    patched: 'No',
  },
  {
    label: 'longest model in the catalog (51 chars)',
    brand: 'GOODYEAR',
    model: 'EAGLE F1 ASYMMETRIC SUV 4X4 AT J LR XL SOUNDCOMFORT',
    size: '235/50/20',
    condition: 'Used',
    price: 120,
    remainingLife: '80%',
    patched: 'Yes',
  },
  {
    label: 'second longest, on a new tire',
    brand: 'PIRELLI',
    model: 'SCORPION TM ZERO ALL SEASON MOE-S ELECT PNCS RFT XL',
    size: '275/45/21',
    condition: 'New',
    price: 310,
  },
  {
    label: 'acronyms that must not be re-cased',
    brand: 'BRIDGESTONE',
    model: 'ALENZA A/S 02 RSC RFT',
    size: '235/50/20',
    condition: 'Used',
    price: 135,
    remainingLife: '99%',
    patched: 'No',
  },
  {
    label: 'brand stored with a trailing space',
    brand: 'BACK COUNTRY ',
    model: 'A/T',
    size: '265/70/17',
    condition: 'Used',
    price: 95,
    remainingLife: '70%',
    patched: 'No',
  },
  {
    label: 'brand title case gets wrong',
    brand: 'BFGOODRICH',
    model: 'ALL-TERRAIN T/A KO2',
    size: '285/70/17',
    condition: 'Used',
    price: 180,
    remainingLife: '85%',
    patched: 'No',
  },
  // The `'-'` sentinel `mapTireRecordToSingleTire` writes for a missing value.
  // `Number('-')` is `NaN`; without the `isFinite` guard this prints `$NaN`.
  {
    label: 'no price, no tread reading (the catalog sentinel)',
    brand: 'TOYO',
    model: 'PROXES',
    size: '225/40/18',
    condition: 'Used',
    price: '-',
    remainingLife: '-',
  },
  { label: 'brand and size only', brand: 'KUMHO', size: '195/65/15', condition: 'New' },
  { label: 'brand only', brand: 'NEXEN', condition: 'Used' },
  // `mapTireRecordToSingleTire` falls back to `'Unknown'` rather than an empty
  // string, so this is a shape the route can genuinely produce.
  { label: 'unknown brand', brand: 'Unknown', size: '205/55/16', condition: 'Used', price: 60 },
];

const titleOf = (fixture: Fixture) => productTitle(fixture);

describe('every tire title fits the width Google renders', () => {
  it.each(FIXTURES.map(f => [f.label, f] as const))(
    '%s stays inside TITLE_MAX',
    (_label, fixture) => {
      const title = titleOf(fixture);
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
    }
  );

  /**
   * `fitTitle` picks a candidate by length and never looks at what it picked;
   * `fitDescription` normalises, `fitTitle` does not. An absent model or size
   * therefore leaves a gap exactly where its value would have gone.
   */
  it.each(FIXTURES.map(f => [f.label, f] as const))(
    '%s leaves no gap where an absent field would have been',
    (_label, fixture) => {
      const title = titleOf(fixture);
      expect(title).not.toMatch(/ {2}/);
      expect(title).toBe(title.trim());
    }
  );

  it.each(FIXTURES.map(f => [f.label, f] as const))(
    '%s keeps the condition, brand and size it was given',
    (_label, fixture) => {
      const title = titleOf(fixture);
      if (fixture.condition) expect(title).toContain(fixture.condition);
      if (fixture.brand) expect(title).toContain(brandName(fixture.brand));
      if (fixture.size) expect(title).toContain(fixture.size);
    }
  );

  /**
   * The defect `021` removed everywhere else and this route kept: a plain `title`
   * string lets the root `%s | MrGoma Tires` template append the brand on top of
   * the one the string already ends with.
   */
  it.each(FIXTURES.map(f => [f.label, f] as const))(
    '%s names the brand at most once',
    (_label, fixture) => {
      const absolute = (
        productMetadata({ ...fixture, path: '/tires/1-x' }).title as { absolute: string }
      ).absolute;
      expect((absolute.match(/MrGoma/g) ?? []).length).toBeLessThanOrEqual(1);
    }
  );

  it('never prints a price it does not have', () => {
    for (const fixture of FIXTURES) {
      expect(titleOf(fixture)).not.toContain('NaN');
      expect(productDescription(fixture)).not.toContain('NaN');
    }
  });
});

describe('every tire description fits the window Google renders', () => {
  /**
   * Ceiling only. The 140 floor that `metadata.test.ts` enforces for the
   * fixed-copy pages does not apply here: this text is built from a record, and a
   * tire with no tread reading and a short brand cannot reach 140 without padding
   * that says nothing (spec §Constraints).
   */
  it.each(FIXTURES.map(f => [f.label, f] as const))(
    '%s stays inside DESCRIPTION_MAX',
    (_label, fixture) => {
      const description = productDescription(fixture);
      expect(description.length).toBeGreaterThan(0);
      expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(description).not.toMatch(/ {2}/);
    }
  );

  // The price used to be appended by the caller *after* the builder returned,
  // which put it last — the position truncation removes first.
  it.each(FIXTURES.filter(f => f.price && f.price !== '-').map(f => [f.label, f] as const))(
    '%s states its price where Google is still rendering',
    (_label, fixture) => {
      const description = productDescription(fixture);
      const at = description.indexOf('$');
      expect(at).toBeGreaterThan(-1);
      expect(at).toBeLessThan(DESCRIPTION_MAX);
    }
  );
});
