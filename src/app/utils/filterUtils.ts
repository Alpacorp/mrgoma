/**
 * Utilities for handling API filter parameters
 */

import { TireFilters } from '@/repositories/tiresRepository';

/**
 * Extract and build a filters' object from search parameters
 * @param searchParams URL search parameters
 * @returns Filters object ready to use with repository functions
 */
export function buildTireFilters(searchParams: URLSearchParams): TireFilters {
  const filters: TireFilters = {};

  // Standard filters
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

  // Tire dimensions
  const width = searchParams.get('w');
  const sidewall = searchParams.get('s');
  const diameter = searchParams.get('d');

  // Add standard filters
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

  // Add dimension parameters
  if (width) filters.width = width;
  if (sidewall) filters.sidewall = sidewall;
  if (diameter) filters.diameter = diameter;

  return filters;
}

/**
 * Extract and build a filters' object for brand filtering (excludes brand filter itself)
 * @param searchParams URL search parameters
 * @returns Filters object ready to use with fetchBrands
 */
export function buildBrandFilters(searchParams: URLSearchParams): TireFilters {
  const filters = buildTireFilters(searchParams);

  // Remove brand filters when fetching available brands
  delete filters.brands;

  return filters;
}
