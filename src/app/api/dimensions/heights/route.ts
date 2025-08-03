import { NextResponse } from 'next/server';

import { fetchTireHeights } from '@/repositories/dimensionsRepository';
import { logger } from '@/utils/logger';

/**
 * API route to get all unique tire heights (displayed as Width in the UI)
 */
export async function GET() {
  try {
    const heights = await fetchTireHeights();
    return NextResponse.json(heights);
  } catch (err: unknown) {
    logger.error('Failed to fetch tire heights', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
