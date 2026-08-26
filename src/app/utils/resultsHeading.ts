import { appliedChips } from '@/app/ui/sections/FilterRail/appliedChips';
import type { TireFilters } from '@/repositories/filtersClause';

/**
 * What the results are, in words.
 *
 * The heading read **"All tires" whatever was applied** — brand, rim size, price
 * band, all of them at once. On a page whose whole point is narrowing, the one
 * line that should say what you narrowed to said the opposite.
 *
 * Built from the same `appliedChips` the rail renders, so the heading and the
 * chips can never describe different filters. A complete size keeps its own
 * wording, because `225/50/19` is what a buyer came in saying.
 */
export function resultsHeading(filters: TireFilters): string {
  if (filters.width && filters.sidewall && filters.diameter) {
    return `${filters.width}/${filters.sidewall}/${filters.diameter} tires`;
  }

  // Labels only — hrefs are irrelevant here, and passing an empty query string
  // keeps this a pure function of the filters.
  const labels = appliedChips(filters, '', '').map(chip => chip.label);
  if (labels.length === 0) return 'All tires';

  return `Tires: ${labels.join(' · ')}`;
}
