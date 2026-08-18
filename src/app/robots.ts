import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/app/utils/seo';

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
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
