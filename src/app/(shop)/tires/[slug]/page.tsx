import { cache } from 'react';

import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import DetailView from '@/app/(shop)/detail/container/DetailView/DetailView';
import type { SingleTire } from '@/app/interfaces/tires';
import {
  absUrl,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  canonical,
  productDescription,
  productTitle,
} from '@/app/utils/seo';
import { generateTireDescription } from '@/app/utils/tireDescription';
import { buildTireSlug, extractIdFromSlug } from '@/app/utils/tireSlug';
import { mapTireRecordToSingleTire } from '@/repositories/mapTireRecordToSingleTire';
import { fetchTireById } from '@/repositories/tiresRepository';

// Dynamic (no-store) render so price and sold/stock stay accurate per request.
export const dynamic = 'force-dynamic';

// Wrapped in React cache() so generateMetadata, the JSON-LD and the page render
// share a single DB read per request instead of querying multiple times.
const fetchProduct = cache(async (productId: string): Promise<SingleTire | null> => {
  try {
    const record = await fetchTireById(productId);
    if (!record) return null;
    return mapTireRecordToSingleTire(record);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const productId = extractIdFromSlug(slug);
  const product = await fetchProduct(productId);

  if (!product) {
    return {
      title: 'Tire Not Found',
      description:
        'We could not find the tire you are looking for. Explore our catalog of new and used tires in Miami.',
      robots: { index: false, follow: true },
    };
  }

  const canonicalSlug = buildTireSlug(String(product.id), product.brand, product.size || '');
  const url = canonical(`/tires/${canonicalSlug}`);

  const title = productTitle({
    brand: product.brand,
    model: product.model2,
    size: product.size,
    condition: product.condition,
    price: product.price,
  });

  const descriptionBase = productDescription({
    brand: product.brand,
    model: product.model2,
    size: product.size,
    condition: product.condition,
    patched: product.patched,
    remainingLife: product.remainingLife,
  });

  const priceNumber = Number(product.price);
  const hasValidPrice = typeof priceNumber === 'number' && isFinite(priceNumber) && priceNumber > 0;
  const priceText = hasValidPrice ? ` Price: $${priceNumber.toFixed(2)}.` : '';
  const description = `${descriptionBase}${priceText}`;

  const images = Array.isArray(product.images) ? product.images.map(i => absUrl(i.src)) : [];

  const keywords = [
    product.brand,
    product.model2,
    product.size,
    product.condition ? `${product.condition.toLowerCase()} tire` : null,
    'Miami tires',
    'MrGoma Tires',
    'buy tires online',
    'tire shop Miami',
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'MrGoma Tires',
      url,
      title,
      description,
      images: images.length
        ? images.map(u => ({ url: u }))
        : [{ url: absUrl('/assets/images/og-default.jpg') }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length ? images : [absUrl('/assets/images/og-default.jpg')],
    },
  };
}

async function TireJsonLd({ productId }: { productId: string }) {
  const product = await fetchProduct(productId);
  if (!product) return null;

  const canonicalSlug = buildTireSlug(String(product.id), product.brand, product.size || '');
  const url = canonical(`/tires/${canonicalSlug}`);
  const breadcrumbLabel =
    `${product.condition} ${product.brand}${product.size ? ` ${product.size}` : ''}`.trim();

  const jsonLdDescription = generateTireDescription({
    brand: product.brand,
    model: product.model2,
    size: product.size,
    condition: product.condition,
    remainingLife: product.remainingLife,
    treadDepth: product.treadDepth,
    patched: product.patched,
    loadIndex: product.loadIndex,
    speedIndex: product.speedIndex,
  });

  const productJsonLd = buildProductJsonLd({
    url,
    name: product.name,
    brand: product.brand,
    description: jsonLdDescription,
    images: (product.images || []).map(i => i.src),
    price: product.price,
    currency: 'USD',
    condition: product.condition,
    availability: 'InStock',
    sku: String(product.id),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Tires', url: '/tires' },
    { name: breadcrumbLabel, url: `/tires/${canonicalSlug}` },
  ]);

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
    </>
  );
}

export default async function TirePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productId = extractIdFromSlug(slug);

  if (!productId) notFound();

  const product = await fetchProduct(productId);
  if (!product) notFound();

  return (
    <>
      <TireJsonLd productId={productId} />
      <DetailView product={product} />
    </>
  );
}
