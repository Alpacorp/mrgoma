import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

import { fetchTireRanges } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

const getCachedRanges = unstable_cache(() => fetchTireRanges(), ['ranges'], {
  revalidate: 300,
  tags: ['ranges'],
});

/**
 * API route to get all unique tire ranges
 */
export async function GET() {
  try {
    const ranges = await getCachedRanges();
    return NextResponse.json(ranges);
  } catch (err: unknown) {
    logger.error('Failed to fetch tire ranges', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
