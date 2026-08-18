import type { Metadata } from 'next';
import { describe, expect, it } from 'vitest';

import { statesPrimaryDifferentiator } from '@/app/utils/brandClaims';
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  TITLE_MAX,
  absUrl,
  brandMetadata,
  homeMetadata,
  locationMetadata,
  getSiteUrl,
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
    loc => [`/locations/${loc.name}`, locationMetadata({ ...loc, slug: 'x' })] as [string, Metadata]
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
        '7 locations in Miami & Orlando. Free shipping. Since 2006.'
    );
  });

  // AC15b — one spelling of the root, asserted exactly.
  //
  // This used to accept either form via a regex, which is how the breadcrumb
  // drifted to the slashed spelling without anything going red. The canonical
  // and `absUrl('/')` must now be the same string.
  it('canonicalises to the site root, with no trailing slash', () => {
    expect(homeMetadata().alternates?.canonical).toBe(absUrl('/'));
    expect(homeMetadata().alternates?.canonical).toBe(getSiteUrl());
  });
});

/**
 * AC3–AC7 — the canonical of a filtered catalog view.
 *
 * A crawl found 47 filter URLs each declaring itself an original while carrying
 * `/tires`' own title. The rule now is: keep only the parameters that describe a
 * page we publish.
 *
 * `sizeSlug` is what the route supplies after checking the catalog; absent, the
 * size is one we do not stock, whose landing page 404s.
 */
describe('/tires canonicals', () => {
  const canonicalOf = (params: Parameters<typeof tiresMetadata>[0]) =>
    String(tiresMetadata(params).alternates?.canonical);

  const root = `${getSiteUrl()}/tires`;

  // AC4 — every proper subset of the three size parameters, not one example.
  const PARTIAL: [label: string, params: Parameters<typeof tiresMetadata>[0]][] = [
    ['w only', { w: '225' }],
    ['s only', { s: '40' }],
    ['d only', { d: '18' }],
    ['w+s', { w: '225', s: '40' }],
    ['w+d', { w: '225', d: '18' }],
    ['s+d', { s: '40', d: '18' }],
    // The `?w=&s=&d=` form the audit names by URL: all three present, none valued.
    ['all three empty', { w: '', s: '', d: '' }],
    ['all three whitespace', { w: ' ', s: ' ', d: ' ' }],
  ];

  it.each(PARTIAL)('drops a partial size (%s) from the canonical', (_label, params) => {
    expect(canonicalOf(params)).toBe(root);
  });

  // AC3 — the single most duplicated facet in the crawl.
  it('canonicalises ?d=20 to /tires, not to itself', () => {
    expect(canonicalOf({ d: '20' })).toBe(root);
    // And the title it carries is the generic one, which is why it was a
    // duplicate in the first place.
    expect(absoluteTitle(tiresMetadata({ d: '20' }))).toBe(absoluteTitle(tiresMetadata()));
  });

  // AC5 — a complete size we stock consolidates onto its landing page.
  it('sends a complete, stocked size to its /tires/size page', () => {
    expect(canonicalOf({ w: '235', s: '50', d: '20', sizeSlug: '235-50-20' })).toBe(
      `${getSiteUrl()}/tires/size/235-50-20`
    );
  });

  // AC5 — a complete size we do NOT stock. After the fabricating fallback was
  // removed its landing page 404s, and a canonical must never point at one.
  it('sends a complete but unstocked size to /tires, never to a 404', () => {
    expect(canonicalOf({ w: '999', s: '999', d: '999' })).toBe(root);
    expect(canonicalOf({ w: '999', s: '999', d: '999', sizeSlug: null })).toBe(root);
  });

  // AC6 — parameters we build no pages for. Already correct; pinned so it stays.
  it('ignores filter parameters that have no page of their own', () => {
    expect(canonicalOf({})).toBe(root);
  });

  // AC7 — pagination keeps its own canonical. Folding page 2 into page 1 hides
  // everything only page 2 links to.
  it('keeps the page number, and never folds a page into the size landing page', () => {
    expect(canonicalOf({ page: 2 })).toBe(`${root}?page=2`);
    expect(canonicalOf({ w: '235', s: '50', d: '20', sizeSlug: '235-50-20', page: 2 })).toBe(
      `${root}?w=235&s=50&d=20&page=2`
    );
  });

  it('drops a partial size but keeps the page', () => {
    expect(canonicalOf({ d: '20', page: 2 })).toBe(`${root}?page=2`);
  });

  it('treats page 1 as no page at all', () => {
    expect(canonicalOf({ page: 1 })).toBe(root);
  });
});
