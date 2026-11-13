import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { withLogging } from '@/app/api/_lib/withLogging';
import { anchorFromTire, closestMatch } from '@/app/utils/tireSets';
import { buildTireSlug } from '@/app/utils/tireSlug';
import { mapTireRecordToSingleTire } from '@/repositories/mapTireRecordToSingleTire';
import { getCachedSetCandidates, setGroupOf } from '@/repositories/tireSetsRepository';
import { fetchTireById } from '@/repositories/tiresRepository';
import { createRateLimiter } from '@/utils/rateLimit';

/**
 * "We have N like this in Miami" (feature 043, FR5).
 *
 * `GET ?id=<tire>&city=<Miami|Orlando>` → `{ count, href }`: how many tires
 * "like this" are in **the other** city — same brand, model, size, run-flat
 * type and condition, **any tread** (D6) — and a link to the one most like it
 * in 041's order (closest tread → unpatched → cheaper). Warehouse units count as
 * Miami (D7), through the 041 query.
 *
 * Only called by browsers whose city differs from the tire's, so it reuses the
 * 041 group cache (60 s) instead of adding a query to every tire page render.
 * The query returns at most 60 tires; the browser shows 60 as "60+".
 */

const Params = z.object({
  id: z.string().regex(/^\d{1,12}$/),
  city: z.enum(['Miami', 'Orlando']),
});

const isRateLimited = createRateLimiter('tire-sets-elsewhere', { windowMs: 60 * 1000, max: 30 });

const NONE = { count: 0 };

export const GET = withLogging('tireSets.elsewhere.GET', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const parsed = Params.safeParse({
    id: searchParams.get('id') ?? '',
    city: searchParams.get('city') ?? '',
  });
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid parameters' }, { status: 400 });
  }
  if (isRateLimited(req)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  const { id, city } = parsed.data;

  try {
    const record = await fetchTireById(id);
    if (!record) return NextResponse.json({ message: 'Tire not found' }, { status: 404 });
    const tire = mapTireRecordToSingleTire(record);
    const group = setGroupOf(tire);
    if (!group) return NextResponse.json(NONE);
    if ((tire.city ?? 'Miami') === city) {
      return NextResponse.json({ message: 'The tire is already in that city' }, { status: 400 });
    }

    const candidates = await getCachedSetCandidates({ ...group, city });
    const best = closestMatch(anchorFromTire(tire).tread, candidates);
    if (!best) return NextResponse.json(NONE, { headers: { 'Cache-Control': 's-maxage=60' } });

    return NextResponse.json(
      {
        count: candidates.length,
        href: `/tires/${buildTireSlug(best.id, tire.brand ?? '', tire.size ?? '')}`,
      },
      { headers: { 'Cache-Control': 's-maxage=60' } }
    );
  } catch {
    // An extra on the page: a failure shows nothing rather than an error.
    return NextResponse.json(NONE);
  }
});
