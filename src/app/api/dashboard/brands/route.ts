import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/utils/authOptions';
import { buildTireFilters } from '@/app/utils/filterUtils';
import { fetchDashboardBrands } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    logger.warn('Unauthorized access');
    return NextResponse.json({ message: 'Unauthorized user. Please log in.' }, { status: 401 });
  }

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
