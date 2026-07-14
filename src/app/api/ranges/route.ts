import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

import { jsonError } from '@/app/api/_lib/apiError';
import { withLogging } from '@/app/api/_lib/withLogging';
import { fetchTireRanges } from '@/repositories/tiresRepository';

const getCachedRanges = unstable_cache(() => fetchTireRanges(), ['ranges'], {
  revalidate: 300,
  tags: ['ranges'],
});

/**
 * API route to get all unique tire ranges
 */
export const GET = withLogging('ranges.GET', async () => {
  try {
    const ranges = await getCachedRanges();
    return NextResponse.json(ranges);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch tire ranges', err);
  }
});
