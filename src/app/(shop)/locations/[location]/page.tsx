import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import LocationDetail from '@/app/(shop)/locations/[location]/container/LocationDetail/LocationDetail';
import { locationsConfig, getLocationBySlug } from '@/app/(shop)/locations/locationsConfig';
import { canonical, buildBreadcrumbJsonLd, buildLocationsJsonLd } from '@/app/utils/seo';

export function generateStaticParams() {
  return locationsConfig.map(l => ({ location: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) return { title: 'Location Not Found', robots: { index: false, follow: false } };

  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: { canonical: canonical(`/locations/${slug}`) },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) notFound();

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' },
    { name: loc.name, url: `/locations/${slug}` },
  ]);

  const [locationSchema] = buildLocationsJsonLd([
    { name: loc.name, address: loc.address, phone: loc.phone, mapLink: loc.mapLink },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }} />
      <LocationDetail location={loc} />
    </>
  );
}
