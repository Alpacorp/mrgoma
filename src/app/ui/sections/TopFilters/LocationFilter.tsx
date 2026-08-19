'use client';

import { ChangeEvent, useMemo, useState } from 'react';

import { encodeLocationPairs } from '@/app/utils/filterUtils';

export type LocationPair = { store: string; code: string };

interface LocationFilterProps {
  /** Codes available in the currently selected stores, each with its store. */
  available: LocationPair[];
  /** Selected pairs, already encoded — the shape `handleCheckboxChange` stores. */
  selected: string[];
  /** Whether any store is selected at all. */
  hasStore: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onToggleAction: () => void;
  onChangeAction: (event: ChangeEvent<HTMLInputElement>) => void;
  activeClass: string;
  defaultClass: string;
  /** Set on mobile, where the panel is inline rather than floating. */
  inline?: boolean;
}

/**
 * The shelf filter.
 *
 * Three things about it are decisions rather than defaults:
 *
 * **It is disabled, not hidden, with no store selected.** A hidden control
 * teaches nobody it exists; a disabled one shows the capability and its
 * precondition in one glance. The reason lives in the button's own text — a
 * `disabled` element receives no touch events on iOS, so a tap-to-reveal tooltip
 * would be invisible on the device the staff actually hold.
 *
 * **Codes are grouped under their store.** The same code exists in more than one
 * store — `IN`, `stkCesar`, `+690A+`, `+692A+`, `+706D+`, `[183B]`, `+IN+` — so a
 * loose `+690A+` names nothing on its own. Each checkbox therefore carries the
 * encoded *pair* as its value, which is also what the query filters on.
 *
 * **It has a filter input.** Hialeah alone holds 130 codes; a list that long
 * without one is a scroll, not a menu.
 */
export function LocationFilter({
  available,
  selected,
  hasStore,
  isLoading,
  isOpen,
  onToggleAction,
  onChangeAction,
  activeClass,
  defaultClass,
  inline = false,
}: LocationFilterProps) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const byStore = new Map<string, LocationPair[]>();

    for (const pair of available) {
      if (needle && !pair.code.toLowerCase().includes(needle)) continue;
      const codes = byStore.get(pair.store) ?? [];
      codes.push(pair);
      byStore.set(pair.store, codes);
    }

    // A group survives only while it still has a match, so an empty store header
    // never sits over nothing.
    return [...byStore.entries()];
  }, [available, query]);

  const isActive = selected.length > 0;

  if (!hasStore) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`px-3 py-2 text-sm rounded-md border flex items-center gap-2 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400`}
      >
        <span>Location — select a store</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onToggleAction}
        aria-expanded={isOpen}
        className={`px-3 py-2 text-sm rounded-md border cursor-pointer flex items-center gap-2 ${
          isOpen || isActive ? activeClass : defaultClass
        }`}
      >
        <span>Location</span>
        {isActive && <span className="text-xs">({selected.length})</span>}
        <svg
          className={`h-4 w-4 text-current transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={
            inline
              ? 'mt-2 w-full bg-white border border-gray-200 rounded-lg p-4'
              : 'absolute left-0 mt-2 z-50 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4'
          }
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600" />
              <span className="ml-2 text-sm text-gray-500">Loading locations...</span>
            </div>
          ) : (
            <>
              <label htmlFor="location-search" className="sr-only">
                Filter shelf codes
              </label>
              <input
                id="location-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Filter codes…"
                // 16px keeps iOS Safari from zooming the whole page on focus.
                style={{ fontSize: '16px' }}
                className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500">No codes match “{query}”.</p>
                ) : (
                  groups.map(([store, pairs]) => (
                    <div key={store}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                        {store}
                      </p>
                      {pairs.map(pair => {
                        const value = encodeLocationPairs([pair]);
                        const id = `filter-locations-${value}`;
                        return (
                          <div key={value} className="flex items-center">
                            <input
                              id={id}
                              name="locations[]"
                              value={value}
                              type="checkbox"
                              checked={selected.includes(value)}
                              onChange={onChangeAction}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                            />
                            <label htmlFor={id} className="ml-3 text-gray-600 text-sm">
                              {pair.code}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default LocationFilter;
