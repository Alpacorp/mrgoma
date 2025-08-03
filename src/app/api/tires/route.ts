import { NextRequest, NextResponse } from 'next/server';

import { fetchTires, TireFilters } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const offset = (page - 1) * pageSize;

  // Filtros estándar
  const conditionParam = searchParams.get('condition');
  const patchedParam = searchParams.get('patched');
  const brandParam = searchParams.get('brand') ?? searchParams.get('brands');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minTreadDepth = searchParams.get('minTreadDepth');
  const maxTreadDepth = searchParams.get('maxTreadDepth');
  const minRemainingLife = searchParams.get('minRemainingLife');
  const maxRemainingLife = searchParams.get('maxRemainingLife');
  const sort = searchParams.get('sort');

  // Dimensiones del neumático (ahora solo trabajamos con una dimensión principal)
  const width = searchParams.get('w');
  const sidewall = searchParams.get('s');
  const diameter = searchParams.get('d');

  // Construir el objeto de filtros
  const filters: TireFilters = {};

  // Agregar filtros estándar
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
  if (minTreadDepth) filters.minTreadDepth = parseInt(minTreadDepth, 10);
  if (maxTreadDepth) filters.maxTreadDepth = parseInt(maxTreadDepth, 10);
  if (minRemainingLife) filters.minRemainingLife = parseInt(minRemainingLife, 10);
  if (maxRemainingLife) filters.maxRemainingLife = parseInt(maxRemainingLife, 10);
  if (sort) filters.sort = sort;

  try {
    const result = await fetchTires(offset, pageSize, filters);

    return NextResponse.json(result);
  } catch (err: unknown) {
    logger.error('Failed to fetch tires', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
