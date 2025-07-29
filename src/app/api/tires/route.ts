import { NextRequest, NextResponse } from 'next/server';

import { fetchTires, TireFilters } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  console.log('logale, req into route:', req);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const offset = (page - 1) * pageSize;

  const conditionParam = searchParams.get('condition');
  const brandParam = searchParams.get('brand') ?? searchParams.get('brands');
  const patchedParam = searchParams.get('patched');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minTreadDepth = searchParams.get('minTreadDepth');
  const maxTreadDepth = searchParams.get('maxTreadDepth');
  const minRemainingLife = searchParams.get('minRemainingLife');
  const maxRemainingLife = searchParams.get('maxRemainingLife');

  const filters: TireFilters = {};
  if (conditionParam) {
    filters.condition = conditionParam.split(',').filter(Boolean);
  }
  if (patchedParam) {
    filters.patched = patchedParam.split(',').filter(Boolean);
  }
  if (brandParam) {
    filters.brands = brandParam.split(',').filter(Boolean);
  }
  if (minPrice) filters.minPrice = parseInt(minPrice, 10);
  if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);
  if (minTreadDepth) filters.minTreadDepth = parseFloat(minTreadDepth);
  if (maxTreadDepth) filters.maxTreadDepth = parseFloat(maxTreadDepth);
  if (minRemainingLife) filters.minRemainingLife = parseInt(minRemainingLife, 10);
  if (maxRemainingLife) filters.maxRemainingLife = parseInt(maxRemainingLife, 10);

  console.log('logale, page, pageSize, offset into route:', page, pageSize, offset);

  try {
    const result = await fetchTires(offset, pageSize, filters);

    console.log('logale, records into route:', result);

    return NextResponse.json(result);
  } catch (err: unknown) {
    logger.error('Failed to fetch tires', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
