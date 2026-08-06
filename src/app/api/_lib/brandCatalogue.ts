import { unstable_cache } from 'next/cache';

import { TireFilters, fetchBrands } from '@/repositories/tiresRepository';

/**
 * The catalogue's brand list, cached, in one place.
 *
 * `/api/brands` owned this wrapper privately until the assistant needed the same
 * list to tell "we don't carry that brand" from "we have none right now". Two
 * copies of a cache key and a TTL is how they start disagreeing about how stale
 * they are, so there is one.
 *
 * Lives at the shared `_lib` root rather than under `aiChat/`: a brands route
 * reaching into a chat library would be the wrong way round.
 */
export const getCachedBrands = unstable_cache((filters: TireFilters) => fetchBrands(filters), ['brands'], {
  revalidate: 300,
  tags: ['brands'],
});

/**
 * Compare the way a person types, not the way a database stores.
 *
 * Someone writing "michelin", "MICHELIN" or "Michelin " means the catalogue's
 * "Michelin". Without this the assistant would announce we do not carry a brand
 * that is sitting in the warehouse — a worse failure than the vague message it
 * replaces, because it sounds certain.
 */
const normalize = (brand: string): string => brand.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Which of the requested brands the catalogue does not have.
 *
 * Returns them in the customer's own spelling, so the reply names the brand back
 * the way they wrote it rather than in a normalized form nobody typed.
 */
export function unknownBrands(requested: string[], catalogue: string[]): string[] {
  const known = new Set(catalogue.map(normalize));
  return requested.filter(brand => brand.trim() !== '' && !known.has(normalize(brand)));
}

/** Split the tool's comma-separated `brands` value into individual names. */
export function parseBrands(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map(b => b.trim())
    .filter(Boolean);
}
