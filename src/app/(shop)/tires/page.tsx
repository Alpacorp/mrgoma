import { Suspense } from 'react';

import type { Metadata } from 'next';

import SearchResults from '@/app/(shop)/search-results/container/search-results/search-results';
import { fetchTiresServer } from '@/app/(shop)/search-results/utils/fetchTiresServer';
import { LoadingScreen } from '@/app/ui/components';
import { canonical } from '@/app/utils/seo';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ w?: string; s?: string; d?: string; page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const w = (sp?.w || '').trim();
  const s = (sp?.s || '').trim();
  const d = (sp?.d || '').trim();
  const page = parseInt(sp?.page || '1', 10) || 1;

  const hasSize = w && s && d;
  const sizeLabel = hasSize ? `${w}/${s}/${d}` : '';

  const baseTitle = hasSize
    ? `Used & New Tires in Miami – Size ${sizeLabel}`
    : 'Used & New Tires in Miami';
  const title = page > 1 ? `${baseTitle} – Page ${page}` : baseTitle;

  const descBase = hasSize
    ? `Browse ${sizeLabel} tires available in Miami, Florida. Find quality used and new tires with online ordering and multiple installation locations.`
    : 'Browse our selection of used and new tires available in Miami, Florida. Buy online and install at our locations.';

  const params = new URLSearchParams();
  if (w) params.set('w', w);
  if (s) params.set('s', s);
  if (d) params.set('d', d);
  if (page > 1) params.set('page', String(page));
  const canonPath = params.toString() ? `/tires?${params.toString()}` : '/tires';

  return {
    title,
    description: descBase,
    alternates: { canonical: canonical(canonPath) },
    openGraph: {
      type: 'website',
      siteName: 'MrGoma Tires',
      url: canonical(canonPath),
      title,
      description: descBase,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: descBase,
    },
  };
}

export default async function TiresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialData = await fetchTiresServer(sp);

  return (
    <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
      <SearchResults initialData={initialData} />
    </Suspense>
  );
}
