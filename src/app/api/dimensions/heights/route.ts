import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

import { jsonError } from '@/app/api/_lib/apiError';
import { withLogging } from '@/app/api/_lib/withLogging';
import { fetchTireHeights } from '@/repositories/dimensionsRepository';

const getCachedHeights = unstable_cache(() => fetchTireHeights(), ['dimensions-heights'], {
  revalidate: 3600,
  tags: ['dimensions'],
});

/**
 * API route to get all unique tire heights (displayed as Width in the UI)
 */
export const GET = withLogging('dimensions.heights.GET', async () => {
  try {
    const heights = await getCachedHeights();
    return NextResponse.json(heights);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch tire heights', err);
  }
});
