import { NextRequest, NextResponse } from 'next/server';

import { jsonError } from '@/app/api/_lib/apiError';
// One cached accessor, shared with the assistant, which needs the same list to
// tell "we don't carry that brand" from "we have none right now".
import { getCachedBrands } from '@/app/api/_lib/brandCatalogue';
import { withLogging } from '@/app/api/_lib/withLogging';
import { buildBrandFilters } from '@/app/utils/filterUtils';

export const GET = withLogging('brands.GET', async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const filters = buildBrandFilters(searchParams);
    const brands = await getCachedBrands(filters);
    return NextResponse.json(brands);
  } catch (err: unknown) {
    return jsonError(500, 'Failed to fetch brands', err);
  }
});
