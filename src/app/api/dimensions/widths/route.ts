import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { jsonError } from '@/app/api/_lib/apiError';
import { withLogging } from '@/app/api/_lib/withLogging';
import { fetchTireWidths } from '@/repositories/dimensionsRepository';

// Coerce an optional numeric query param: non-numeric/garbage → undefined
// (ignored filter), never NaN passed to the query.
const optionalNumber = z.coerce.number().positive().optional().catch(undefined);

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
    const height = optionalNumber.parse(searchParams.get('height') ?? undefined);

    const widths = await getCachedWidths(height);
    return NextResponse.json(widths);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch tire widths', err);
  }
});
