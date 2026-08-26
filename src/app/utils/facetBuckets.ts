/**
 * The named ranges the catalog offers for price and remaining life.
 *
 * **One definition, two consumers.** The visible label, the URL a link sets and
 * the SQL `CASE` that counts the bucket are all derived from the same array. A
 * tier therefore cannot be renamed, moved or re-bounded in one place and not the
 * others — which is the failure this repository has now fixed four times in a
 * month, and the only reason it was safe to accept two controls over one filter.
 *
 * **Bounds are inclusive at both ends**, because `buildFiltersClause` applies
 * `Price >= @minPrice` and `Price <= @maxPrice`. Measured over the live catalog:
 * every sellable price is a whole number (70 … 2002) and every remaining life is
 * a whole percentage (53 … 99), so inclusive integer bounds describe the data
 * exactly and a facet count can equal what its own link returns. If fractional
 * prices ever appear, `bucketFor` and the generated `CASE` stay consistent with
 * each other but stop tiling the number line — that is the thing to re-check.
 */

export type Bucket = {
  /** Stable id; never shown, used to key counts coming back from SQL. */
  id: string;
  /** What the buyer reads. */
  label: string;
  /** Inclusive lower bound. Absent means "no lower bound". */
  min?: number;
  /** Inclusive upper bound. Absent means "no upper bound". */
  max?: number;
};

/**
 * Measured distribution over the live catalog on 2026-08-25:
 * 416 / 1.341 / 1.024 / 949 / 419 — five tiers that are unusually even, which is
 * what makes them worth offering instead of a slider alone.
 */
export const PRICE_BUCKETS: readonly Bucket[] = [
  { id: 'p1', label: 'Under $100', max: 99 },
  { id: 'p2', label: '$100 – $149', min: 100, max: 149 },
  { id: 'p3', label: '$150 – $199', min: 150, max: 199 },
  { id: 'p4', label: '$200 – $299', min: 200, max: 299 },
  { id: 'p5', label: '$300 & up', min: 300 },
];

/**
 * Measured: 2.060 / 1.021 / 1.063 / 5. The last tier holds five tires and is
 * kept anyway — it is the honest bottom of what the storefront sells, and
 * hiding it would make the counts above it not add up to the total.
 */
export const LIFE_BUCKETS: readonly Bucket[] = [
  { id: 'l1', label: '90% & up', min: 90 },
  { id: 'l2', label: '75 – 89%', min: 75, max: 89 },
  { id: 'l3', label: '60 – 74%', min: 60, max: 74 },
  { id: 'l4', label: '50 – 59%', min: 50, max: 59 },
];

/** The bucket a value falls into, or `undefined` if it falls outside them all. */
export function bucketFor(value: number, buckets: readonly Bucket[]): Bucket | undefined {
  return buckets.find(
    b => (b.min === undefined || value >= b.min) && (b.max === undefined || value <= b.max)
  );
}

/**
 * The bucket a `[min, max]` pair *is*, for showing which one is applied.
 *
 * Deliberately an exact match on both bounds: a hand-set span of $140–$185 is
 * not "the $100–149 bucket", and pretending otherwise would make the two
 * controls disagree about the same state — the exact failure mode that made
 * offering both risky.
 */
export function bucketOfRange(
  min: number | undefined,
  max: number | undefined,
  buckets: readonly Bucket[]
): Bucket | undefined {
  return buckets.find(b => b.min === min && b.max === max);
}

/**
 * A SQL `CASE` expression labelling each row with its bucket id.
 *
 * `expr` must already be numeric — the caller owns the cast, because price and
 * remaining life are stored differently and only the caller knows which.
 * Comparisons mirror `buildFiltersClause` exactly, so the number a facet shows
 * is the number its own link returns.
 */
export function bucketCase(expr: string, buckets: readonly Bucket[]): string {
  const branches = buckets.map(b => {
    const tests: string[] = [];
    if (b.min !== undefined) tests.push(`${expr} >= ${b.min}`);
    if (b.max !== undefined) tests.push(`${expr} <= ${b.max}`);
    if (tests.length === 0) throw new Error(`Bucket ${b.id} is unbounded on both sides`);
    return `WHEN ${tests.join(' AND ')} THEN '${b.id}'`;
  });
  return `CASE ${branches.join(' ')} ELSE NULL END`;
}
