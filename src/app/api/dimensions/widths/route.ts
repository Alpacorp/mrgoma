import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { withLogging } from '@/app/api/_lib/withLogging';
import { fetchTireWidths } from '@/repositories/dimensionsRepository';
import { logger } from '@/utils/logger';

const getCachedWidths = unstable_cache(
  (height?: number) => fetchTireWidths(height),
  ['dimensions-widths'],
  { revalidate: 3600, tags: ['dimensions'] }
);

/**
 * API route to get all unique tire widths (displayed as Sidewall in the UI)
 * Can be filtered by height if provided in query params
 */
export const GET = withLogging('dimensions.widths.GET', async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const height = searchParams.get('height'); // Optional filter by height

    const widths = await getCachedWidths(height ? parseInt(height, 10) : undefined);
    return NextResponse.json(widths);
  } catch (err: unknown) {
    logger.error('Failed to fetch tire widths', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
});
