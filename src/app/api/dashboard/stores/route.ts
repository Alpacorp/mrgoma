import { NextResponse } from 'next/server';

import { withLogging } from '@/app/api/_lib/withLogging';
import { auth } from '@/app/utils/authOptions';
import { fetchDashboardStores } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export const GET = withLogging('dashboard.stores.GET', async () => {
  const session = await auth();

  if (!session) {
    logger.warn('Unauthorized access');
    return NextResponse.json({ message: 'Unauthorized user. Please log in.' }, { status: 401 });
  }

  try {
    const stores = await fetchDashboardStores();
    return NextResponse.json(stores);
  } catch (err: unknown) {
    logger.error('Failed to fetch dashboard stores', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
});
