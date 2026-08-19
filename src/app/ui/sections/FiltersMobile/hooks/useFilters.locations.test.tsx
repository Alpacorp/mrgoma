import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { encodeLocationPairs } from '@/app/utils/filterUtils';

/**
 * The shelf filter depends on the store filter, which is the whole reason it
 * needs its own tests.
 *
 * Two things go wrong quietly if this is not held down. Asking for codes with no
 * store selected returns all 675 — not a menu, and not scoped to anything the
 * user can see. And leaving a code selected after its store is deselected leaves
 * the table filtered by a shelf that is no longer on offer, which reads as
 * "the dashboard is broken" rather than "that filter is still on".
 */

const h = vi.hoisted(() => ({
  push: vi.fn(),
  params: new URLSearchParams(),
  fetched: [] as string[],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => h.params,
}));

import { useFilters } from './useFilters';

const LOCATIONS = [
  { store: 'Hialeah', code: '+703C+' },
  { store: '441', code: '-507D-' },
];

beforeEach(() => {
  h.push.mockClear();
  h.fetched = [];
  h.params = new URLSearchParams();

  global.fetch = vi.fn(async (url: string | URL | Request) => {
    const href = String(url);
    h.fetched.push(href);
    if (href.includes('/locations')) {
      return { ok: true, json: async () => LOCATIONS } as Response;
    }
    if (href.includes('/stores')) {
      return { ok: true, json: async () => ['Hialeah', '441'] } as Response;
    }
    if (href.includes('/ranges')) {
      return {
        ok: true,
        json: async () => ({
          minPrice: 10,
          maxPrice: 500,
          minTreadDepth: 1,
          maxTreadDepth: 32,
          minRemainingLife: 0,
          maxRemainingLife: 100,
        }),
      } as Response;
    }
    if (href.includes('/brands')) {
      return { ok: true, json: async () => ['Michelin'] } as Response;
    }
    return { ok: true, json: async () => [] } as Response;
  }) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const setup = () =>
  renderHook(() => useFilters('dashboard', '/api/dashboard', { enableStoreFilter: true }));

const locationCalls = () => h.fetched.filter(url => url.includes('/locations'));

describe('the shelf filter follows the store filter', () => {
  // AC4b
  it('asks for no codes while no store is selected', async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.availableStores.length).toBeGreaterThan(0));

    expect(locationCalls()).toEqual([]);
    expect(result.current.availableLocations).toEqual([]);
  });

  /**
   * Driven from the URL rather than from a click, because `router.push` is
   * mocked here: the hook re-reads its state from `searchParams`, so a clicked
   * selection is reverted the moment anything else re-renders. In the browser the
   * push updates the URL and the two agree. Starting from the URL is the same
   * state by the shorter road.
   */
  it('asks only for the codes of the stores that are selected', async () => {
    h.params = new URLSearchParams({ stores: 'Hialeah' });

    const { result } = setup();

    await waitFor(() => expect(locationCalls().length).toBe(1));
    expect(locationCalls()[0]).toContain('stores=Hialeah');
    expect(locationCalls()[0]).not.toContain('441');

    await waitFor(() => expect(result.current.availableLocations).toEqual(LOCATIONS));
  });

  /**
   * AC6 — the prune, driven through the URL.
   *
   * A click would be the obvious way to write this and it races: `router.push`
   * is mocked, so the hook's own sync-from-URL effect restores the store the
   * click just removed, and which one wins depends on machine load. Both of
   * these passed alone and failed in the full suite before being rewritten this
   * way.
   *
   * The URL is the source of truth in production — every selection round-trips
   * through it — so changing `searchParams` and re-rendering *is* the real flow,
   * not a workaround for it.
   */
  const BOTH = encodeLocationPairs([
    { store: 'Hialeah', code: '+703C+' },
    { store: '441', code: '-507D-' },
  ]);

  it('drops a selected code when its store is deselected', async () => {
    h.params = new URLSearchParams({ stores: 'Hialeah,441', locations: BOTH });

    const { result, rerender } = setup();
    await waitFor(() => expect(result.current.checkboxInputs.locations.length).toBe(2));

    // 441 is gone from the selection; its shelf must go with it.
    h.params = new URLSearchParams({ stores: 'Hialeah', locations: BOTH });
    rerender();

    await waitFor(() => expect(result.current.checkboxInputs.locations.length).toBe(1));

    // Hialeah's pair survives and 441's is gone — not both, not neither.
    expect(result.current.checkboxInputs.locations).toEqual([
      encodeLocationPairs([{ store: 'Hialeah', code: '+703C+' }]),
    ]);
  });

  it('clears every code when the last store is deselected', async () => {
    h.params = new URLSearchParams({ stores: 'Hialeah,441', locations: BOTH });

    const { result, rerender } = setup();
    await waitFor(() => expect(result.current.checkboxInputs.locations.length).toBe(2));

    h.params = new URLSearchParams({ locations: BOTH });
    rerender();

    await waitFor(() => expect(result.current.checkboxInputs.locations).toEqual([]));
    expect(result.current.availableLocations).toEqual([]);
  });
});
