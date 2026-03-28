import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import Detail from '@/app/(shop)/detail/container/Detail/Detail';
import { LoadingScreen } from '@/app/ui/components';
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
import { fetchTireById } from '@/repositories/tiresRepository';

async function fetchProduct(productId: string) {
  try {
    const record = await fetchTireById(productId);
    if (!record) return null;

    const images = [record.Image1, record.Image2, record.Image3, record.Image4]
      .filter(Boolean)
      .map((src, idx) => ({
        id: idx + 1,
        name: `Image ${idx + 1}`,
        src: src as string,
        alt: `${record.Brand || 'Brand'} ${record.Model2 || ''} ${record.RealSize || ''}`.trim(),
      }));

    if (images.length === 0) {
      images.push({
        id: 1,
        name: 'Image 1',
        src: '/assets/images/generic-tire-image.webp',
        alt: `${record.Brand || 'Brand'} ${record.Model2 || ''} ${record.RealSize || ''}`.trim(),
      });
    }

    return {
      id: String(record.TireId ?? ''),
      status: record.Condition,
      name: `(${record.Code || ''}) | ${record.Brand || 'Unknown'} | ${record.RealSize || ''}`.trim(),
      color: 'Black',
      dot: record.DOT || 'N/A',
      price: record.Price?.toString() || '-',
      brand: record.Brand || 'Unknown',
      brandId: record.BrandId || 1,
      condition: record.ProductTypeId === 1 ? 'New' : 'Used',
      patched: record.Patched === '0' ? 'No' : 'Yes',
      remainingLife: (record.RemainingLife as string) || '-',
      treadDepth: (record.Tread as string) || '-',
      size: record.RealSize || undefined,
      loadIndex: (record.loadIndex as string) || undefined,
      speedIndex: record.speedIndex || undefined,
      model2: (record.Model2 as string) || undefined,
      images,
      details: [
        {
          name: 'More Details',
          items: [
            `Load Index: ${(record.loadIndex as string) || '-'}`,
            `DOT: ${record.DOT || ''}`,
            `Speed Index: ${record.speedIndex || ''}`,
          ],
        },
      ],
    } as any;
  } catch {
    return null;
  }
}

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

  const canonicalSlug = buildTireSlug(product.id, product.brand, product.size || '');
  const url = canonical(`/tires/${canonicalSlug}`);

  const title = productTitle({
    brand: product.brand,
    model: product.model2,
    size: product.size,
    condition: product.condition,
  });

  const descriptionBase = productDescription({
    brand: product.brand,
    model: product.model2,
    size: product.size,
    condition: product.condition,
    patched: product.patched,
    remainingLife: product.remainingLife,
  });

  const priceNumber =
    typeof product.price === 'string' ? Number(product.price) : (product.price as any);
  const hasValidPrice = typeof priceNumber === 'number' && isFinite(priceNumber) && priceNumber > 0;
  const priceText = hasValidPrice ? ` Price: $${priceNumber.toFixed(2)}.` : '';
  const description = `${descriptionBase}${priceText}`;

  const images = Array.isArray(product.images) ? product.images.map((i: any) => absUrl(i.src)) : [];

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
        ? images.map((u: any) => ({ url: u }))
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

async function TireJsonLd({ productId, slug }: { productId: string; slug: string }) {
  const product = await fetchProduct(productId);
  if (!product) return null;

  const canonicalSlug = buildTireSlug(product.id, product.brand, product.size || '');
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
    images: (product.images || []).map((i: any) => i.src),
    price: product.price,
    currency: 'USD',
    condition: product.condition,
    availability: 'InStock',
    sku: product.id,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Tires', url: '/search-results' },
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

  return (
    <>
      <TireJsonLd productId={productId} slug={slug} />
      <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
        <Detail productId={productId} />
      </Suspense>
    </>
  );
}
