import { TireFilters } from '@/repositories/tiresRepository';

function safeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

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
  const storesParam = searchParams.get('stores');
  const kindSaleParam = searchParams.get('kindSale');
  const localParam = searchParams.get('local');

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
  const minPriceVal = safeInt(minPrice);
  const maxPriceVal = safeInt(maxPrice);
  const minTreadVal = safeInt(minTreadDepth);
  const maxTreadVal = safeInt(maxTreadDepth);
  const minLifeVal = safeInt(minRemainingLife);
  const maxLifeVal = safeInt(maxRemainingLife);

  if (minPriceVal !== undefined) filters.minPrice = minPriceVal;
  if (maxPriceVal !== undefined) filters.maxPrice = maxPriceVal;
  if (minTreadVal !== undefined) filters.minTreadDepth = minTreadVal;
  if (maxTreadVal !== undefined) filters.maxTreadDepth = maxTreadVal;
  if (minLifeVal !== undefined) filters.minRemainingLife = minLifeVal;
  if (maxLifeVal !== undefined) filters.maxRemainingLife = maxLifeVal;
  if (sort) filters.sort = sort;
  if (storesParam) filters.stores = storesParam.split(',').filter(Boolean);
  if (kindSaleParam) filters.kindSale = kindSaleParam.split(',').filter(Boolean);
  if (localParam) filters.local = localParam.split(',').filter(Boolean);

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
