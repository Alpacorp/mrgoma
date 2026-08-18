import { cache } from 'react';

import { matchSlug, slugify } from '@/app/utils/tireSlug';
import { fetchSizes } from '@/repositories/tiresRepository';

/**
 * One answer to the question two routes now ask: *is this a size we stock, and
 * what is its slug?*
 *
 * `/tires/size/[size]` asks it to decide whether to render or 404, and `/tires`
 * asks it to decide whether a complete size facet may canonicalise onto its
 * landing page. Both must agree, and both must agree with `src/app/sitemap.ts`
 * and with the route's own `generateStaticParams` — all four derive a slug the
 * same way, by running `slugify()` over what `fetchSizes()` returns. That shared
 * derivation is why "every size in the sitemap resolves" is true by construction
 * rather than by a list somebody remembers to update.
 *
 * The matching rule itself lives in `tireSlug.ts` as `matchSlug`, beside the
 * `slugify` it inverts — pure, and therefore testable without a database or a
 * mock, which importing this module is not: it reaches `mssql` and throws at
 * load time when `SERVER_URL` is unset. `getBrandName` on the brand route
 * already implemented that rule inline and correctly; it is now the same
 * function rather than a second copy of it.
 */

/**
 * `fetchSizes`, deduped for the length of one request.
 *
 * The size route asks twice per render — once in `generateMetadata` and once in
 * the page body — and used to run the query both times. `cache` is React's own
 * request-scoped memo, so this costs no dependency and no configuration.
 */
export const getStockedSizes = cache(fetchSizes);

/**
 * The stocked size behind a slug, or `null`.
 *
 * **It never fabricates one.** The size route used to fall back to splitting an
 * unknown slug into three parts and inventing a size from the pieces, which made
 * `/tires/size/foo-bar-baz` a live, indexable, self-canonicalising page — an
 * unbounded URL space any broken link or typo could add to.
 */
export async function resolveSizeSlug(slug: string): Promise<string | null> {
  return matchSlug(await getStockedSizes(), slug);
}

/**
 * The `/tires/size/{slug}` landing page for a complete size facet, or `null`
 * when we do not publish one.
 *
 * A partial size is not a page we publish, so any missing dimension returns
 * `null` without touching the database. A complete size that we do not stock
 * also returns `null`: after the fallback was removed its landing page 404s, and
 * a canonical must never point at a 404.
 */
export async function sizePageSlug(
  w: string | undefined,
  s: string | undefined,
  d: string | undefined
): Promise<string | null> {
  const [width, sidewall, diameter] = [w, s, d].map(part => (part || '').trim());
  if (!width || !sidewall || !diameter) return null;

  const slug = slugify(`${width}/${sidewall}/${diameter}`);
  return (await resolveSizeSlug(slug)) ? slug : null;
}
