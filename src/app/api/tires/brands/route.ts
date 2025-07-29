import { NextResponse } from 'next/server';

import { fetchBrands } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    const brands = await fetchBrands();
    return NextResponse.json(brands);
  } catch (err: unknown) {
    logger.error('Failed to fetch brands', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
