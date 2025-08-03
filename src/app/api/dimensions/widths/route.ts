import { NextRequest, NextResponse } from 'next/server';

import { fetchTireWidths } from '@/repositories/dimensionsRepository';
import { logger } from '@/utils/logger';

/**
 * API route to get all unique tire widths (displayed as Sidewall in the UI)
 * Can be filtered by height if provided in query params
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const height = searchParams.get('height'); // Optional filter by height

    const widths = await fetchTireWidths(height ? parseInt(height, 10) : undefined);
    return NextResponse.json(widths);
  } catch (err: unknown) {
    logger.error('Failed to fetch tire widths', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
