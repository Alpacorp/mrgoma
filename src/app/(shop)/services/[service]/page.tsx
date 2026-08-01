import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import ServiceDetail from '@/app/(shop)/services/[service]/container/ServiceDetail/ServiceDetail';
import { servicesConfig, getServiceBySlug } from '@/app/(shop)/services/servicesConfig';
import { JsonLd } from '@/app/ui/components';
import { canonical, buildBreadcrumbJsonLd } from '@/app/utils/seo';

export function generateStaticParams() {
  return servicesConfig.map(s => ({ service: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: 'Service Not Found', robots: { index: false, follow: false } };

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: canonical(`/services/${slug}`) },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.title, url: `/services/${slug}` },
  ]);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.longDescription,
    provider: {
      '@type': 'AutoRepair',
      name: 'MrGoma Tires',
      url: 'https://www.mrgomatires.com',
    },
    areaServed: [
      { '@type': 'City', name: 'Miami', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'City', name: 'Orlando', containedInPlace: { '@type': 'State', name: 'Florida' } },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />
      <ServiceDetail service={service} />
    </>
  );
}
