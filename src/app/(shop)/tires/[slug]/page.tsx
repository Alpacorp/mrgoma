import { cache } from 'react';

import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import DetailView from '@/app/(shop)/detail/container/DetailView/DetailView';
import type { SingleTire } from '@/app/interfaces/tires';
import { JsonLd } from '@/app/ui/components';
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  canonical,
  productMetadata,
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

  /**
   * Every field is handed to one pure builder rather than assembled here.
   *
   * This block used to compose the whole `Metadata` object inline, which is why
   * nothing tested it — and why it was the last route still returning a plain
   * `title` string, so the root `%s | MrGoma Tires` template printed the brand a
   * second time on all 1.622 pages.
   */
  return productMetadata({
    brand: product.brand,
    model: product.model2,
    size: product.size,
    condition: product.condition,
    patched: product.patched,
    remainingLife: product.remainingLife,
    price: product.price,
    city: product.city,
    path: `/tires/${canonicalSlug}`,
    images: Array.isArray(product.images) ? product.images.map(image => image.src) : [],
  });
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
    city: product.city,
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
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
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
