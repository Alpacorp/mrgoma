import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';
import { fetchTires } from '@/repositories/tiresRepository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const offset = (page - 1) * pageSize;

  try {
    const records = await fetchTires(offset, pageSize);
    return NextResponse.json(records);
  } catch (err: any) {
    logger.error('Failed to fetch tires', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
