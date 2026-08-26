import { describe, expect, it } from 'vitest';

import {
  Bucket,
  LIFE_BUCKETS,
  PRICE_BUCKETS,
  bucketCase,
  bucketFor,
  bucketOfRange,
} from './facetBuckets';

/**
 * These buckets are read three ways — as a label, as a URL, and as a SQL `CASE`.
 * The tests below are written over the *relationship* between those readings
 * rather than over any one of them: a bucket list that tiles the number line and
 * a `CASE` that agrees with `bucketFor` cannot produce a count that contradicts
 * the page it links to.
 */

const SETS: [name: string, buckets: readonly Bucket[], probeFrom: number, probeTo: number][] = [
  ['price', PRICE_BUCKETS, 70, 2002], // the live catalog's real span
  ['life', LIFE_BUCKETS, 50, 99],
];

describe.each(SETS)('%s buckets', (_name, buckets, from, to) => {
  it('covers every value in the catalog span, with no gap', () => {
    const uncovered: number[] = [];
    for (let v = from; v <= to; v++) if (!bucketFor(v, buckets)) uncovered.push(v);
    expect(uncovered).toEqual([]);
  });

  it('never puts one value in two buckets', () => {
    const doubled: number[] = [];
    for (let v = from; v <= to; v++) {
      const hits = buckets.filter(
        b => (b.min === undefined || v >= b.min) && (b.max === undefined || v <= b.max)
      );
      if (hits.length > 1) doubled.push(v);
    }
    expect(doubled).toEqual([]);
  });

  it('has unique ids and labels', () => {
    expect(new Set(buckets.map(b => b.id)).size).toBe(buckets.length);
    expect(new Set(buckets.map(b => b.label)).size).toBe(buckets.length);
  });

  /**
   * The guarantee that matters: the SQL that produces a count and the TypeScript
   * that decides which bucket a link belongs to must agree for every value. The
   * `CASE` is parsed back out and evaluated, so a generator bug fails here
   * rather than as a count that quietly disagrees with its own page.
   */
  it('generates a CASE that agrees with bucketFor at every value', () => {
    const sql = bucketCase('X', buckets);
    const branches = [...sql.matchAll(/WHEN (.+?) THEN '(\w+)'/g)].map(m => ({
      test: m[1],
      id: m[2],
    }));
    expect(branches).toHaveLength(buckets.length);

    const evaluate = (value: number) => {
      for (const branch of branches) {
        const ok = branch.test.split(' AND ').every(part => {
          const [, op, num] = part.match(/^X (>=|<=) (\d+)$/)!;
          return op === '>=' ? value >= Number(num) : value <= Number(num);
        });
        if (ok) return branch.id;
      }
      return undefined;
    };

    const disagreements: string[] = [];
    for (let v = from; v <= to; v++) {
      const fromSql = evaluate(v);
      const fromTs = bucketFor(v, buckets)?.id;
      if (fromSql !== fromTs) disagreements.push(`${v}: SQL=${fromSql} TS=${fromTs}`);
    }
    expect(disagreements).toEqual([]);
  });

  it('round-trips a bucket through its own bounds', () => {
    for (const b of buckets) {
      expect(bucketOfRange(b.min, b.max, buckets)?.id).toBe(b.id);
    }
  });
});

describe('bucketOfRange is exact, not approximate', () => {
  it('does not claim a hand-set span is a named bucket', () => {
    // The case that makes offering both controls safe: $140–$185 overlaps two
    // buckets and is neither of them, so no bucket may render as applied.
    expect(bucketOfRange(140, 185, PRICE_BUCKETS)).toBeUndefined();
    expect(bucketOfRange(100, 150, PRICE_BUCKETS)).toBeUndefined();
  });

  it('recognises a span the buyer dragged onto a bucket boundary', () => {
    expect(bucketOfRange(100, 149, PRICE_BUCKETS)?.label).toBe('$100 – $149');
  });

  it('treats an open end as open, not as zero', () => {
    expect(bucketOfRange(undefined, 99, PRICE_BUCKETS)?.id).toBe('p1');
    expect(bucketOfRange(0, 99, PRICE_BUCKETS)).toBeUndefined();
    expect(bucketOfRange(300, undefined, PRICE_BUCKETS)?.id).toBe('p5');
  });
});

describe('bucketCase', () => {
  it('mirrors the comparisons buildFiltersClause uses', () => {
    // Inclusive at both ends: the filter applies Price >= @min AND Price <= @max.
    expect(bucketCase('Price', PRICE_BUCKETS)).toContain("WHEN Price <= 99 THEN 'p1'");
    expect(bucketCase('Price', PRICE_BUCKETS)).toContain(
      "WHEN Price >= 100 AND Price <= 149 THEN 'p2'"
    );
    expect(bucketCase('Price', PRICE_BUCKETS)).toContain("WHEN Price >= 300 THEN 'p5'");
  });

  it('refuses a bucket that is unbounded on both sides', () => {
    expect(() => bucketCase('X', [{ id: 'x', label: 'Everything' }])).toThrow(/unbounded/);
  });
});
