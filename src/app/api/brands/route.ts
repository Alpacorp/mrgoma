import { NextRequest, NextResponse } from 'next/server';

import { buildBrandFilters } from '@/app/utils/filterUtils';
import { fetchBrands } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

/**
 * API route to get all available brands based on current filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Build filters from search parameters (excluding brand filter itself)
    const filters = buildBrandFilters(searchParams);

    // Fetch brands using the filters
    const brands = await fetchBrands(filters);
    return NextResponse.json(brands);
  } catch (err: unknown) {
    logger.error('Failed to fetch brands', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
