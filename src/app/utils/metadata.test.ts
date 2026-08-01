import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';

import { statesPrimaryDifferentiator } from '@/app/utils/brandClaims';
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  TITLE_MAX,
  brandMetadata,
  homeMetadata,
  locationMetadata,
  locationsMetadata,
  newTiresMetadata,
  sizeMetadata,
  tiresMetadata,
  usedTiresMetadata,
} from '@/app/utils/seo';

/**
 * The regression guard for the commercial entry points.
 *
 * This is what stops the feature rotting: a page can be edited into shipping a
 * missing description, an over-long title, or a description that says nothing a
 * competitor couldn't also say — and the suite goes red.
 *
 * It runs against the pure builders rather than the page modules on purpose.
 * Three of these pages build metadata inside a `generateMetadata` that also
 * awaits database data, so testing the modules would mean mocking `mssql`.
 */

function absoluteTitle(meta: Metadata): string {
  const title = meta.title;
  if (typeof title === 'object' && title !== null && 'absolute' in title) {
    return String(title.absolute);
  }
  throw new Error(
    'Commercial entry points must set `title: { absolute }` so the root ' +
      '`%s | MrGoma Tires` template does not eat 15 characters of the budget.'
  );
}

/** Every entry point, including the variable-input pages at realistic extremes. */
const ENTRY_POINTS: [label: string, meta: Metadata][] = [
  ['/', homeMetadata()],
  ['/tires', tiresMetadata()],
  ['/tires (size)', tiresMetadata({ w: '225', s: '40', d: '18' })],
  ['/tires (size, page 3)', tiresMetadata({ w: '225', s: '40', d: '18', page: 3 })],
  ['/tires/used', usedTiresMetadata()],
  ['/tires/new', newTiresMetadata()],
  ['/locations', locationsMetadata()],
  ...(['Bridgestone', 'BFGoodrich', 'Kumho', 'Continental', 'Accelera'] as const).map(
    brand =>
      [`/tires/brands/${brand}`, brandMetadata({ brand, slug: brand.toLowerCase() })] as [
        string,
        Metadata,
      ]
  ),
  ...(['225/40/18', '31/10.50/15', '265/70/17'] as const).map(
    size => [`/tires/size/${size}`, sizeMetadata({ size, slug: 'x' })] as [string, Metadata]
  ),
  ...(
    [
      { name: 'Cutler Bay', city: 'Miami' },
      { name: 'Orlando West Colonial', city: 'Orlando' },
      { name: 'Miami Airport', city: 'Miami' },
      { name: 'Hialeah', city: 'Miami' },
    ] as const
  ).map(
    loc =>
      [`/locations/${loc.name}`, locationMetadata({ ...loc, slug: 'x' })] as [string, Metadata]
  ),
];

describe('commercial entry point metadata', () => {
  it.each(ENTRY_POINTS)('%s has a title within the width Google displays', (_label, meta) => {
    const title = absoluteTitle(meta);
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it.each(ENTRY_POINTS)('%s has a description Google will not truncate', (_label, meta) => {
    const description = meta.description ?? '';
    expect(description.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it.each(ENTRY_POINTS)('%s states at least one primary differentiator', (_label, meta) => {
    expect(statesPrimaryDifferentiator(meta.description ?? '')).toBe(true);
  });

  it.each(ENTRY_POINTS)('%s declares a canonical URL', (_label, meta) => {
    expect(meta.alternates?.canonical).toMatch(/^https?:\/\//);
  });

  // AC19 — "used tires" is what people search for; "like-new" is a qualifier
  // for body copy, never a replacement for the term in a title.
  it.each(ENTRY_POINTS)('%s keeps "like-new" out of the title', (_label, meta) => {
    expect(absoluteTitle(meta)).not.toMatch(/like-new/i);
  });

  it.each(ENTRY_POINTS)('%s mirrors its title and description into OpenGraph', (_label, meta) => {
    expect(meta.openGraph?.title).toBe(absoluteTitle(meta));
    expect(meta.openGraph?.description).toBe(meta.description);
  });
});

describe('home metadata', () => {
  // Fixed by the approved decision recorded in spec.md (AC3b). If this changes,
  // it should change in the spec first.
  it('matches the approved copy exactly', () => {
    const meta = homeMetadata();

    expect(absoluteTitle(meta)).toBe('Used & New Tires Miami — 30-Day Warranty | MrGoma');
    expect(meta.description).toBe(
      '15,000+ like-new used and new tires, every used tire backed by a 30-day warranty. ' +
        '7 locations in Miami & Orlando. Free shipping. Since 2007.'
    );
  });

  it('canonicalises to the site root', () => {
    // `absUrl('/')` keeps the trailing slash — same behaviour as before this
    // feature, and the form Google already has indexed.
    expect(homeMetadata().alternates?.canonical).toMatch(/^https?:\/\/[^/]+\/?$/);
  });
});

describe('paginated and filtered /tires canonicals', () => {
  it('keeps the size filter and page in the canonical URL', () => {
    const meta = tiresMetadata({ w: '225', s: '40', d: '18', page: 3 });
    expect(meta.alternates?.canonical).toContain('/tires?w=225&s=40&d=18&page=3');
  });

  it('drops an incomplete size from the canonical URL', () => {
    const meta = tiresMetadata({ w: '225' });
    expect(meta.alternates?.canonical).toContain('/tires?w=225');
    expect(absoluteTitle(meta)).not.toContain('225/');
  });
});
