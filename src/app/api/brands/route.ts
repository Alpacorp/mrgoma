import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { buildBrandFilters } from '@/app/utils/filterUtils';
import { TireFilters, fetchBrands } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

const getCachedBrands = unstable_cache(
  (filters: TireFilters) => fetchBrands(filters),
  ['brands'],
  { revalidate: 300, tags: ['brands'] }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = buildBrandFilters(searchParams);
    const brands = await getCachedBrands(filters);
    return NextResponse.json(brands);
  } catch (err: unknown) {
    logger.error('Failed to fetch brands', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
