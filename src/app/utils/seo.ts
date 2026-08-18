import type { Metadata } from 'next';

import { APPLE_TOUCH_ICON } from '@/app/utils/appManifest';
import {
  FOUNDED_YEAR,
  INVENTORY_NETWORK,
  LOCATIONS_LABEL_LONG,
  SHIPPING,
  SINCE,
  SLOGAN,
  WARRANTY,
} from '@/app/utils/brandClaims';
import { WHATSAPP_TEL } from '@/app/utils/whatsapp';

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
    /**
     * `''` and `'/'` are the same place, and the site has to spell it one way.
     *
     * They used to differ, and the difference escaped through two exits. As
     * `alternates.canonical` the slashed form passes through Next's metadata
     * resolver, which strips the slash because `trailingSlash` is `false`; as the
     * `item` of a `BreadcrumbList` it goes straight into JSON-LD, which Next does
     * not touch. So one page told Google the site was `…com` in its canonical,
     * `og:url`, `Organization.url` and `WebSite.url`, and `…com/` in its
     * breadcrumb — eight templates emit that breadcrumb.
     *
     * Unslashed wins because it is what the other five emitters already publish
     * and what the server redirects to: with `trailingSlash: false`, every
     * non-root path with a trailing slash is 308'd to the form without one.
     *
     * `organizationId()` and the `#website` `@id` build their slash literally and
     * deliberately do not come through here. An `@id` is a stable key Google uses
     * to merge an entity across crawls, not a claim about a URL; changing one
     * re-mints the entity for no gain.
     */
    if (!pathOrUrl || pathOrUrl === '/') return site;
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

/** The site's default preview card, used by every page that has nothing better. */
export const DEFAULT_OG_IMAGE = {
  url: absUrl('/opengraph-image'),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} – New & Used Tires in Miami & Orlando, FL`,
};

/**
 * The one way to describe a page.
 *
 * **Everything here has to be declared, because Next does not merge.** A segment
 * that defines `openGraph` *replaces* the root layout's rather than filling in
 * around it, so a builder that sets three fields silently drops the other three.
 * That is exactly what happened: ~400 pages asked through this function, got a
 * correct `og:url`, and shipped with **no `og:image` and no `og:locale` at all** —
 * every brand, size and store link shared as bare text, which is the capability
 * `019` opened a firewall rule to enable.
 *
 * `title: { absolute }` is the other half. Without it the root
 * `%s | MrGoma Tires` template appends a second brand to a title that already
 * ends in one, which is how `/services` came to read
 * `Auto Services in Miami & Orlando | MrGoma Tires | MrGoma Tires`.
 *
 * Pure by design — plain values in, `Metadata` out, no I/O — so
 * `metadata.test.ts` can guard every entry point with no database and no mocks.
 */
function pageMetadata(params: {
  title: string;
  description: string;
  path: string;
  /** Overrides the site card. Stores pass their own storefront photo. */
  image?: { url: string; alt: string };
  /**
   * `'article'` for the guides, which is what they already declare. Left to the
   * caller because migrating them onto a hardcoded `'website'` would downgrade
   * seven articles to generic pages, and nothing in the rendered page would show
   * it — only a social debugger would.
   */
  type?: 'website' | 'article';
  /** `article:published_time`. Only meaningful alongside `type: 'article'`. */
  publishedTime?: string;
}): Metadata {
  const url = canonical(params.path);
  const images = params.image
    ? [{ url: absUrl(params.image.url), width: 1200, height: 630, alt: params.image.alt }]
    : [DEFAULT_OG_IMAGE];

  return {
    title: { absolute: params.title },
    description: params.description,
    alternates: { canonical: url },
    openGraph: {
      type: params.type ?? 'website',
      siteName: SITE_NAME,
      url,
      title: params.title,
      description: params.description,
      locale: 'en_US',
      images,
      ...(params.publishedTime ? { publishedTime: params.publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: images.map(image => image.url),
    },
  };
}

/**
 * Home. The copy is fixed by an approved decision — now two of them.
 *
 * `014` put `${WARRANTY}` in this title deliberately, as the differentiator the
 * SERP was missing. The Screaming Frog audit (T035) then proposed
 * `Used & New Tires in Miami & Orlando | MrGoma Tires`, which adds Orlando —
 * where two of the seven stores are, and where the audit measured a visibility
 * gap — but **drops the warranty** and spends six extra characters on the long
 * brand.
 *
 * `021` takes the intent without the loss: both cities *and* the warranty, at 59
 * of the 60 characters Google shows. Changing this belongs in a spec, not in a
 * refactor.
 */
export function homeMetadata(): Metadata {
  return pageMetadata({
    title: `Used & New Tires Miami & Orlando — ${WARRANTY}${TITLE_SUFFIX}`,
    // The year comes from `SINCE` rather than the literal it used to be. That
    // copy was the one place a founding year lived outside `brandClaims`, so
    // when the owner corrected 2007 to 2006 the site would have kept claiming
    // both — the schema and `/about-us` from the constant, this description from
    // its own hardcoded copy. `brandClaims.test.ts` now fails on a second copy.
    description: `15,000+ like-new used and new tires, every used tire backed by a 30-day warranty. 7 locations in Miami & Orlando. Free shipping. ${SINCE}.`,
    path: '/',
  });
}

/**
 * `/tires` — the full catalogue, optionally narrowed by size and paginated.
 * Takes the route's own `w`/`s`/`d` param names rather than inventing new ones.
 */
export function tiresMetadata(
  params: {
    w?: string;
    s?: string;
    d?: string;
    page?: number;
    /**
     * The `/tires/size/{slug}` landing page this facet belongs to, when we
     * publish one — resolved by the route, because deciding it needs the
     * catalog and these builders stay pure so `metadata.test.ts` can run with no
     * database and no mocks.
     *
     * Absent or `null` means "not a size we stock", and the canonical falls back
     * to `/tires`.
     */
    sizeSlug?: string | null;
  } = {}
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
        `Shop Tires by Size & Brand — Used & New${paged}${TITLE_SUFFIX}`,
        `Shop Tires by Size & Brand${paged}${TITLE_SUFFIX}`
      );

  const head = size
    ? `Shop ${size} tires in Miami and Orlando — like-new used and new, every used tire backed by a 30-day warranty.`
    : 'Search used and new tires by size or brand. Every used tire is ASE-inspected and backed by a 30-day warranty.';

  /**
   * The canonical keeps **only the parameters that describe a page we publish.**
   *
   * It used to keep whichever of `w`, `s` and `d` happened to be present, while
   * the title above only treats a size as distinct when **all three** are. So
   * `/tires?d=20` got the generic `/tires` title and a canonical of its own —
   * the exact combination that manufactures duplicates, and there were 47 of
   * them. It also made the rule look arbitrary from outside: `?condition=new`
   * pointed at `/tires` (it is not in this list) while `?d=20` pointed at itself.
   *
   * Three cases, in order:
   *
   *  - **Partial size** — any subset of `w`/`s`/`d` short of all three, and the
   *    `?w=&s=&d=` empty-value form too, since each is trimmed above. Not a page
   *    we publish, so the parameters are dropped.
   *  - **Complete size we stock** — `/tires/size/{slug}` is the page we publish
   *    for it, one of the 272 already in the sitemap, so the facet consolidates
   *    onto it instead of competing with it. A complete size we do *not* stock
   *    arrives with no `sizeSlug` and falls back to `/tires`: its landing page
   *    404s, and a canonical must never point at one.
   *  - **Pagination** — kept whenever `page > 1`, and never folded into the size
   *    page. Google's own guidance: collapsing page 2 into page 1 hides
   *    everything only page 2 links to.
   */
  const publishedSize = size && params.sizeSlug ? params.sizeSlug : null;

  let path: string;
  if (publishedSize && page === 1) {
    path = `/tires/size/${publishedSize}`;
  } else {
    const query = new URLSearchParams();
    if (publishedSize) {
      query.set('w', w);
      query.set('s', s);
      query.set('d', d);
    }
    if (page > 1) query.set('page', String(page));
    path = query.toString() ? `/tires?${query.toString()}` : '/tires';
  }

  return pageMetadata({
    title,
    description: fitDescription(head, [
      `${SHIPPING} and installation at our 7 locations.`,
      `${SHIPPING}. 7 locations.`,
      'Free shipping.',
    ]),
    path,
  });
}

/* ── Section pages that used to hand-roll their own metadata ──────────────────
 *
 * Each of these declared a plain `title` string ending in the brand, so the root
 * `%s | MrGoma Tires` template printed it a second time, and none declared
 * `openGraph`, so they inherited the root's — which names the **home page** as
 * their `og:url`. Routing them through `pageMetadata` fixes both at once.
 * ─────────────────────────────────────────────────────────────────────────── */

/** `/services` — the hub for the eight service pages. */
export function servicesMetadata(): Metadata {
  return pageMetadata({
    title: `Auto Services in Miami & Orlando${TITLE_SUFFIX}`,
    description: fitDescription(
      `Tire mounting, alignment, oil changes, brakes and TPMS at ${LOCATIONS_LABEL_LONG}.`,
      [
        'ASE-certified technicians, no appointment needed.',
        'ASE-certified technicians. No appointment needed.',
        'ASE-certified technicians.',
      ]
    ),
    path: '/services',
  });
}

/**
 * One service page.
 *
 * `metaTitle` arrives without the brand — see `servicesConfig` — so the suffix is
 * added here, once. It is **not** run through `fitTitle`: with a single candidate
 * that helper hard-truncates, and truncating this particular title is how you
 * lose `Hunter HawkEye Elite®`, the one claim on the alignment page a competitor
 * cannot copy. An over-long title fails `metadata.test.ts` loudly instead.
 */
export function serviceMetadata(params: {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}): Metadata {
  return pageMetadata({
    title: `${params.metaTitle}${TITLE_SUFFIX}`,
    description: params.metaDescription,
    path: `/services/${params.slug}`,
  });
}

/**
 * `/about-us`.
 *
 * **No `TITLE_SUFFIX` here, deliberately.** "About MrGoma Tires" already carries
 * the brand, so appending the suffix would print it twice — the very defect this
 * feature exists to remove, reintroduced by habit. `metadata.test.ts` counts
 * brand occurrences per title and catches it.
 */
export function aboutMetadata(): Metadata {
  return pageMetadata({
    title: `About ${SITE_NAME} — 7 Locations in Miami & Orlando`,
    description: fitDescription(
      `ASE-certified technicians, a ${WARRANTY.toLowerCase()} on every used tire, and ${LOCATIONS_LABEL_LONG}.`,
      [
        `Family-owned and off-lease return specialists since ${FOUNDED_YEAR}, with ${SHIPPING.toLowerCase()}.`,
        `Family-owned off-lease return specialists since ${FOUNDED_YEAR}.`,
        `Family-owned since ${FOUNDED_YEAR}.`,
      ]
    ),
    path: '/about-us',
  });
}

/** `/contact`. */
export function contactMetadata(): Metadata {
  return pageMetadata({
    title: `Contact Us — 7 Locations in Miami & Orlando${TITLE_SUFFIX}`,
    description: fitDescription(`Reach ${SITE_NAME} at any of our ${LOCATIONS_LABEL_LONG}.`, [
      `Call, WhatsApp or walk in — ASE-certified technicians and a ${WARRANTY.toLowerCase()} on used tires.`,
      `Call, WhatsApp or walk in. ASE-certified technicians, ${WARRANTY.toLowerCase()}.`,
      `Call, WhatsApp or walk in. ${WARRANTY}.`,
    ]),
    path: '/contact',
  });
}

/** `/guides` — the hub for the seven guides. */
export function guidesMetadata(): Metadata {
  return pageMetadata({
    title: `Tire Guides: Buying, Safety & Maintenance${TITLE_SUFFIX}`,
    description: fitDescription(
      'How to buy used tires safely, read a tire size, and keep them lasting —',
      [
        'straight answers from the ASE-certified technicians who inspect them.',
        'answers from the ASE-certified technicians who inspect them.',
        'from ASE-certified technicians.',
      ]
    ),
    path: '/guides',
  });
}

/**
 * One guide.
 *
 * **`type: 'article'` and `publishedTime` are passed through on purpose.** These
 * pages already declared both, and `pageMetadata` defaults to `'website'`;
 * migrating them without this would quietly demote seven articles to generic
 * pages and drop their publication dates. Nothing in the rendered page would
 * show it — only a social debugger would.
 */
export function guideMetadata(params: {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  publishedTime?: string;
}): Metadata {
  return pageMetadata({
    title: `${params.metaTitle}${TITLE_SUFFIX}`,
    description: params.metaDescription,
    path: `/guides/${params.slug}`,
    type: 'article',
    publishedTime: params.publishedTime,
  });
}

/** `/legal-policies`. Its title used to print the brand twice. */
export function legalPoliciesMetadata(): Metadata {
  return pageMetadata({
    title: `Website Legal Policies${TITLE_SUFFIX}`,
    description: fitDescription(
      'Terms & Conditions, Privacy Policy, Refund & Warranty Policy, Disclaimer and',
      [
        `Accessibility Statement for ${SITE_NAME}, plus how to reach us.`,
        `Accessibility Statement for ${SITE_NAME}.`,
      ]
    ),
    path: '/legal-policies',
  });
}

/**
 * `/checkout` — **stays `noindex`, and stays disallowed in `robots.txt`.**
 *
 * It only gains a canonical of its own. Until now it fell back to the root's,
 * telling Google the checkout is a duplicate of the home page — harmless on a
 * page Google is told to ignore, but wrong, and one line to correct.
 */
export function checkoutMetadata(): Metadata {
  return {
    ...pageMetadata({
      title: `Checkout${TITLE_SUFFIX}`,
      description: `Secure checkout at ${SITE_NAME}. ${SHIPPING} nationwide on every order.`,
      path: '/checkout',
    }),
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

/**
 * `/instant-quote` — and this one **becomes indexable**.
 *
 * Commit `b754578` ("SEO phase 1") marked it `noindex` alongside `/dashboard`,
 * treating it as a funnel step. The sitemap kept publishing it anyway, so the
 * site asked Google to index a URL that then told it not to — reported as
 * "Submitted URL marked 'noindex'". The owner resolved the contradiction the
 * other way on 2026-08-18: it captures leads and has its own intent, so it is a
 * real landing page. It gains a footer link in the same change, because nothing
 * linked to it and a page only Google can find will not rank.
 */
export function instantQuoteMetadata(): Metadata {
  return pageMetadata({
    title: `Instant Tire Quote — Free, No Obligation${TITLE_SUFFIX}`,
    description: fitDescription(
      'Enter your tire size and vehicle details for a quick quote on used and new tires.',
      [
        `${WARRANTY} on used tires, ${SHIPPING.toLowerCase()} and 7 locations in Miami & Orlando.`,
        `${WARRANTY} on used tires and 7 locations in Miami & Orlando.`,
        `${WARRANTY}. 7 locations.`,
      ]
    ),
    path: '/instant-quote',
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
/**
 * The street a store is on, from its full address.
 *
 * `18200 S Dixie Hwy, Miami, FL 33157` → `S Dixie Hwy`. The house number is
 * dropped because a description says where the shop *is*, not its postal
 * address, and all seven addresses share the "number then street" shape.
 */
export function storeStreet(address: string): string {
  return (address.split(',')[0] || '').replace(/^\d+\s+/, '').trim();
}

/**
 * The neighbourhoods a store's description should name.
 *
 * Two things are dropped, both because of how the sentence reads:
 *
 *  - **The store's own name.** "Cutler Bay serves Cutler Bay" spends characters
 *    saying nothing, in a description with 160 of them.
 *  - **Anything beginning `Near `.** These are orientation hints for a card, not
 *    places served, and *"Serving Allapattah, Midtown Miami and Near Miami
 *    International Airport"* is not English.
 */
export function storeServes(name: string, neighborhoods: readonly string[]): string[] {
  return neighborhoods.filter(area => area !== name && !area.startsWith('Near '));
}

/** `A`, `A and B`, `A, B and C` — an English list, not a comma run. */
function andList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function locationMetadata(params: {
  name: string;
  slug: string;
  city: string;
  serving?: string;
  /**
   * The storefront photo from `locationsConfig`. Every one of the seven already
   * has one, so a store shares as itself rather than as the site's generic card —
   * and "the Hialeah shop" is what people actually send each other.
   */
  image?: string;
  /** Full postal address; the street is derived from it. */
  address?: string;
  /** The store's own areas; filtered by {@link storeServes} before use. */
  neighborhoods?: readonly string[];
}): Metadata {
  const { name, slug, city } = params;
  const street = storeStreet(params.address ?? '');
  const serves = storeServes(name, params.neighborhoods ?? []);

  return pageMetadata({
    /**
     * `used tires near me` is the highest-volume non-brand query the site has —
     * 2.697 impressions — and **no store title contained "used tires"**. They
     * read `{name} Tire Shop — 30-Day Warranty`, which names neither the product
     * people search for nor the state that local queries carry.
     *
     * The audit proposes a second phrasing (`Tires & Auto Service`) for Hialeah
     * and East Orlando, with headings naming "MrGoma Tires Automotive" — a string
     * that appears nowhere in this repository and is presumably those stores'
     * Business Profile names. It may well be right, but putting a possibly-wrong
     * business name on two pages is not something to ship unverified, so all
     * seven share one phrasing and the question is with the owner.
     */
    title: fitTitle(
      `Used & New Tires in ${name}, FL${TITLE_SUFFIX}`,
      `Used & New Tires in ${name}${TITLE_SUFFIX}`,
      `Tires in ${name}, FL${TITLE_SUFFIX}`
    ),
    image: params.image ? { url: params.image, alt: `MrGoma Tires — ${name}` } : undefined,
    /**
     * **This is the defect the whole feature exists for.** All seven read from
     * one template, differing only by store name and city — so the sentence
     * Google showed for Cutler Bay was the sentence it showed for Hialeah, and a
     * search result gave no reason to pick one shop over another. Orlando West
     * Colonial may be missing from the index entirely because of it.
     *
     * Composed instead from facts the config already held and never published:
     * the **street** the shop is on, and the **areas it serves**. Nothing is
     * written per store, so the seven cannot drift back into agreement, and an
     * eighth store gets a description of its own for free.
     */
    description: fitDescription(
      `Used and new tires on ${street}, every used tire with a ${WARRANTY.toLowerCase()}.`,
      [
        `Serving ${andList(serves.slice(0, 3))}. Walk-ins welcome, same-day installation.`,
        `Serving ${andList(serves.slice(0, 3))}. Walk-ins welcome.`,
        `Serving ${andList(serves.slice(0, 2))}. Walk-ins welcome, same-day installation.`,
        `Serving ${andList(serves.slice(0, 2))}. Walk-ins welcome.`,
        `Walk-ins welcome and same-day installation in ${city}.`,
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
    telephone: WHATSAPP_TEL,
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
