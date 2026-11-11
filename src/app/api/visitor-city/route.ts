import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { withLogging } from '@/app/api/_lib/withLogging';
import { cityFromPosition } from '@/app/utils/visitorCityGeo';

/**
 * The visitor's approximate city (feature 043): `{ city, nearestStoreId }`,
 * with `city: null` beyond 60 miles of every store or when the position is
 * unknown (local development, privacy relays, VPNs without a location).
 *
 * The position comes from Vercel's IP geolocation headers. It is used here, in
 * memory, and nowhere else: it is not logged (`withLogging` records path,
 * status and time only), not returned and not stored. This is the **only**
 * place in the app that reads those headers — a guard test keeps it that way,
 * so no page can start varying its HTML by location.
 */

const Position = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export const GET = withLogging('visitorCity.GET', async (req: NextRequest) => {
  const lat = req.headers.get('x-vercel-ip-latitude');
  const lng = req.headers.get('x-vercel-ip-longitude');
  const parsed =
    lat && lng
      ? Position.safeParse({ latitude: lat, longitude: lng })
      : { success: false as const };

  const guess = parsed.success
    ? cityFromPosition(parsed.data.latitude, parsed.data.longitude)
    : null;

  return NextResponse.json(
    { city: guess?.city ?? null, nearestStoreId: guess?.nearestStoreId ?? null },
    { headers: NO_STORE }
  );
});
