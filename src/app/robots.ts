import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/app/utils/seo';

/**
 * The catalog's filter links, as `robots.txt` patterns — each parameter in both
 * positions, for the same reason as `_rsc` below: a rule anchored on `?` misses
 * the parameter whenever it is not the first one in the query string.
 *
 * Every option in the filter rail is a real `<Link>` (see `FacetGroup.tsx`), and
 * `/tires` is rendered on every request with its facet queries against SQL
 * Server. Multi-select brands × condition × price × remaining life × the rest is
 * an unbounded number of URLs, and all of them canonicalise back to `/tires`. In
 * September 2026 Applebot alone was fetching ~244.000 of them a day, each one a
 * cache miss and a round of database queries, for pages that can never rank.
 *
 * **Deliberately not listed:** `page`, and the size parameters `w`, `s`, `d`.
 * `tiresMetadata` gives pagination a self-referencing canonical and folds a
 * complete size into its `/tires/size/{slug}` landing page — both are pages we
 * ask Google to reach, and blocking them here would contradict that. Their
 * combinations are bounded; the facets are what multiply.
 */
export const FACET_PARAMS = [
  'brands',
  'condition',
  'minPrice',
  'maxPrice',
  'minRemainingLife',
  'maxRemainingLife',
  'patched',
  'kindSale',
  'view',
] as const;

const facetRules = FACET_PARAMS.flatMap(param => [`/tires?${param}=`, `/tires?*&${param}=`]);

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout',
          '/dashboard',
          '/sellers/',
          '/feed/',
          /**
           * Next mints a new URL every time it prefetches a hovered link, by
           * appending `_rsc=<hash>`. A single crawl found **37.296** of them
           * against 2.106 real pages — 7.657 copies of the home page alone and
           * 5.923 of `/legal-policies`. Each answers `200` with the real page's
           * HTML, so Google spends its visit walking copies of the front door
           * instead of the catalog, which is the part that changes daily.
           *
           * Indexation is already handled: these URLs serve a canonical pointing
           * at the real page, which is the strongest duplicate signal Google
           * accepts. What was left was the crawl budget, and that is what
           * `robots.txt` is for. An `X-Robots-Tag: noindex` was considered and
           * dropped — a URL disallowed here is never fetched, so its headers are
           * never read (see `020-crawl-hygiene`, Decision 1).
           *
           * **Both patterns are needed.** `?_rsc=` only matches when the
           * parameter leads the query string; Next appends it to whatever href it
           * is prefetching, so a link that already carries a query arrives as
           * `&_rsc=`. With only the first pattern, every prefetch of a filtered
           * catalog link stays crawlable — the larger half of the problem.
           *
           * This does not change what a visitor gets: prefetching still runs, it
           * just stops being something a crawler follows.
           */
          '/*?_rsc=',
          '/*&_rsc=',
          ...facetRules,
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
