import { describe, expect, it } from 'vitest';

import { getLocationBySlug } from '@/app/(shop)/locations/locationsConfig';

import nextConfig from '../../../../next.config.mjs';

/**
 * Five store URLs were indexed after the May migration, ranked in positions 3–4,
 * and were then renamed by a deploy that left no redirect. Four now redirect.
 *
 * Three things can quietly undo that, and none of them shows up as a failure
 * anywhere else: putting these rules after the host redirect (two hops instead
 * of one), giving them a host condition (the bare domain stops matching), or
 * renaming a store so a destination points at a page that no longer exists.
 */

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: unknown;
};

// `redirects` is optional on `NextConfig`. If it ever goes missing, that is the
// whole feature gone, so fail loudly here rather than skipping the assertions.
if (!nextConfig.redirects) throw new Error('next.config.mjs no longer defines redirects()');
const redirects = (await nextConfig.redirects()) as Redirect[];

const LEGACY: [from: string, to: string][] = [
  ['/locations/miami-hialeah', '/locations/hialeah'],
  ['/locations/miami-coral-gables', '/locations/coral-gables'],
  ['/locations/orlando-semoran', '/locations/east-orlando'],
  ['/locations/miami-south-us1', '/locations/cutler-bay'],
];

const ruleFor = (source: string) => redirects.find(r => r.source === source);
const hostRuleIndex = redirects.findIndex(r => r.source === '/:path*');

describe('legacy store redirects', () => {
  // AC11
  it.each(LEGACY)('%s redirects permanently to %s', (from, to) => {
    const rule = ruleFor(from);
    expect(rule).toBeDefined();
    expect(rule?.permanent).toBe(true);
    expect(rule?.destination).toBe(`https://www.mrgomatires.com${to}`);
  });

  /**
   * AC12 — one hop from either host.
   *
   * Next matches in array order. After the host rule, a legacy URL on the bare
   * domain would redirect to `www` first and to the new slug second.
   */
  it('matches before the bare-host rule, so neither host needs two hops', () => {
    expect(hostRuleIndex).toBeGreaterThan(-1);
    for (const [from] of LEGACY) {
      expect(redirects.findIndex(r => r.source === from)).toBeLessThan(hostRuleIndex);
    }
  });

  it('carries no host condition, so it matches on www and the bare domain alike', () => {
    for (const [from] of LEGACY) {
      expect(ruleFor(from)?.has).toBeUndefined();
    }
  });

  it('sends every host to the canonical one, absolutely', () => {
    for (const [from] of LEGACY) {
      expect(ruleFor(from)?.destination).toMatch(/^https:\/\/www\./);
    }
  });

  /**
   * AC13 — a redirect may only point at a store that exists.
   *
   * Validated against the published store list rather than a copy of it, so a
   * future rename that orphans one of these fails here instead of sending
   * Google from a 404 to a different 404.
   */
  it.each(LEGACY)('%s points at a store %s that locationsConfig still publishes', (_from, to) => {
    const slug = to.replace('/locations/', '');
    expect(getLocationBySlug(slug)).toBeDefined();
  });

  /**
   * AC14 — the fifth URL is deliberately not here.
   *
   * `/locations/miami-north-441` has no confirmable destination: none of the
   * seven current addresses is on that road. A redirect pointed at the wrong
   * store is worse than the 404 it replaces, so it stays a 404 until the owner
   * confirms which store "441" was. This test exists so that adding it later is
   * a decision someone makes, not something that drifts in.
   */
  it('leaves miami-north-441 as a 404 — its destination is unconfirmed', () => {
    expect(redirects.some(r => r.source.includes('miami-north-441'))).toBe(false);
  });
});

/**
 * One flag away from a slash on every canonical on the site.
 *
 * This started as a report that the home page's canonical carried a trailing
 * slash. It does not — the tag reads `href="https://www.mrgomatires.com"`, and
 * the slash being seen came from a browser extension re-serialising the URL
 * (`new URL('https://x.com').href` returns `https://x.com/`). That same artifact
 * is what made the original audit report it as T030.
 *
 * Looking for it found a real gap beside it. `metadata.test.ts` has pinned the
 * home canonical since `020`, but it asserts what the **builder** returns. The
 * slash is absent from the **rendered** tag only because Next strips it, and Next
 * strips it only because `trailingSlash` defaults to `false`. Setting that one
 * flag would put a slash on the canonical of every page on this site — and every
 * existing test would still pass.
 */
describe('trailing slashes', () => {
  it('does not enable trailingSlash', () => {
    expect((nextConfig as { trailingSlash?: boolean }).trailingSlash).toBeFalsy();
  });
});
