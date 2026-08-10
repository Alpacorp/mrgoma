/**
 * The filter vocabulary the assistant reasons about, and the two questions we
 * ask of it: what did this search use, and what is left to narrow by.
 *
 * These are the groupings a *customer* thinks in, not the raw query params. A
 * shopper does not distinguish `minPrice` from `maxPrice` — they gave a price —
 * so both collapse to one dimension. Getting this wrong shows up directly in the
 * assistant's own words: a hint that offers "you could also narrow by maxPrice"
 * is the machine talking to itself.
 *
 * `sort` is deliberately absent. It reorders a result set rather than narrowing
 * one, so offering it as a way to narrow would be nonsense — and counting it as
 * a "dimension used" would inflate a number meant to describe how people search.
 */

export const DIMENSIONS = [
  'size',
  'rim',
  'brand',
  'condition',
  'price',
  'tread',
  'store',
  // Dashboard-only. Never offered to a customer; reported when staff use them.
  'sale_kind',
  'local',
  'code',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

/** What the public assistant may offer as a further way to narrow. */
export const OFFERABLE: readonly Dimension[] = [
  'size',
  'rim',
  'brand',
  'condition',
  'price',
  'tread',
  'store',
];

const PARAM_DIMENSION: Readonly<Record<string, Dimension>> = {
  w: 'size',
  s: 'size',
  d: 'rim',
  brands: 'brand',
  condition: 'condition',
  patched: 'condition',
  minPrice: 'price',
  maxPrice: 'price',
  minTreadDepth: 'tread',
  maxTreadDepth: 'tread',
  minRemainingLife: 'tread',
  maxRemainingLife: 'tread',
  stores: 'store',
  kindSale: 'sale_kind',
  local: 'local',
  code: 'code',
};

const isPresent = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

/**
 * The dimensions this search actually used, in the canonical order.
 *
 * A full size (`225/45R17`) sets width, profile *and* diameter, so it reports
 * `size` alone: reporting `rim` as well would double-count one thing the
 * customer said once.
 */
export function usedDimensions(filters: Record<string, unknown>): Dimension[] {
  const used = new Set<Dimension>();

  for (const [param, dimension] of Object.entries(PARAM_DIMENSION)) {
    if (isPresent(filters[param])) used.add(dimension);
  }

  if (used.has('size')) used.delete('rim');

  return DIMENSIONS.filter(d => used.has(d));
}

/**
 * What is left to narrow by — the whole point of the hint (FR4).
 *
 * `rim` drops out once a full size is given, because a rim diameter is part of
 * that size: asking for it again would be asking for something already said.
 */
export function unusedDimensions(
  filters: Record<string, unknown>,
  offerable: readonly Dimension[] = OFFERABLE
): Dimension[] {
  const used = new Set(usedDimensions(filters));
  return offerable.filter(d => !used.has(d) && !(d === 'rim' && used.has('size')));
}

/**
 * The value the analytics events carry.
 *
 * Names only, never what the customer typed: `brand`, never `Michelin`. The
 * values go to two third parties verbatim, and a brand someone searched for is
 * their business, not ours to forward. A flat comma-joined string because Vercel
 * accepts only scalar properties.
 */
export function dimensionsParam(filters: Record<string, unknown>): string {
  return usedDimensions(filters).join(',');
}
