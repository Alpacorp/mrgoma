import { factsFromSingleTire, factsParts } from '@/app/utils/cartFacts';
import { cartLine } from '@/app/utils/cartLine';

/**
 * What Stripe's payment page shows for one tire (feature 048).
 *
 * Until 048 a line was named with the inventory's internal text —
 * `(264890) | PIRELLI | SCORPION TM MS LR XL | 235/50/19` — and carried the
 * site's own image address, which Stripe cannot fetch: `www.mrgomatires.com`
 * answers automated requests with a firewall challenge (429), so 72% of tires
 * (the ones without a photo, which send the generic image) showed a broken "?".
 *
 * Now the name is the cart's title, the details go in the description, and an
 * image on the site's host is never sent: real photos live on the photo
 * supplier's host and pass; anything else becomes `fallbackImage` (the generic
 * tire image on a public Vercel Blob store, `CHECKOUT_FALLBACK_IMAGE_URL`) or
 * no image at all — never a broken one.
 *
 * Pure: the route reads the tire, this decides what Stripe sees. Only fields
 * the public tire API already returns are read — no warehouse, no shelf.
 */

export type StripeTire = {
  /** The composed `(CODE) | BRAND | SIZE` the inventory names a tire with. */
  name: string;
  brand?: string;
  model?: string;
  size?: string;
  code?: string;
  /** `New` / `Used`. */
  condition?: string;
  treadDepth?: string;
  remainingLife?: string;
  /** `Yes` / `No`. */
  patched?: string;
  /** The tire's first image, already absolute. */
  image?: string | null;
};

export type StripeProduct = { name: string; description?: string; images?: string[] };

/** The production names, whatever the request's own host is. */
export const SITE_HOSTS = ['www.mrgomatires.com', 'mrgomatires.com'];

const hostOf = (url?: string | null) => {
  try {
    return url ? new URL(url).hostname.toLowerCase() : null;
  } catch {
    return null;
  }
};

/** The hosts whose images Stripe cannot fetch: the site's, in every form it is served. */
export function siteHostsFrom(urls: Array<string | null | undefined>): string[] {
  const hosts = new Set(SITE_HOSTS);
  for (const u of urls) {
    const h = hostOf(u);
    if (h) hosts.add(h);
  }
  return [...hosts];
}

/** True for an image served by the site itself (or an unreadable address). */
export function isSiteHost(url: string, siteHosts: string[]): boolean {
  const host = hostOf(url);
  return !host || siteHosts.includes(host);
}

const usable = (url: string | null | undefined, siteHosts: string[]) =>
  Boolean(url && /^https?:\/\//i.test(url) && !isSiteHost(url, siteHosts));

export function stripeProduct(
  tire: StripeTire,
  opts: { siteHosts: string[]; fallbackImage?: string | null }
): StripeProduct {
  const line = cartLine({
    name: tire.name,
    brand: tire.brand,
    model: tire.model,
    size: tire.size,
    code: tire.code,
  });

  const condition = tire.condition === 'New' || tire.condition === 'Used' ? tire.condition : '';
  // Tread, life and patch tell used tires apart; a new tire has none of that.
  // DOT stays on the site (D3: size, condition, tread, life, patch, stock).
  const facts =
    condition === 'Used'
      ? factsParts({
          ...factsFromSingleTire({
            treadDepth: tire.treadDepth ?? '',
            remainingLife: tire.remainingLife ?? '',
            patched: tire.patched ?? '',
          }),
          dot: undefined,
        })
      : [];
  const description = [line.size, condition, ...facts, tire.code ? `Stock #${tire.code}` : '']
    .filter(Boolean)
    .join(' · ');

  const image = usable(tire.image, opts.siteHosts)
    ? tire.image
    : usable(opts.fallbackImage, opts.siteHosts)
      ? opts.fallbackImage
      : null;

  return {
    name: line.title,
    ...(description ? { description } : {}),
    ...(image ? { images: [image] } : {}),
  };
}
