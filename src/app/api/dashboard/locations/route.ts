import { NextRequest, NextResponse } from 'next/server';

import { withLogging } from '@/app/api/_lib/withLogging';
import { auth } from '@/app/utils/authOptions';
import { fetchDashboardLocations } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

/**
 * The shelf codes available in the given stores.
 *
 * Scoped by design: unscoped there are 675 codes, and a code means nothing
 * without its store, so `?stores=` is required rather than optional. Absent, the
 * answer is an empty list — not every code we have.
 */
export const GET = withLogging('dashboard.locations.GET', async (req: NextRequest) => {
  const session = await auth();

  if (!session) {
    logger.warn('Unauthorized access');
    return NextResponse.json({ message: 'Unauthorized user. Please log in.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stores = (searchParams.get('stores') ?? '').split(',').filter(Boolean);

  try {
    const locations = await fetchDashboardLocations(stores);
    return NextResponse.json(locations);
  } catch (err: unknown) {
    logger.error('Failed to fetch dashboard locations', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
});
