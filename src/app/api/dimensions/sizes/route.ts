import { NextRequest, NextResponse } from 'next/server';

import { fetchTireSizes } from '@/repositories/dimensionsRepository';
import { logger } from '@/utils/logger';

/**
 * API route to get all unique tire sizes (displayed as Diameter in the UI)
 * Can be filtered by height and width if provided in query params
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const height = searchParams.get('height'); // Optional filter by height
    const width = searchParams.get('width'); // Optional filter by width

    console.log('GET /api/dimensions/sizes - Parameters:', { height, width });

    // Convert parameters to numbers if present
    const heightNum = height ? parseFloat(height) : undefined;
    const widthNum = width ? parseFloat(width) : undefined;

    console.log('Parsed parameters:', { heightNum, widthNum });

    const sizes = await fetchTireSizes(heightNum, widthNum);

    console.log(`GET /api/dimensions/sizes - Found ${sizes.length} results`);

    return NextResponse.json(sizes);
  } catch (err: unknown) {
    logger.error('Failed to fetch tire sizes', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
