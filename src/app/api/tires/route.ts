import { NextRequest, NextResponse } from 'next/server';

import { fetchTires } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  console.log('logale, req into route:', req);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const offset = (page - 1) * pageSize;

  console.log('logale, page, pageSize, offset into route:', page, pageSize, offset);

  try {
    const records = await fetchTires(offset, pageSize);

    console.log('logale, records into route:', records);

    return NextResponse.json(records);
  } catch (err: unknown) {
    logger.error('Failed to fetch tires', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
