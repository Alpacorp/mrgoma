import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { guides } from '@/app/(shop)/guides/guidesConfig';
import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';
import { servicesConfig } from '@/app/(shop)/services/servicesConfig';
import {
  aboutMetadata,
  absUrl,
  contactMetadata,
  guidesMetadata,
  homeMetadata,
  instantQuoteMetadata,
  legalPoliciesMetadata,
  locationsMetadata,
  newTiresMetadata,
  servicesMetadata,
  tiresMetadata,
  usedTiresMetadata,
} from '@/app/utils/seo';

/**
 * Three things this feature fixed that nothing else would notice coming back.
 */

const APP = join(process.cwd(), 'src', 'app');

function pageModules(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) pageModules(full, acc);
    else if (/^page\.tsx$/.test(entry)) acc.push(full);
  }
  return acc;
}

const MODULES = pageModules(APP);

describe('no page spells the brand inside a plain title', () => {
  /**
   * The rule is **not** "every page must use the helper".
   *
   * The root layout's `%s | MrGoma Tires` template appends the brand to any
   * title that is not `{ absolute }`. Writing the brand in the string *as well*
   * is what produced `Auto Services in Miami & Orlando | MrGoma Tires | MrGoma
   * Tires` on nine pages.
   *
   * `/login` gets this right and must keep passing: a bare `'Seller Portal'`,
   * with a comment at the call site recording that spelling the brand there once
   * rendered `MrGoma Tires | Seller Portal | MrGoma Tires`. A rule that banned
   * that pattern would ban the correct answer.
   */
  it('finds no plain `title:` containing MrGoma', () => {
    const offenders: string[] = [];

    for (const file of MODULES) {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const match = line.match(/^\s*title: ['"`](.*)['"`],?\s*$/);
        if (match && match[1].includes('MrGoma')) {
          offenders.push(`${file.replace(process.cwd(), '')}: ${line.trim()}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('leaves a brand-free plain title alone — that pattern is correct', () => {
    const login = MODULES.find(file => file.includes(join('(sellers)', 'login')));
    expect(login).toBeDefined();
    expect(readFileSync(login!, 'utf8')).toContain("title: 'Seller Portal'");
  });
});

/**
 * Every static route the sitemap publishes, paired with the builder that
 * describes it.
 *
 * Deliberately the **static** list only — the ~17 fixed paths. The dynamic
 * groups (2.000 tires, 272 sizes, 113 brands, plus the service, location and
 * guide slug lists) are covered structurally instead: each derives its canonical
 * from the same slug the sitemap publishes, the property `020` established for
 * the size pages. Naming that here so this guard is not later read as covering
 * everything.
 */
const STATIC_SITEMAP_ROUTES = [
  ['/', homeMetadata()],
  ['/tires', tiresMetadata()],
  ['/tires/new', newTiresMetadata()],
  ['/tires/used', usedTiresMetadata()],
  ['/guides', guidesMetadata()],
  ['/about-us', aboutMetadata()],
  ['/services', servicesMetadata()],
  ['/locations', locationsMetadata()],
  ['/contact', contactMetadata()],
  ['/instant-quote', instantQuoteMetadata()],
  ['/legal-policies', legalPoliciesMetadata()],
] as const;

describe('the sitemap and the pages it publishes agree', () => {
  /**
   * The contradiction this feature removed: `/instant-quote` sat in the sitemap
   * while declaring `noindex`, so the site asked Google to index a URL that then
   * told it not to. Search Console reports that as "Submitted URL marked
   * 'noindex'".
   */
  it.each(STATIC_SITEMAP_ROUTES)('%s is not published as noindex', (_path, meta) => {
    const robots = meta.robots as { index?: boolean } | undefined;
    expect(robots?.index).not.toBe(false);
  });

  // A page in the sitemap must name itself, or we are asking Google to index
  // something that points elsewhere.
  it.each(STATIC_SITEMAP_ROUTES)('%s declares itself canonical', (path, meta) => {
    expect(meta.alternates?.canonical).toBe(absUrl(path));
  });

  /**
   * The dynamic half, checked at the source rather than by enumerating routes:
   * the sitemap builds these from the same config the page builders read, so a
   * slug can only diverge if one of them stops using it.
   */
  it('builds its dynamic routes from the same slugs the pages use', () => {
    expect(servicesConfig.length).toBe(8);
    expect(guides.length).toBe(7);
    expect(locationsConfig.length).toBe(7);
    for (const slug of [...servicesConfig, ...guides, ...locationsConfig].map(item => item.slug)) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
