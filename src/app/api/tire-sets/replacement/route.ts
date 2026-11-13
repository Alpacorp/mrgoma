import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { withLogging } from '@/app/api/_lib/withLogging';
import { anchorFromTire, pickReplacement, type SetUnit } from '@/app/utils/tireSets';
import { mapTireRecordToSingleTire } from '@/repositories/mapTireRecordToSingleTire';
import { fetchSetCandidatesFresh, setGroupOf } from '@/repositories/tireSetsRepository';
import { fetchTireById } from '@/repositories/tiresRepository';

/**
 * A replacement for a set tire that sold before the shopper paid (feature 041,
 * FR13 / D7).
 *
 * `GET ?sold=<id>&keep=<id,id,…>` → `{ replacement, product }`, where
 * `replacement` is the best compatible tire — same group, any city (047),
 * within 2/32" of every kept tire, D6 order — or `null`. `product` carries the group's brand,
 * model and size so the browser can write the cart line the same way the set
 * builder does.
 *
 * Public, so it is defensive: numeric ids only, at most three kept tires, a 404
 * for an unknown tire, whitelisted output, and a 10 s cache per request so a
 * burst of calls does not reach the database pool.
 */

const ID = /^\d{1,12}$/;
const MAX_KEEP = 3;

type Result =
  | { status: 404 }
  | {
      status: 200;
      body: {
        replacement: SetUnit | null;
        product: { brand: string; model2?: string; size?: string } | null;
      };
    };

async function findReplacement(sold: string, keep: string[]): Promise<Result> {
  const record = await fetchTireById(sold);
  if (!record) return { status: 404 };
  const tire = mapTireRecordToSingleTire(record);
  const group = setGroupOf(tire);
  if (!group) return { status: 200, body: { replacement: null, product: null } };

  const candidates = (await fetchSetCandidatesFresh(group)).filter(c => c.id !== sold);
  const keepSet = new Set(keep);
  const kept = candidates.filter(c => keepSet.has(c.id));
  // When none of the kept tires is still for sale, measure against the one that sold.
  const reference = kept.length > 0 ? kept : [anchorFromTire(tire)];
  const pool = candidates.filter(c => !keepSet.has(c.id));

  return {
    status: 200,
    body: {
      replacement: pickReplacement(reference, pool),
      product: { brand: tire.brand, model2: tire.model2, size: tire.size },
    },
  };
}

const cached = unstable_cache(
  async (sold: string, keepKey: string) => findReplacement(sold, keepKey ? keepKey.split(',') : []),
  ['tire-set-replacement'],
  { revalidate: 10, tags: ['tire-sets'] }
);

export const GET = withLogging('tireSets.replacement.GET', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const sold = (searchParams.get('sold') ?? '').trim();
  const keep = (searchParams.get('keep') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!ID.test(sold) || keep.length > MAX_KEEP || keep.some(k => !ID.test(k))) {
    return NextResponse.json({ message: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const result = await cached(sold, [...keep].sort().join(','));
    if (result.status === 404) {
      return NextResponse.json({ message: 'Tire not found' }, { status: 404 });
    }
    return NextResponse.json(result.body, { status: 200 });
  } catch {
    // A failure here must not block checkout: the shopper can still remove the tire.
    return NextResponse.json({ replacement: null, product: null }, { status: 200 });
  }
});
