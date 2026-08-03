import type { Metadata } from 'next';

import { APPLE_TOUCH_ICON } from '@/app/utils/appManifest';
import {
  FOUNDED_YEAR,
  INVENTORY_NETWORK,
  LOCATIONS_LABEL_LONG,
  SHIPPING,
  SLOGAN,
  WARRANTY,
} from '@/app/utils/brandClaims';

export const SITE_NAME = 'MrGoma Tires';

/** Brand suffix used by the commercial entry points. Shorter than the root
 *  template's ` | MrGoma Tires` so the differentiator gets the character budget. */
export const TITLE_SUFFIX = ' | MrGoma';

/** Google truncates title links past roughly this width. */
export const TITLE_MAX = 60;

/** The window in which Google reliably shows a description without cutting it. */
export const DESCRIPTION_MIN = 140;
export const DESCRIPTION_MAX = 160;

export const DEFAULT_DESCRIPTION =
  'Used and new tires in Miami & Orlando, FL. Every like-new used tire is backed by a 30-day warranty. Free shipping nationwide and 7 convenient locations.';
export const DEFAULT_KEYWORDS = [
  'tires',
  'used tires',
  'new tires',
  'Miami tires',
  'Miami tire shop',
  'buy tires online',
  'MrGoma Tires',
  'tire installation',
  'wheels',
  'Florida',
  'Miami',
];

/**
 * Where the site canonically lives — the host for canonicals, the sitemap, OG
 * URLs and JSON-LD, and the host `next.config.mjs` redirects the bare-domain
 * traffic to. Keep the fallback below in step with the one there.
 *
 * Not to be confused with `NEXT_PUBLIC_BASE_URL`, which is a different setting
 * answering a different question (Stripe return URLs, and the origin allow-list
 * in `/api/instant-quote`). They happen to hold the same value today.
 */
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const fallback = 'https://www.mrgomatires.com';
  const base = (env || fallback).trim();
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export function absUrl(pathOrUrl: string): string {
  try {
    const site = getSiteUrl();
    if (!pathOrUrl) return site;
    // If already absolute
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    if (!pathOrUrl.startsWith('/')) return `${site}/${pathOrUrl}`;
    return `${site}${pathOrUrl}`;
  } catch {
    return pathOrUrl;
  }
}

export function canonical(pathWithQuery: string): string {
  return absUrl(pathWithQuery);
}

export function buildDefaultMetadata(): Metadata {
  const site = getSiteUrl();
  return {
    metadataBase: new URL(site),
    title: {
      // The fallback for every page that doesn't build its own (contact, legal,
      // checkout…). It carries a differentiator so the long tail isn't generic.
      default: `Used & New Tires in Miami & Orlando${TITLE_SUFFIX}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    robots: {
      index: true,
      follow: true,
    },
    // Every icon the document advertises, in one place. These used to be split
    // between here and two hand-written <link> tags in the root layout, one of
    // which declared the PNG favicon as `image/x-icon`.
    //
    // `apple` is the one iOS reads when the crew adds the staff portal to a home
    // screen, and it has to be a real 180x180 square with no alpha — iOS
    // composites a transparent icon onto black.
    icons: {
      icon: [
        { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: APPLE_TOUCH_ICON, sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      url: site,
      siteName: SITE_NAME,
      title: `Used & New Tires in Miami & Orlando${TITLE_SUFFIX}`,
      description: DEFAULT_DESCRIPTION,
      locale: 'en_US',
      images: [
        {
          url: absUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} – New & Used Tires in Miami & Orlando, FL`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Used & New Tires in Miami & Orlando${TITLE_SUFFIX}`,
      description: DEFAULT_DESCRIPTION,
      images: [absUrl('/opengraph-image')],
    },
    alternates: {
      canonical: site,
    },
    category: 'Automotive',
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Metadata builders for the commercial entry points.
 *
 * These are deliberately **pure** — plain values in, `Metadata` out, no I/O.
 * Three of the pages they serve build metadata inside a `generateMetadata` that
 * also awaits database data, so testing the page modules would mean mocking
 * `mssql`. Keeping the copy here means the regression guard in `metadata.test.ts`
 * runs with no database and no mocks.
 *
 * Every title bypasses the root `%s | MrGoma Tires` template via
 * `title: { absolute }` — the template costs 15 characters that the
 * differentiator needs.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Picks the first candidate that fits Google's title width; hard-trims if none do. */
function fitTitle(...candidates: string[]): string {
  return (
    candidates.find(candidate => candidate.length <= TITLE_MAX) ??
    candidates[candidates.length - 1].slice(0, TITLE_MAX).trimEnd()
  );
}

/**
 * Composes a description that lands inside Google's display window.
 *
 * Pages with a variable head (a brand name, a tire size) can't hit 140–160 with
 * one fixed sentence, so each builder supplies several tail clauses ordered
 * longest-first and this picks the one that fits.
 */
function fitDescription(head: string, tails: readonly string[]): string {
  const candidates = tails.map(tail => `${head} ${tail}`.replace(/\s+/g, ' ').trim());

  const fits = candidates.find(
    candidate => candidate.length >= DESCRIPTION_MIN && candidate.length <= DESCRIPTION_MAX
  );
  if (fits) return fits;

  // Nothing landed in the window (an unusually long brand name, say). Prefer the
  // longest candidate that at least doesn't overflow.
  const underMax = candidates.filter(candidate => candidate.length <= DESCRIPTION_MAX);
  if (underMax.length) return underMax[underMax.length - 1];

  return candidates[candidates.length - 1].slice(0, DESCRIPTION_MAX).trimEnd();
}

function pageMetadata(params: { title: string; description: string; path: string }): Metadata {
  const url = canonical(params.path);
  return {
    title: { absolute: params.title },
    description: params.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url,
      title: params.title,
      description: params.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
    },
  };
}

/** Home. The copy here is fixed by the approved decision in `spec.md` (AC3b). */
export function homeMetadata(): Metadata {
  return pageMetadata({
    title: `Used & New Tires Miami — ${WARRANTY}${TITLE_SUFFIX}`,
    description:
      '15,000+ like-new used and new tires, every used tire backed by a 30-day warranty. 7 locations in Miami & Orlando. Free shipping. Since 2007.',
    path: '/',
  });
}

/**
 * `/tires` — the full catalogue, optionally narrowed by size and paginated.
 * Takes the route's own `w`/`s`/`d` param names rather than inventing new ones.
 */
export function tiresMetadata(
  params: { w?: string; s?: string; d?: string; page?: number } = {}
): Metadata {
  const w = (params.w || '').trim();
  const s = (params.s || '').trim();
  const d = (params.d || '').trim();
  const page = params.page && params.page > 1 ? params.page : 1;

  const size = w && s && d ? `${w}/${s}/${d}` : '';
  const paged = page > 1 ? ` — Page ${page}` : '';

  const title = size
    ? fitTitle(
        `${size} Tires in Miami — ${WARRANTY}${paged}${TITLE_SUFFIX}`,
        `${size} Tires in Miami${paged}${TITLE_SUFFIX}`,
        `${size} Tires${paged}${TITLE_SUFFIX}`
      )
    : fitTitle(
        `Used & New Tires in Miami — ${WARRANTY}${paged}${TITLE_SUFFIX}`,
        `Used & New Tires in Miami${paged}${TITLE_SUFFIX}`
      );

  const head = size
    ? `Shop ${size} tires in Miami and Orlando — like-new used and new, every used tire backed by a 30-day warranty.`
    : 'Browse like-new used and new tires in Miami and Orlando, every used tire backed by a 30-day warranty.';

  const query = new URLSearchParams();
  if (w) query.set('w', w);
  if (s) query.set('s', s);
  if (d) query.set('d', d);
  if (page > 1) query.set('page', String(page));

  return pageMetadata({
    title,
    description: fitDescription(head, [
      `${SHIPPING} and installation at our 7 locations.`,
      `${SHIPPING}. 7 locations.`,
      'Free shipping.',
    ]),
    path: query.toString() ? `/tires?${query.toString()}` : '/tires',
  });
}

/** `/tires/used` — the strongest page for the warranty claim. */
export function usedTiresMetadata(): Metadata {
  return pageMetadata({
    title: fitTitle(`Used Tires Miami & Orlando — ${WARRANTY}${TITLE_SUFFIX}`),
    description: fitDescription(
      'Like-new used tires, every one ASE-inspected and backed by a 30-day warranty. Save up to 70% versus new.',
      [`${SHIPPING} and 7 locations in Miami & Orlando.`, `${SHIPPING}. 7 locations.`]
    ),
    path: '/tires/used',
  });
}

/** `/tires/new` — leads with shipping; the warranty claim belongs to used tires. */
export function newTiresMetadata(): Metadata {
  return pageMetadata({
    title: fitTitle(`New Tires in Miami & Orlando — Free Shipping${TITLE_SUFFIX}`),
    description: fitDescription(
      `Brand-new tires from top manufacturers, part of ${INVENTORY_NETWORK}.`,
      [
        `${SHIPPING} and expert installation at ${LOCATIONS_LABEL_LONG}.`,
        `${SHIPPING} and expert installation in Miami & Orlando.`,
        `${SHIPPING}.`,
      ]
    ),
    path: '/tires/new',
  });
}

/** `/tires/brands/[brand]` — head length varies with the brand name. */
export function brandMetadata(params: { brand: string; slug: string }): Metadata {
  const { brand, slug } = params;
  return pageMetadata({
    title: fitTitle(
      `${brand} Tires in Miami — ${WARRANTY}${TITLE_SUFFIX}`,
      `${brand} Tires in Miami & Orlando${TITLE_SUFFIX}`,
      `${brand} Tires${TITLE_SUFFIX}`
    ),
    description: fitDescription(
      `Shop ${brand} tires in Miami and Orlando — like-new used and new, every used tire backed by a 30-day warranty.`,
      [
        `${SHIPPING} and installation at our 7 locations.`,
        `${SHIPPING}. 7 locations.`,
        'Free shipping.',
      ]
    ),
    path: `/tires/brands/${slug}`,
  });
}

/** `/tires/size/[size]` — head length varies with the size label. */
export function sizeMetadata(params: { size: string; slug: string }): Metadata {
  const { size, slug } = params;
  return pageMetadata({
    title: fitTitle(
      `${size} Tires in Miami — ${WARRANTY}${TITLE_SUFFIX}`,
      `${size} Tires in Miami & Orlando${TITLE_SUFFIX}`,
      `${size} Tires${TITLE_SUFFIX}`
    ),
    description: fitDescription(
      `Shop ${size} tires in Miami and Orlando — like-new used and new, every used tire backed by a 30-day warranty.`,
      [
        `${SHIPPING} and installation at our 7 locations.`,
        `${SHIPPING}. 7 locations.`,
        'Free shipping.',
      ]
    ),
    path: `/tires/size/${slug}`,
  });
}

/** `/locations` — the hub for all seven stores. */
export function locationsMetadata(): Metadata {
  return pageMetadata({
    title: fitTitle(`7 Tire Shops in Miami & Orlando, FL${TITLE_SUFFIX}`),
    description: fitDescription(
      `Find MrGoma Tires near you — ${INVENTORY_NETWORK}, every like-new used tire backed by a 30-day warranty.`,
      [
        'Walk-ins welcome at all 7 shops in Miami & Orlando.',
        'Walk-ins welcome at every location.',
        'Walk-ins welcome.',
      ]
    ),
    path: '/locations',
  });
}

/** `/locations/[location]` — one store. */
export function locationMetadata(params: {
  name: string;
  slug: string;
  city: string;
  serving?: string;
}): Metadata {
  const { name, slug, city } = params;
  return pageMetadata({
    title: fitTitle(
      `${name} Tire Shop — ${WARRANTY}${TITLE_SUFFIX}`,
      `${name} Tire Shop, ${city}${TITLE_SUFFIX}`,
      `${name} Tire Shop${TITLE_SUFFIX}`
    ),
    description: fitDescription(
      `MrGoma Tires ${name}: like-new used and new tires, every used tire backed by a 30-day warranty.`,
      [
        `Walk-ins welcome, ${SHIPPING.toLowerCase()}, and same-day installation in ${city}.`,
        `Walk-ins welcome and same-day installation in ${city}.`,
        'Walk-ins welcome, same-day installation.',
        `Walk-ins welcome in ${city}.`,
      ]
    ),
    path: `/locations/${slug}`,
  });
}

export function productTitle(params: {
  brand?: string;
  model?: string;
  size?: string;
  condition?: string; // New | Used
  price?: number | string;
}): string {
  const condition = params.condition ? `${params.condition} ` : '';
  const brand = params.brand ? `${params.brand} ` : '';
  const model = params.model ? `${params.model} ` : '';
  const size = params.size ? `${params.size} ` : '';
  const priceNum = typeof params.price === 'string' ? Number(params.price) : params.price;
  const hasPrice = typeof priceNum === 'number' && isFinite(priceNum) && priceNum > 0;
  const priceStr = hasPrice ? ` | $${priceNum!.toFixed(0)}` : '';
  return `${condition}${brand}${model}${size}Tire in Miami${priceStr} | Free Shipping`;
}

export function productDescription(params: {
  brand?: string;
  model?: string;
  size?: string;
  condition?: string;
  patched?: string;
  remainingLife?: string;
}): string {
  const bits: string[] = [];
  const cond = params.condition?.toLowerCase();
  if (cond === 'new') bits.push('New tire');
  else if (cond === 'used') bits.push('Used tire');
  else bits.push('Quality tire');
  if (params.brand) bits.push(`by ${params.brand}`);
  if (params.model) bits.push(params.model);
  if (params.size) bits.push(params.size);
  bits.push('available in Miami, Florida.');
  if (params.remainingLife && cond === 'used')
    bits.push(`Approx. remaining life: ${params.remainingLife}.`);
  if (params.patched && cond === 'used') bits.push(`Patched: ${params.patched}.`);
  bits.push('Buy online or visit our locations for installation.');
  return bits.join(' ');
}

export function buildProductJsonLd(params: {
  url: string;
  name: string;
  brand?: string;
  description?: string;
  images?: string[];
  price?: number | string;
  currency?: string;
  condition?: 'New' | 'Used' | string;
  availability?: 'InStock' | 'OutOfStock' | string;
  sku?: string;
  gtin?: string;
}): Record<string, unknown> {
  const priceValue = typeof params.price === 'string' ? Number(params.price) : params.price;
  const isNew = (params.condition || '').toLowerCase() === 'new';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    brand: params.brand ? { '@type': 'Brand', name: params.brand } : undefined,
    description: params.description,
    image: (params.images || []).map(absUrl),
    sku: params.sku,
    gtin: params.gtin,
    offers: {
      '@type': 'Offer',
      url: params.url,
      priceCurrency: params.currency || 'USD',
      price:
        typeof priceValue === 'number' && !Number.isNaN(priceValue)
          ? priceValue.toFixed(2)
          : undefined,
      availability: `https://schema.org/${params.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${isNew ? 'NewCondition' : 'UsedCondition'}`,
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: absUrl(item.url),
    })),
  };
}

/** Stable identifier for the brand as an entity, so other nodes can point at it. */
export function organizationId(): string {
  return `${getSiteUrl()}/#organization`;
}

export function organizationJsonLd() {
  const site = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId(),
    name: SITE_NAME,
    url: site,
    logo: absUrl('/favicon.png'),
    // The WhatsApp line: already the primary contact CTA on /contact, so the
    // structured data now matches what the site actually pushes.
    telephone: '+14073644016',
    description: DEFAULT_DESCRIPTION,
    slogan: SLOGAN,
    foundingDate: String(FOUNDED_YEAR),
    areaServed: [
      { '@type': 'City', name: 'Miami' },
      { '@type': 'City', name: 'Orlando' },
      { '@type': 'State', name: 'Florida' },
    ],
    sameAs: [
      'https://instagram.com/mrgomatires',
      'https://www.facebook.com/profile.php?id=61573861890811',
      'https://x.com/MrGomaTires',
      'https://www.tiktok.com/@mrgomatiresofficial',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Miami',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
  };
}

export interface LocationSchemaInput {
  slug: string;
  name: string;
  address: string;
  phone: string;
  city?: string;
  mapLink?: string;
  image?: string;
  neighborhoods?: string[];
  geo?: { latitude: number; longitude: number };
  hours?: { days: string[]; opens: string; closes: string }[];
}

/**
 * One node per physical store.
 *
 * Before this feature all seven declared `url: <site root>` — seven businesses
 * claiming a single URL, which is worse for local search than emitting nothing.
 * Each now points at its own `/locations/[slug]` page and carries a stable `@id`
 * so Google can tell them apart and link them to the brand entity.
 */
export function buildLocationsJsonLd(locations: LocationSchemaInput[]): Record<string, unknown>[] {
  return locations.map(loc => {
    // Parse "18200 S Dixie Hwy, Miami, FL 33157" → structured address
    const parts = loc.address.split(', ');
    const streetAddress = parts[0] || loc.address;
    const addressLocality = parts[1] || loc.city || 'Miami';
    const stateZip = (parts[2] || 'FL 00000').split(' ');
    const addressRegion = stateZip[0] || 'FL';
    const postalCode = stateZip[1] || '';

    const url = absUrl(`/locations/${loc.slug}`);

    return {
      '@context': 'https://schema.org',
      '@type': 'AutoPartsStore',
      '@id': `${url}#store`,
      name: `MrGoma Tires — ${loc.name}`,
      url,
      telephone: loc.phone,
      priceRange: '$$',
      ...(loc.image ? { image: absUrl(loc.image) } : {}),
      ...(loc.mapLink ? { hasMap: loc.mapLink } : {}),
      ...(loc.geo
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: loc.geo.latitude,
              longitude: loc.geo.longitude,
            },
          }
        : {}),
      ...(loc.hours?.length
        ? {
            openingHoursSpecification: loc.hours.map(span => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: span.days,
              opens: span.opens,
              closes: span.closes,
            })),
          }
        : {}),
      ...(loc.neighborhoods?.length
        ? {
            areaServed: loc.neighborhoods.map(name => ({ '@type': 'Place', name })),
          }
        : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress,
        addressLocality,
        addressRegion,
        postalCode,
        addressCountry: 'US',
      },
      parentOrganization: { '@id': organizationId() },
    };
  });
}

export function websiteJsonLd() {
  const site = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    name: SITE_NAME,
    url: site,
    // No `potentialAction`/SearchAction: Google retired the sitelinks search box,
    // so it produced nothing and was dead weight in every page's head.
    publisher: { '@id': organizationId() },
  };
}

/**
 * Declares how many items a listing page holds, so the rendered "N available to
 * buy online" claim is backed by data rather than being only a string.
 */
export function buildItemListJsonLd(params: {
  url: string;
  name: string;
  count: number;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${absUrl(params.url)}#items`,
    name: params.name,
    url: absUrl(params.url),
    numberOfItems: params.count,
  };
}
