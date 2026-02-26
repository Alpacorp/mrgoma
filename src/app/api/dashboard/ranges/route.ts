import { NextResponse } from 'next/server';

import { fetchDashboardRanges } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    const ranges = await fetchDashboardRanges();
    return NextResponse.json(ranges);
  } catch (err: unknown) {
    logger.error('Failed to fetch dashboard ranges', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
