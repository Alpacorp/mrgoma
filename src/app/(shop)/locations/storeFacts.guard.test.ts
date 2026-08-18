import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';
import { storeServes, storeStreet } from '@/app/utils/seo';

/**
 * A store's facts have to agree with themselves.
 *
 * On 2026-08-18 East Orlando told visitors it was near **Orlando International**.
 * It is at 575 N Semoran Blvd, beside Orlando **Executive**, about twenty
 * kilometres away — so anyone searching for tires near MCO and driving here made
 * a wasted trip.
 *
 * The reason it survived is the part worth guarding. The same fact was written in
 * **three** fields — `serving`, `neighborhoods` and `description` — rendering on
 * **four** surfaces: the store hero, its areas-served list, `/contact`, and the
 * home page's locations slider. The audit found one of the three. The plan for
 * this feature found two. Three copies of a fact will eventually disagree, and
 * nothing else in the suite would notice.
 */

/**
 * The same airport, written the ways this site writes it.
 *
 * `serving` renders on a card where space is tight, so the short forms exist for
 * a reason and are not worth flattening. What matters is that a store never
 * names two **different** airports — which is what the East Orlando bug was, and
 * what "MIA" versus "Miami International" is not.
 */
const AIRPORT_ALIASES: [pattern: RegExp, canonical: string][] = [
  [/^(MIA|Miami Int(ernational|'l|’l))$/i, 'Miami International'],
  [/^(MCO|Orlando Int(ernational|'l|’l))$/i, 'Orlando International'],
];

/** Every airport a store names, across every field that can name one. */
function airportsNamedBy(store: (typeof locationsConfig)[number]): string[] {
  const text = [store.serving, store.description, ...store.neighborhoods].join(' | ');
  const found = text.match(/[A-Z][A-Za-z'’]*(?:\s+[A-Z][A-Za-z'’]*)*\s+Airport/g) ?? [];

  const named = found.map(match => {
    const name = match
      .replace(/\s*Airport$/, '')
      .replace(/^(Near|near)\s+/, '')
      .trim();
    const alias = AIRPORT_ALIASES.find(([pattern]) => pattern.test(name));
    return alias ? alias[1] : name;
  });

  return [...new Set(named)];
}

describe('a store names one airport, or none', () => {
  /**
   * The check that actually catches the bug.
   *
   * A city-matching rule was considered and rejected: "Orlando International"
   * **is** an Orlando airport, so "does the airport belong to this store's city"
   * passes the very error being fixed. What cannot pass is two different airports
   * for one store, which is precisely what three drifting copies produce.
   */
  it.each(locationsConfig.map(l => [l.slug, l] as const))(
    '%s does not name two different airports',
    (_slug, store) => {
      expect(airportsNamedBy(store).length).toBeLessThanOrEqual(1);
    }
  );

  // AC7 — the specific correction, pinned by name so it cannot quietly revert.
  it('has East Orlando beside Executive, never International', () => {
    const store = locationsConfig.find(l => l.slug === 'east-orlando')!;
    const text = [store.serving, store.description, ...store.neighborhoods].join(' | ');

    expect(text).toContain('Orlando Executive Airport');
    expect(text).not.toMatch(/Orlando Int(ernational|'l)/);
  });
});

/**
 * AC9 — the description composes from these two fields, so a store arriving
 * without them would silently get a generic sentence, which is the state this
 * feature exists to leave behind.
 */
describe('every store carries the facts its description is built from', () => {
  it.each(locationsConfig.map(l => [l.slug, l] as const))(
    '%s has a street and at least two areas to name',
    (_slug, store) => {
      expect(storeStreet(store.address).length).toBeGreaterThan(3);
      expect(storeServes(store.name, store.neighborhoods).length).toBeGreaterThanOrEqual(2);
    }
  );

  it('covers all seven stores, so adding an eighth does not skip these checks', () => {
    expect(locationsConfig).toHaveLength(7);
  });
});
