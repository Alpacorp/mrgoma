import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  FOUNDED_YEAR,
  HOME_TRUST_CLAIMS,
  INVENTORY_NETWORK,
  PRIMARY_DIFFERENTIATORS,
  SELECTION_CLAIM,
  onlineInventoryLabel,
  statesPrimaryDifferentiator,
} from './brandClaims';

const SRC = join(process.cwd(), 'src');

/** Every source file, minus the two places the retired claim is *documented*. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry) && !/brandClaims\.(ts|test\.ts)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('inventory claims', () => {
  /**
   * The regression this feature exists to prevent.
   *
   * The home page used to claim "15,000+ tires in stock" while `/tires`
   * rendered the live database count (4,342). Both were visible to Google and
   * to the shopper, and read together they looked like an exaggeration.
   *
   * The network figure is only truthful with its qualifier, so the unqualified
   * phrasing must never come back.
   */
  it('never states "15,000+ tires in stock" without its qualifier', () => {
    const offenders = sourceFiles(SRC)
      .filter(file => /15,000\+\s*tires in stock/i.test(readFileSync(file, 'utf8')))
      .map(file => file.replace(process.cwd(), ''));

    expect(offenders).toEqual([]);
  });

  it('keeps the network claim distinct from the online claim', () => {
    // The network claim describes physical stock across the stores...
    expect(INVENTORY_NETWORK).toContain('across our 7 locations');
    // ...the online claim describes what is actually purchasable, and says so.
    expect(onlineInventoryLabel(4342)).toBe('4,342 available to buy online');
    expect(onlineInventoryLabel(4342)).not.toContain('in stock');
  });

  it('formats the online count with thousands separators', () => {
    expect(onlineInventoryLabel(15)).toBe('15 available to buy online');
    expect(onlineInventoryLabel(12345)).toBe('12,345 available to buy online');
  });
});

describe('claim wording', () => {
  it('keeps the selection claim non-comparative', () => {
    // "Florida's largest selection" is a challengeable superlative we cannot
    // evidence; "one of Florida's largest" keeps the force without the risk.
    expect(SELECTION_CLAIM).toMatch(/one of/i);
    expect(SELECTION_CLAIM).not.toMatch(/^florida's largest/i);
  });

  it('recognises a primary differentiator inside prose', () => {
    expect(statesPrimaryDifferentiator('Backed by a 30-day warranty.')).toBe(true);
    expect(statesPrimaryDifferentiator('15,000+ tires across our 7 locations.')).toBe(true);
    expect(statesPrimaryDifferentiator('Fast installation and friendly staff.')).toBe(false);
  });

  it('states the founding year once, as a number', () => {
    // Corrected from 2007 on 2026-08-18: the owner confirmed 2006, which is what
    // the brand document and the external directories had said all along. The
    // SEO audit flagged the discrepancy and could not settle it on its own.
    expect(FOUNDED_YEAR).toBe(2006);
  });

  /**
   * The founding year is a claim about the business, and it just changed. When
   * it did, one copy of it was living outside this file — a hardcoded
   * "Since 2007." inside the home page's meta description — so the site would
   * have gone on claiming both years at once: 2006 in the Organization schema
   * and on `/about-us`, 2007 in the snippet Google shows.
   *
   * This is the same guard `whatsapp.guard.test.ts` puts on the phone number,
   * and for the same reason: a value stated in two places eventually disagrees
   * with itself, and nothing tells you until a customer reads both.
   */
  it('is the only place in the source that spells the founding year out', () => {
    // Only lines that pair a year with founding language. A copyright notice or
    // a DOT date is not a claim about when the business opened.
    const FOUNDING_LINE = /(since|founded|founding|established)[^\n]*\b(19\d{2}|20[0-2]\d)\b/i;

    const offenders = sourceFiles(SRC)
      .flatMap(file =>
        readFileSync(file, 'utf8')
          .split('\n')
          .filter(line => FOUNDING_LINE.test(line))
          .map(line => `${file.replace(process.cwd(), '')}: ${line.trim()}`)
      )
      // Test files quote the old year to explain the correction.
      .filter(entry => !/\.(test|spec)\.tsx?:/.test(entry));

    expect(offenders).toEqual([]);
  });

  it('has four primary differentiators, all non-empty', () => {
    expect(PRIMARY_DIFFERENTIATORS).toHaveLength(4);
    PRIMARY_DIFFERENTIATORS.forEach(claim => expect(claim.trim().length).toBeGreaterThan(0));
  });

  it('keeps the home strip short enough to wrap on a phone', () => {
    // Four short pills fit two lines at 390px; more would risk pushing the tire
    // search below the fold, which the mission ranks above this content.
    expect(HOME_TRUST_CLAIMS.length).toBeLessThanOrEqual(4);
    HOME_TRUST_CLAIMS.forEach(claim => expect(claim.length).toBeLessThanOrEqual(40));
  });
});
