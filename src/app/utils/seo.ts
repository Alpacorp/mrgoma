import type { Metadata } from 'next';

export const SITE_NAME = 'MrGoma Tires';
export const DEFAULT_DESCRIPTION =
  'Buy new and used tires in Miami, Florida. Fast installation, multiple locations, and online ordering at MrGoma Tires.';
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
      default: `${SITE_NAME} | Miami, FL` as any,
      template: `%s | ${SITE_NAME}` as any,
    },
    description: DEFAULT_DESCRIPTION,
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [{ url: '/favicon.png', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      url: site,
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Miami, FL`,
      description: DEFAULT_DESCRIPTION,
      locale: 'en_US',
      images: [
        {
          url: absUrl('/assets/images/og-default.jpg'),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} – Tires in Miami`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} | Miami, FL`,
      description: DEFAULT_DESCRIPTION,
      images: [absUrl('/assets/images/og-default.jpg')],
    },
    alternates: {
      canonical: site,
    },
    category: 'Automotive',
  };
}

export function productTitle(params: {
  brand?: string;
  model?: string;
  size?: string;
  condition?: string; // New | Used
}): string {
  const parts: string[] = [];
  if (params.brand) parts.push(params.brand);
  if (params.model) parts.push(params.model);
  if (params.size) parts.push(params.size);
  const label = parts.join(' ');
  const condition = params.condition ? `${params.condition} ` : '';
  return `${condition}Tire | ${label} in Miami`;
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
}): Record<string, any> {
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

export function organizationJsonLd() {
  const site = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: site,
    logo: absUrl('/favicon.png'),
    sameAs: [
      // Add social profiles when available
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Miami',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
  };
}

export function websiteJsonLd() {
  const site = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: site,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${site}/search-results?w={w}&s={s}&d={d}`,
      'query-input': 'required name=w,required name=s,required name=d',
    },
  };
}
