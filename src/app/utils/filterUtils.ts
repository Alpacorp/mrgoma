import type { TireFilters } from '@/repositories/tiresRepository';

function safeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

/**
 * A shelf code is only meaningful with its store, so the URL carries both.
 *
 * Encoder and decoder live together on purpose: they are the classic pair that
 * drifts apart, and the failure mode is silent — a filter that matches nothing,
 * or worse, matches the wrong store's shelf.
 *
 * Each half is `encodeURIComponent`d before joining. That is not decoration:
 *
 * - Two codes contain `:` (`:410D:`, `:IN:`), so the obvious separator is out.
 *   `~` is unreserved and appears in no code today — but encoding removes the
 *   dependency on that staying true as staff type new ones.
 * - Most codes look like `+703C+`, and a bare `+` in a query string decodes to a
 *   space. Encoding makes the value inert wherever it is read from.
 * - Eight codes carry spaces or brackets: `< >`, `''651B ''`, `112i (a)`.
 */
export const LOCATION_PAIR_SEPARATOR = '~';

export function encodeLocationPairs(pairs: { store: string; code: string }[]): string {
  return pairs
    .map(
      pair =>
        `${encodeURIComponent(pair.store)}${LOCATION_PAIR_SEPARATOR}${encodeURIComponent(pair.code)}`
    )
    .join(',');
}

export function parseLocationPairs(value: string | null): { store: string; code: string }[] {
  if (!value) return [];

  return value
    .split(',')
    .map(entry => {
      // First separator only: a code that ever contains one still round-trips.
      const at = entry.indexOf(LOCATION_PAIR_SEPARATOR);
      if (at <= 0 || at === entry.length - 1) return null;

      try {
        const store = decodeURIComponent(entry.slice(0, at));
        const code = decodeURIComponent(entry.slice(at + 1));
        return store && code ? { store, code } : null;
      } catch {
        // A malformed escape ("%E0%A4%A") throws. One bad pair must not take the
        // rest of the filter with it, and this parser is shared with /api/tires
        // where the param can arrive from anywhere.
        return null;
      }
    })
    .filter((pair): pair is { store: string; code: string } => pair !== null);
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
  const locationsParam = searchParams.get('locations');
  const kindSaleParam = searchParams.get('kindSale');
  const localParam = searchParams.get('local');
  const codeParam = searchParams.get('code');

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
  const locationPairs = parseLocationPairs(locationsParam);
  if (locationPairs.length > 0) filters.locations = locationPairs;
  if (kindSaleParam) filters.kindSale = kindSaleParam.split(',').filter(Boolean);
  if (localParam) filters.local = localParam.split(',').filter(Boolean);
  // Only digits allowed — reject anything else (injection/XSS protection)
  if (codeParam && /^\d+$/.test(codeParam)) filters.tireCode = codeParam;

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
