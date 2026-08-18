import { describe, expect, it } from 'vitest';

import robots from './robots';

/**
 * `robots.txt` is one of the few files where a one-character edit silently
 * removes the site from Google. Nothing else in the suite reads it, so this is
 * the guard: every rule that exists today is asserted by name, and the two rules
 * `020-crawl-hygiene` added are asserted alongside them.
 *
 * The rules that were deliberately *not* added are asserted too. A rule missing
 * because someone decided against it and a rule missing because someone deleted
 * it look identical in a diff a year from now.
 */

const rule = robots().rules;
const first = Array.isArray(rule) ? rule[0] : rule;
const disallow = ([] as string[]).concat(first.disallow ?? []);

describe('robots.txt', () => {
  // AC1 — the rules that predate this feature
  it.each(['/api/', '/checkout', '/dashboard', '/sellers/', '/feed/'])(
    'still disallows %s',
    path => {
      expect(disallow).toContain(path);
    }
  );

  it('still allows everything else, and still points at the sitemap', () => {
    expect(first.userAgent).toBe('*');
    expect(first.allow).toBe('/');
    expect(robots().sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
    expect(robots().host).toMatch(/^https?:\/\//);
  });

  /**
   * AC1 — both positions, not just the first.
   *
   * `?_rsc=` matches only when the parameter leads the query string. Next
   * appends it to the href it is prefetching, so a link that already carries a
   * query is prefetched as `&_rsc=`. Dropping the second pattern would leave
   * every prefetch of a filtered catalog link crawlable.
   */
  it('blocks the prefetch parameter wherever it appears in the query string', () => {
    expect(disallow).toContain('/*?_rsc=');
    expect(disallow).toContain('/*&_rsc=');
  });

  /**
   * AC2 — deliberately absent.
   *
   * The audit asked for this in the same breath as the prefetch rules, but every
   * product photo is served through the image optimizer, so blocking it removes
   * the catalog from Google Images. Its stated justification is crawl waste from
   * 278 broken images — an inventory problem. It is decided alongside the work
   * that fixes the cause, not here.
   */
  it('does not block the image optimizer', () => {
    expect(disallow.some(path => path.includes('_next/image'))).toBe(false);
  });

  /**
   * AC2 — a rule must never shadow a page we ask Google to index.
   *
   * Checked against the routes the sitemap publishes rather than a copy of them,
   * so adding a disallow that swallows a real section fails here.
   */
  it('never disallows a path the sitemap publishes', () => {
    const published = [
      '/',
      '/tires',
      '/tires/new',
      '/tires/used',
      '/tires/brands/michelin',
      '/tires/size/235-50-20',
      '/tires/471004-bridgestone-235-50-20',
      '/locations',
      '/locations/hialeah',
      '/services',
      '/services/wheel-alignment',
      '/guides',
      '/guides/used-vs-new-tires',
      '/about-us',
      '/contact',
      '/instant-quote',
      '/legal-policies',
    ];

    // Only the literal prefix rules can shadow a path; the `_rsc` rules require
    // a query string, which none of these carry.
    const prefixes = disallow.filter(path => !path.includes('_rsc='));
    for (const path of published) {
      for (const blocked of prefixes) {
        expect(path.startsWith(blocked)).toBe(false);
      }
    }
  });
});
