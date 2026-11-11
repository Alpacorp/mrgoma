import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';

/**
 * The visitor's city from an approximate position (feature 043, D2).
 *
 * **Server only in practice.** It imports `locationsConfig` (descriptions,
 * neighborhoods, images…) which must not ride along in the JavaScript every
 * page ships; the browser side of the feature lives in `visitorCity.ts` and
 * never imports this file.
 */

export type VisitorCityName = 'Miami' | 'Orlando';

/** Beyond this distance from every store, the visitor has no city. */
export const MAX_STORE_DISTANCE_MILES = 60;

const EARTH_RADIUS_MILES = 3958.8;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in miles (haversine). */
export function distanceMiles(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export type CityGuess = { city: VisitorCityName; nearestStoreId: string };

/**
 * The city of the nearest store when it is within 60 miles, else `null`.
 * `nearestStoreId` uses the ids checkout already sends as `pickupStoreId`
 * (`location-{n}`, from `locationsData`).
 */
export function cityFromPosition(latitude: number, longitude: number): CityGuess | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  let best: { index: number; miles: number } | null = null;
  locationsConfig.forEach((store, index) => {
    const miles = distanceMiles({ latitude, longitude }, store.geo);
    if (!best || miles < best.miles) best = { index, miles };
  });
  const nearest = best as { index: number; miles: number } | null;
  if (!nearest || nearest.miles > MAX_STORE_DISTANCE_MILES) return null;
  return {
    city: locationsConfig[nearest.index].city,
    nearestStoreId: `location-${nearest.index + 1}`,
  };
}
