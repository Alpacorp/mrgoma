import { Suspense } from 'react';

import type { Metadata } from 'next';

import SearchResults from '@/app/(shop)/tires/container/SearchResults';
import { fetchTiresServer } from '@/app/(shop)/tires/utils/fetchTiresServer';
import { LoadingScreen } from '@/app/ui/components';
import { tiresMetadata } from '@/app/utils/seo';
import { fetchBrands } from '@/repositories/tiresRepository';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ w?: string; s?: string; d?: string; page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return tiresMetadata({
    w: sp?.w,
    s: sp?.s,
    d: sp?.d,
    page: parseInt(sp?.page || '1', 10) || 1,
  });
}

export default async function TiresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [initialData, brands] = await Promise.all([
    fetchTiresServer(sp),
    fetchBrands().catch(() => [] as string[]),
  ]);

  return (
    <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
      <SearchResults initialData={initialData} brands={brands} />
    </Suspense>
  );
}
