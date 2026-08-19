import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Structured data fails silently. That is the whole reason this file exists.
 *
 * An invalid `@type`, a second description of the business, a hand-written
 * `<script>` with a stray quote — none of them breaks the build, changes the
 * page, or reports anything. Google simply ignores the node, and the site goes on
 * looking correct to everyone who works on it.
 */

const APP = join(process.cwd(), 'src', 'app');
const SEO = join(APP, 'utils', 'seo.ts');

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

const FILES = sourceFiles(APP);
const rel = (file: string) => file.replace(process.cwd(), '');

/**
 * Every schema.org type this site emits.
 *
 * The list is the artefact. `TireShop` was doubted while planning this feature
 * and turned out to be a real class — the reverse mistake, shipping a type that
 * does not exist, would never have announced itself. Adding an entry here is
 * meant to be the moment someone checks.
 *
 * `Brand` and `Service` were missing from the first draft of this list and are
 * emitted today; a guard shipped without them would have been red on arrival.
 * `AutoPartsStore` is deliberately absent — the stores are now `TireShop` and
 * `AutoRepair`, and nothing should reintroduce it.
 */
const KNOWN_TYPES = new Set([
  'Organization',
  'WebSite',
  'ImageObject',
  'PostalAddress',
  'GeoCoordinates',
  'OpeningHoursSpecification',
  'Place',
  'City',
  'State',
  'TireShop',
  'AutoRepair',
  'BreadcrumbList',
  'ListItem',
  'ItemList',
  'CollectionPage',
  'AboutPage',
  'ContactPage',
  'Article',
  'FAQPage',
  'Question',
  'Answer',
  'Product',
  'Offer',
  'Brand',
  'Service',
]);

/**
 * The types that describe *this business*. Only `seo.ts` may define one.
 *
 * Checking for `Organization` alone is not enough, and that is not hypothetical:
 * the service pages used to inline
 * `provider: { '@type': 'AutoRepair', name: 'MrGoma Tires', url: '…' }` on eight
 * pages — the same business under a different type, with the site URL as a
 * literal. A narrower rule would have passed it.
 */
const BUSINESS_TYPES = [
  'Organization',
  'LocalBusiness',
  'Store',
  'AutoPartsStore',
  'AutoRepair',
  'TireShop',
];

describe('only seo.ts describes this business', () => {
  it('finds no business node defined anywhere else', () => {
    const offenders: string[] = [];

    for (const file of FILES) {
      if (file === SEO) continue;
      const source = readFileSync(file, 'utf8');
      for (const type of BUSINESS_TYPES) {
        if (source.includes(`'@type': '${type}'`)) {
          offenders.push(`${rel(file)}: '@type': '${type}'`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe('every schema.org type is one we have checked', () => {
  it('emits nothing outside the recorded list', () => {
    const unknown = new Set<string>();

    for (const file of FILES) {
      for (const match of readFileSync(file, 'utf8').matchAll(/'@type': '([A-Za-z]+)'/g)) {
        if (!KNOWN_TYPES.has(match[1])) unknown.add(`${match[1]} (${rel(file)})`);
      }
    }

    expect([...unknown]).toEqual([]);
  });
});

describe('no page hand-writes a JSON-LD script', () => {
  /**
   * Every node goes through the `JsonLd` component, which passes the payload as a
   * text child. Its doc comment explains why that is the safer path here: React
   * neutralises a value containing `</script>`, and `/tires/[slug]` renders
   * database strings into its Product node.
   */
  it('routes every node through the JsonLd component', () => {
    const offenders = FILES.filter(file => {
      if (file.includes(join('components', 'JsonLd'))) return false;
      return readFileSync(file, 'utf8').includes('application/ld+json');
    }).map(rel);

    expect(offenders).toEqual([]);
  });
});
