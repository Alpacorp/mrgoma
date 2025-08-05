import { NextRequest, NextResponse } from 'next/server';

import { buildTireFilters } from '@/app/utils/filterUtils';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  validatePageSize,
} from '@/app/utils/paginationUtils';
import { fetchTires } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Get and validate pagination parameters
  const pageParam = searchParams.get('page') ?? DEFAULT_PAGE.toString();
  const pageSizeParam = searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE.toString();

  // Convert to numbers and apply validation
  const page = Math.max(1, parseInt(pageParam, 10) || DEFAULT_PAGE);
  const pageSize = validatePageSize(parseInt(pageSizeParam, 10) || DEFAULT_PAGE_SIZE);

  // Log for detecting manipulation attempts
  if (parseInt(pageSizeParam, 10) > MAX_PAGE_SIZE) {
    logger.warn(`Attempted to use large page size: ${pageSizeParam}. Limited to ${pageSize}.`);
  }

  const offset = (page - 1) * pageSize;

  // Build filters from search parameters
  const filters = buildTireFilters(searchParams);

  try {
    const result = await fetchTires(offset, pageSize, filters);
    return NextResponse.json(result);
  } catch (err: unknown) {
    logger.error('Failed to fetch tires', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
