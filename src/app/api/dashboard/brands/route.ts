import { NextRequest, NextResponse } from 'next/server';

import { buildTireFilters } from '@/app/utils/filterUtils';
import { fetchDashboardBrands } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters = buildTireFilters(searchParams);

  try {
    const brands = await fetchDashboardBrands(filters);
    return NextResponse.json(brands);
  } catch (err: unknown) {
    logger.error('Failed to fetch dashboard brands', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
