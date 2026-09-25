import { NextResponse } from 'next/server';

import { jsonError } from '@/app/api/_lib/apiError';
import { withLogging } from '@/app/api/_lib/withLogging';
import { getCachedTireRanges } from '@/repositories/cachedCatalog';

/**
 * API route to get all unique tire ranges
 */
export const GET = withLogging('ranges.GET', async () => {
  try {
    const ranges = await getCachedTireRanges();
    return NextResponse.json(ranges);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch tire ranges', err);
  }
});
