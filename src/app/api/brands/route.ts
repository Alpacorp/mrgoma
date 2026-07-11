import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { jsonError } from '@/app/api/_lib/apiError';
import { withLogging } from '@/app/api/_lib/withLogging';
import { buildBrandFilters } from '@/app/utils/filterUtils';
import { TireFilters, fetchBrands } from '@/repositories/tiresRepository';

const getCachedBrands = unstable_cache(
  (filters: TireFilters) => fetchBrands(filters),
  ['brands'],
  { revalidate: 300, tags: ['brands'] }
);

export const GET = withLogging('brands.GET', async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const filters = buildBrandFilters(searchParams);
    const brands = await getCachedBrands(filters);
    return NextResponse.json(brands);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch brands', err);
  }
});
