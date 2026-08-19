'use client';

import { ChangeEvent, ReactNode, useMemo, useState } from 'react';

import { encodeLocationPairs } from '@/app/utils/filterUtils';

export type LocationPair = { store: string; code: string };

/** The select-shaped trigger both controls share, matching `SelectDropdown`. */
function SelectTrigger({
  label,
  onClick,
  disabled,
  isOpen,
  isActive,
  activeClass,
  defaultClass,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isOpen: boolean;
  isActive: boolean;
  activeClass: string;
  defaultClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-expanded={disabled ? undefined : isOpen}
      className={`relative w-36 bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-xs text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${isActive ? activeClass : defaultClass}`}
    >
      {label}
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          } ${isOpen ? 'rotate-180' : ''}`}
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
      </span>
    </button>
  );
}

function Panel({ inline, children }: { inline: boolean; children: ReactNode }) {
  return (
    <div
      className={
        inline
          ? 'mt-2 w-full bg-white border border-gray-200 rounded-lg p-4'
          : 'absolute left-0 top-full mt-2 z-50 w-72 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4'
      }
    >
      {children}
    </div>
  );
}

function Spinner({ what }: { what: string }) {
  return (
    <div className="flex justify-center items-center h-20">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600" />
      <span className="ml-2 text-sm text-gray-500">Loading {what}...</span>
    </div>
  );
}

interface StoreLocationFilterProps {
  stores: string[];
  selectedStores: string[];
  isLoadingStores: boolean;
  locations: LocationPair[];
  /** Selected pairs, already encoded — the shape `handleCheckboxChange` stores. */
  selectedLocations: string[];
  isLoadingLocations: boolean;
  openMenu: string | null;
  onOpenAction: (menu: string | null) => void;
  onChangeAction: (event: ChangeEvent<HTMLInputElement>) => void;
  activeClass: string;
  defaultClass: string;
  /** Mobile: the panels sit inline and the two controls stack. */
  inline?: boolean;
}

/**
 * Store and shelf Location, as one group.
 *
 * They are presented together because they *are* one thing: a shelf code means
 * nothing without its store, so Location stays disabled until a Store is
 * chosen. That is the same shape as the Size group beside it in the bar — no
 * sidewall until a width, no diameter until a sidewall — so it borrows the same
 * clothes: one bordered container, a small grey label per control, and
 * select-shaped triggers.
 *
 * Location's disabled state says *why* in the control's own text rather than in
 * a tooltip: a `disabled` element receives no touch events on iOS, so anything
 * needing a tap to reveal is invisible on the device the staff actually hold.
 */
export function StoreLocationFilter({
  stores,
  selectedStores,
  isLoadingStores,
  locations,
  selectedLocations,
  isLoadingLocations,
  openMenu,
  onOpenAction,
  onChangeAction,
  activeClass,
  defaultClass,
  inline = false,
}: StoreLocationFilterProps) {
  const [query, setQuery] = useState('');

  const hasStore = selectedStores.length > 0;

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const byStore = new Map<string, LocationPair[]>();

    for (const pair of locations) {
      if (needle && !pair.code.toLowerCase().includes(needle)) continue;
      const codes = byStore.get(pair.store) ?? [];
      codes.push(pair);
      byStore.set(pair.store, codes);
    }

    // A group survives only while it still has a match, so a store header never
    // sits over nothing.
    return [...byStore.entries()];
  }, [locations, query]);

  /** Unchecks through the same handler the boxes use — one owner for the state. */
  const clearAll = () => {
    for (const [name, values] of [
      ['stores[]', selectedStores],
      ['locations[]', selectedLocations],
    ] as const) {
      for (const value of values) {
        onChangeAction({
          target: { name, value, checked: false },
        } as unknown as ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const toggle = (menu: string) => onOpenAction(openMenu === menu ? null : menu);

  const storeLabel = selectedStores.length ? `${selectedStores.length} selected` : 'Select';
  const locationLabel = !hasStore
    ? 'Select a store'
    : selectedLocations.length
      ? `${selectedLocations.length} selected`
      : 'Select';

  return (
    <div
      className={`flex ${
        inline ? 'flex-col items-stretch gap-3' : 'items-center gap-2'
      } border border-green-200 rounded-md px-3 py-1.5`}
    >
      <div className={`relative flex items-center gap-2 ${inline ? 'w-full' : ''}`}>
        <span className="text-xs font-medium text-gray-500 shrink-0">Store</span>
        <SelectTrigger
          label={isLoadingStores ? 'Loading…' : storeLabel}
          onClick={() => toggle('stores')}
          disabled={isLoadingStores}
          isOpen={openMenu === 'stores'}
          isActive={selectedStores.length > 0}
          activeClass={activeClass}
          defaultClass={defaultClass}
        />

        {openMenu === 'stores' && (
          <Panel inline={inline}>
            {isLoadingStores ? (
              <Spinner what="stores" />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {stores.map((store, idx) => (
                  <div key={store} className="flex items-center">
                    <input
                      id={`filter-stores-${idx}`}
                      name="stores[]"
                      value={store}
                      type="checkbox"
                      checked={selectedStores.includes(store)}
                      onChange={onChangeAction}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                    />
                    <label htmlFor={`filter-stores-${idx}`} className="ml-3 text-gray-600 text-sm">
                      {store}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      <div className={`relative flex items-center gap-2 ${inline ? 'w-full' : ''}`}>
        <span className="text-xs font-medium text-gray-500 shrink-0">Location</span>
        <SelectTrigger
          label={locationLabel}
          onClick={() => toggle('locations')}
          disabled={!hasStore}
          isOpen={openMenu === 'locations'}
          isActive={selectedLocations.length > 0}
          activeClass={activeClass}
          defaultClass={defaultClass}
        />

        {openMenu === 'locations' && hasStore && (
          <Panel inline={inline}>
            {isLoadingLocations ? (
              <Spinner what="locations" />
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
                  // 16px keeps iOS Safari from zooming the page on focus.
                  style={{ fontSize: '16px' }}
                  className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
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
                                checked={selectedLocations.includes(value)}
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
          </Panel>
        )}
      </div>

      {(selectedStores.length > 0 || selectedLocations.length > 0) && (
        <button
          type="button"
          onClick={clearAll}
          className="cursor-pointer text-xs border border-green-200 text-green-600 hover:bg-green-50 rounded px-1.5 py-0.5 shrink-0 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default StoreLocationFilter;
