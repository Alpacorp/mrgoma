import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { jsonError } from '@/app/api/_lib/apiError';
import { withLogging } from '@/app/api/_lib/withLogging';
import { fetchTireSizes } from '@/repositories/dimensionsRepository';

// Coerce an optional numeric query param: non-numeric/garbage → undefined
// (ignored filter), never NaN passed to the query.
const optionalNumber = z.coerce.number().positive().optional().catch(undefined);

const getCachedSizes = unstable_cache(
  (height?: number, width?: number) => fetchTireSizes(height, width),
  ['dimensions-sizes'],
  { revalidate: 3600, tags: ['dimensions'] }
);

/**
 * API route to get all unique tire sizes (displayed as Diameter in the UI)
 * Can be filtered by height and width if provided in query params
 */
export const GET = withLogging('dimensions.sizes.GET', async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const heightNum = optionalNumber.parse(searchParams.get('height') ?? undefined);
    const widthNum = optionalNumber.parse(searchParams.get('width') ?? undefined);

    const sizes = await getCachedSizes(heightNum, widthNum);

    return NextResponse.json(sizes);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch tire sizes', err);
  }
});
