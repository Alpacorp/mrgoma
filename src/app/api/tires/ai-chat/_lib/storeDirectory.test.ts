import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';

import { buildStoreDirectory } from './storeDirectory';

/**
 * The assistant speaks to customers about where to drive and which number to
 * ring, so everything it says about a store has to be the same thing the site
 * says. These tests assert the derivation, not a snapshot: a corrected phone
 * number in `locationsConfig` should flow through without touching this file.
 *
 * The hour formatting these rely on is covered in `utils/storeHours.test.ts`,
 * which is where it lives now that the pages share it.
 */
describe('buildStoreDirectory', () => {
  const directory = buildStoreDirectory();

  it('describes every store the site knows about, and no others', () => {
    for (const store of locationsConfig) {
      expect(directory).toContain(`**MrGoma Tires – ${store.name}**`);
    }
    expect(directory.match(/\*\*MrGoma Tires – /g)).toHaveLength(locationsConfig.length);
  });

  it('quotes each store its own address, phone and dialable number', () => {
    // The drift that prompted this: the prompt named (786) 703-4807 for Miami
    // Airport while the site showed a different number entirely.
    for (const store of locationsConfig) {
      expect(directory).toContain(store.address);
      expect(directory).toContain(store.phone);
      expect(directory).toContain(store.tel);
    }
  });

  it('points at the Business Profile links the site uses', () => {
    for (const store of locationsConfig) {
      expect(directory).toContain(store.mapLink);
    }
  });

  it('carries no short link of the kind that went dead', () => {
    // The seven `share.google` links stopped resolving to a listing and began
    // redirecting to a search for their own token. Nothing here is hand-pasted
    // any more, but the assertion is cheap and the failure was silent.
    expect(directory).not.toMatch(/share\.google|goo\.gl|maps\.app/);
  });

  it('gives every store opening hours', () => {
    for (const store of locationsConfig) {
      expect(store.hours.length).toBeGreaterThan(0);
    }
    expect(directory.match(/^Hours: .+$/gm)).toHaveLength(locationsConfig.length);
  });
});
