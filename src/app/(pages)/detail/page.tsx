import type { Metadata } from 'next';
import { Suspense } from 'react';

import Detail from '@/app/(pages)/detail/container/Detail/Detail';
import { LoadingScreen } from '@/app/ui/components';
import {
  absUrl,
  buildProductJsonLd,
  canonical,
  productDescription,
  productTitle,
} from '@/app/utils/seo';
import { fetchTireById } from '@/repositories/tiresRepository';

async function fetchProduct(productId?: string) {
  if (!productId) return null;
  try {
    // Fetch directly from the database to avoid issues with relative fetch in server metadata
    const record = await fetchTireById(productId);
    if (!record) return null;

    // Build images array from available image URLs
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

    // Map DB record to the SingleTire-like shape expected by SEO helpers
    const singleTire = {
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
      images,
      description: (record.Description as string) || undefined,
      model2: (record.Model2 as string) || undefined,
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

    return singleTire;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}): Promise<Metadata> {
  const { productId: id } = await searchParams;

  if (!id) {
    return {
      title: 'Tire Details',
      description:
        'View tire details and specifications. Buy used and new tires in Miami with online ordering and installation.',
      alternates: { canonical: canonical('/detail') },
    };
  }

  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: 'Tire Not Found',
      description:
        'We could not find the tire you are looking for. Explore our catalog of new and used tires in Miami.',
      alternates: { canonical: canonical(`/detail?productId=${encodeURIComponent(id)}`) },
      robots: { index: false, follow: true },
    };
  }

  const title = productTitle({
    brand: product?.brand,
    model: product?.model2,
    size: product?.name?.match(/\|(.*?)\|/) ? undefined : product?.name,
    condition: product?.condition,
  });

  const descriptionBase = productDescription({
    brand: product?.brand,
    model: product?.model2,
    size: product?.name?.match(/\|(.*?)\|/) ? undefined : product?.name,
    condition: product?.condition,
    patched: product?.patched,
    remainingLife: product?.remainingLife,
  });

  // Append price to description when available (USD formatted)
  const priceNumber =
    typeof product?.price === 'string' ? Number(product.price) : (product?.price as any);
  const hasValidPrice = typeof priceNumber === 'number' && isFinite(priceNumber) && priceNumber > 0;
  const priceText = hasValidPrice ? ` Price: $${priceNumber.toFixed(2)}.` : '';
  const description = `${descriptionBase}${priceText}`;

  const url = canonical(`/detail?productId=${encodeURIComponent(id)}`);
  const images = Array.isArray(product?.images)
    ? product?.images.map((i: any) => absUrl(i.src))
    : [];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
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

async function ProductJsonLd({ productId }: { productId?: string }) {
  const product = await fetchProduct(productId);
  if (!product) return null;
  const url = canonical(`/detail?productId=${encodeURIComponent(productId || '')}`);
  const jsonLd = buildProductJsonLd({
    url,
    name: product.name,
    brand: product.brand,
    description: product.description,
    images: (product.images || []).map((i: any) => i.src),
    price: product.price,
    currency: 'USD',
    condition: product.condition,
    availability: 'InStock',
    sku: product.id,
  });
  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
}

export default async function DetailPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const { productId: id } = await searchParams;
  return (
    <>
      <ProductJsonLd productId={id} />
      <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
        <Detail />
      </Suspense>
    </>
  );
}
