/**
 * The visitor's approximate city, as remembered in their own browser
 * (feature 043).
 *
 * One key, never coordinates: `mg_city_guess` keeps what `/api/visitor-city`
 * estimated from the network for **1 day**, so a visitor costs at most one call
 * a day and a move is noticed. The city is never chosen or shown as a setting
 * — on a site where every tire is one unit in one place, the tires' city is
 * what matters; the estimate only powers two quiet helps (the "like this in
 * your city" link and the nearest pickup store), both easy to ignore.
 *
 * No imports — this module ships to every page.
 */

export type VisitorCityName = 'Miami' | 'Orlando';

export const GUESS_KEY = 'mg_city_guess';
export const GUESS_TTL_MS = 24 * 60 * 60 * 1000;

export type StoredGuess = { city: VisitorCityName | null; store: string | null; at: number };

const isCity = (v: unknown): v is VisitorCityName => v === 'Miami' || v === 'Orlando';

export function readGuess(now = Date.now()): StoredGuess | null {
  try {
    const raw = window.localStorage.getItem(GUESS_KEY);
    const v = (raw ? JSON.parse(raw) : null) as Partial<StoredGuess> | null;
    if (!v || typeof v.at !== 'number' || now - v.at > GUESS_TTL_MS) return null;
    const city = isCity(v.city) ? v.city : null;
    const store = city && typeof v.store === 'string' ? v.store : null;
    return { city, store, at: v.at };
  } catch {
    return null;
  }
}

export function writeGuess(
  city: VisitorCityName | null,
  store: string | null,
  now = Date.now()
): void {
  try {
    window.localStorage.setItem(
      GUESS_KEY,
      JSON.stringify({ city, store: city ? store : null, at: now } satisfies StoredGuess)
    );
  } catch {
    // Private mode or blocked storage: the helps simply do not appear.
  }
}

export type ResolvedCity = {
  city: VisitorCityName | null;
  /** The nearest store of that city, for the pickup preselection (FR6). */
  nearestStoreId: string | null;
};

export function resolveCity(guess: StoredGuess | null): ResolvedCity {
  return guess?.city
    ? { city: guess.city, nearestStoreId: guess.store }
    : { city: null, nearestStoreId: null };
}
