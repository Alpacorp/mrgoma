import { NextResponse } from 'next/server';

import { fetchTireRanges } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    const ranges = await fetchTireRanges();
    return NextResponse.json(ranges);
  } catch (err: unknown) {
    logger.error('Failed to fetch tire ranges', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
