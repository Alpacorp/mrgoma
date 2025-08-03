import { NextRequest, NextResponse } from 'next/server';

import { fetchBrands, TireFilters } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse filter parameters
    const conditionParam = searchParams.get('condition');
    const patchedParam = searchParams.get('patched');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minTreadDepth = searchParams.get('minTreadDepth');
    const maxTreadDepth = searchParams.get('maxTreadDepth');
    const minRemainingLife = searchParams.get('minRemainingLife');
    const maxRemainingLife = searchParams.get('maxRemainingLife');

    // Dimensiones del neumático
    const width = searchParams.get('w');
    const sidewall = searchParams.get('s');
    const diameter = searchParams.get('d');

    const filters: TireFilters = {};

    // Apply filters (same logic as in the tire route)
    if (conditionParam) {
      filters.condition = conditionParam.split(',').filter(Boolean);
    }
    if (patchedParam) {
      filters.patched = patchedParam.split(',').filter(Boolean);
    }
    if (minPrice) filters.minPrice = parseInt(minPrice, 10);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);
    if (minTreadDepth) filters.minTreadDepth = parseInt(minTreadDepth, 10);
    if (maxTreadDepth) filters.maxTreadDepth = parseInt(maxTreadDepth, 10);
    if (minRemainingLife) filters.minRemainingLife = parseInt(minRemainingLife, 10);
    if (maxRemainingLife) filters.maxRemainingLife = parseInt(maxRemainingLife, 10);

    // Agregar parámetros de dimensiones
    if (width) filters.width = width;
    if (sidewall) filters.sidewall = sidewall;
    if (diameter) filters.diameter = diameter;

    // We don't include brand filter here because we want to get all available brands
    // for the current filter combination

    const brands = await fetchBrands(filters);
    return NextResponse.json(brands);
  } catch (err: unknown) {
    logger.error('Failed to fetch brands', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
