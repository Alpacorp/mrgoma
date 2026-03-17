import { NextResponse } from 'next/server';

import { auth } from '@/app/utils/authOptions';
import { fetchDashboardRanges } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET() {
  const session = await auth();

  if (!session) {
    logger.warn('Unauthorized access');
    return NextResponse.json({ message: 'Unauthorized user. Please log in.' }, { status: 401 });
  }

  try {
    const ranges = await fetchDashboardRanges();
    return NextResponse.json(ranges);
  } catch (err: unknown) {
    logger.error('Failed to fetch dashboard ranges', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
