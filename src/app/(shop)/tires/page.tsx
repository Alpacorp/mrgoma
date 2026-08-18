import { Suspense } from 'react';

import type { Metadata } from 'next';

import SearchResults from '@/app/(shop)/tires/container/SearchResults';
import { fetchTiresServer } from '@/app/(shop)/tires/utils/fetchTiresServer';
import { sizePageSlug } from '@/app/(shop)/tires/utils/sizeCatalog';
import { LoadingScreen } from '@/app/ui/components';
import { tiresMetadata } from '@/app/utils/seo';
import { fetchBrands } from '@/repositories/tiresRepository';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ w?: string; s?: string; d?: string; page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;

  /**
   * Only a *complete* size can consolidate onto a `/tires/size/{slug}` landing
   * page, so the catalog is only consulted when all three parameters are there —
   * plain `/tires` and every partial facet cost no extra query.
   *
   * The `.catch` is load-bearing. `/tires` survives a database outage today:
   * `fetchTiresServer` catches and renders an empty catalog, `fetchBrands()` has
   * its own `.catch` below, and `tiresMetadata` is pure. This would otherwise be
   * the route's only unguarded database call, and a throw inside
   * `generateMetadata` takes the whole page down rather than just its metadata.
   * Caught, it yields `null` — the same answer an unstocked size gives — and the
   * canonical falls back to `/tires`, which is correct rather than merely safe.
   */
  const sizeSlug =
    sp?.w && sp?.s && sp?.d ? await sizePageSlug(sp.w, sp.s, sp.d).catch(() => null) : null;

  return tiresMetadata({
    w: sp?.w,
    s: sp?.s,
    d: sp?.d,
    page: parseInt(sp?.page || '1', 10) || 1,
    sizeSlug,
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
