import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GUESS_KEY, GUESS_TTL_MS, readGuess, resolveCity, writeGuess } from './visitorCity';

const NOW = 1_800_000_000_000;

beforeEach(() => localStorage.clear());

describe('stored estimate (1 day)', () => {
  it('round-trips and expires after a day', () => {
    writeGuess('Miami', 'location-1', NOW);
    expect(readGuess(NOW + GUESS_TTL_MS)).toEqual({ city: 'Miami', store: 'location-1', at: NOW });
    expect(readGuess(NOW + GUESS_TTL_MS + 1)).toBeNull();
  });

  it('remembers "no city" too, so an out-of-state visitor is not re-asked all day', () => {
    writeGuess(null, 'location-1', NOW);
    expect(readGuess(NOW)).toEqual({ city: null, store: null, at: NOW });
  });

  it('stores only the city, a store id and a time — never coordinates (AC9)', () => {
    writeGuess('Miami', 'location-2', NOW);
    expect(Object.keys(JSON.parse(localStorage.getItem(GUESS_KEY)!)).sort()).toEqual([
      'at',
      'city',
      'store',
    ]);
  });

  it('treats corrupt JSON, unknown cities and throwing storage as empty', () => {
    localStorage.setItem(GUESS_KEY, '{nope');
    expect(readGuess(NOW)).toBeNull();
    localStorage.setItem(GUESS_KEY, JSON.stringify({ city: 'Tampa', store: 'x', at: NOW }));
    expect(readGuess(NOW)).toEqual({ city: null, store: null, at: NOW });
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readGuess(NOW)).toBeNull();
    spy.mockRestore();
  });
});

describe('resolveCity', () => {
  it('uses the estimate with its store, or nothing', () => {
    expect(resolveCity({ city: 'Miami', store: 'location-1', at: NOW })).toEqual({
      city: 'Miami',
      nearestStoreId: 'location-1',
    });
    expect(resolveCity({ city: null, store: null, at: NOW })).toEqual({
      city: null,
      nearestStoreId: null,
    });
    expect(resolveCity(null)).toEqual({ city: null, nearestStoreId: null });
  });
});
