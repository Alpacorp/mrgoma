'use client';

import { FC, useId, useMemo, useState } from 'react';

import Link from 'next/link';

import type { FacetOption } from './FacetGroup';

interface SearchableFacetProps {
  options: FacetOption[];
  /** How many to show before the buyer asks for the rest. */
  initialCount?: number;
  /** What the group holds, for the search label and the empty message. */
  noun?: string;
  /** Plural of `noun`, when it is not simply `noun + 's'`. */
  nounPlural?: string;
  /** Whether picking a second option adds to the first. See `FacetGroup`. */
  multiSelect?: boolean;
  /** Digits-only groups get a numeric keypad on a phone. */
  numeric?: boolean;
}

/**
 * A facet long enough to need a search box.
 *
 * Brand has 115 options; width has 22, profile 17 and rim 14. Rendered flat they
 * are 168 rows in a 240 px rail — the buyer scrolls past the whole warehouse to
 * reach the price filter.
 *
 * **The whole list is rendered, then hidden.** The options come from the server
 * already in the markup; typing only decides which are displayed. So the search
 * costs no request, answers instantly, and with JavaScript unavailable the page
 * degrades to the plain full list rather than to an input that does nothing.
 * Same approach as the dashboard's shelf-code search.
 *
 * The list also opens short and grows on request: **six brands cover 69% of the
 * catalogue and 32 have a single tire**, so the tail is worth searching for and
 * not worth scrolling through.
 */
const SearchableFacet: FC<SearchableFacetProps> = ({
  options,
  initialCount = 8,
  noun = 'brand',
  nounPlural,
  multiSelect = true,
  numeric = false,
}) => {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const inputId = useId();
  const plural = nounPlural ?? `${noun}s`;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(option => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  const searching = query.trim().length > 0;

  /**
   * **Every option is rendered; the overflow is hidden with CSS.**
   *
   * Slicing the list instead looked identical and was not: only the first eight
   * reached the markup, so without JavaScript — and to a crawler — the rim group
   * offered 13" to 19.5" and **23" (93 tires), 24" (7) and 26" (2) simply did
   * not exist**. Those are the sizes this rail was built to make reachable, and
   * hiding them behind a button that needs JavaScript to work put them back out
   * of reach. `Show all` now reveals what is already on the page.
   */
  const shownWhenClosed = new Set(
    [
      ...matches.filter(o => o.applied),
      ...matches.filter(o => !o.applied).slice(0, initialCount),
    ].map(o => o.value)
  );
  const isHidden = (option: FacetOption) =>
    !searching && !showAll && !shownWhenClosed.has(option.value);
  const visible = searching ? matches : options;
  const hidden = matches.filter(isHidden).length;

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        Search {plural}
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder={`Search ${plural}`}
        inputMode={numeric ? 'numeric' : undefined}
        autoComplete="off"
        // 16px keeps iOS Safari from zooming the page on focus.
        style={{ fontSize: '16px' }}
        className="mb-2 w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 leading-tight text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      />

      <ul className="flex flex-col">
        {visible.map(option => (
          <li key={option.value} className={isHidden(option) ? 'hidden' : undefined}>
            <Link
              href={option.href}
              aria-current={option.applied ? 'true' : undefined}
              data-track="filter_apply"
              data-track-category="tires_filter"
              data-track-label={`Brand:${option.value}`}
              className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                option.applied
                  ? 'bg-green-50 font-semibold text-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
              }`}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {multiSelect && (
                  /* Brands combine with OR: picking a second adds it to the
                     first. Without the box, "Bridgestone 440" beside a link
                     reads as a promise of 440 results, and clicking it with
                     Pirelli applied returns 1.397. A rim size does not combine
                     — a tire has one — so those get no box. */
                  <span
                    aria-hidden="true"
                    className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border text-[9px] font-bold leading-none ${
                      option.applied
                        ? 'border-green-700 bg-green-700 text-white'
                        : 'border-gray-300 bg-white text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                )}
                <span className="truncate">{option.label}</span>
              </span>
              <span
                className={`shrink-0 text-xs tabular-nums ${
                  option.applied ? 'text-green-800' : 'text-gray-500'
                }`}
              >
                {option.count.toLocaleString('en-US')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {matches.length === 0 && (
        <p className="px-2 py-1.5 text-sm text-gray-500">No brand matches “{query.trim()}”.</p>
      )}

      {!searching && hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-1 cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-green-700 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          Show all {matches.length.toLocaleString('en-US')} {plural}
        </button>
      )}
    </div>
  );
};

export default SearchableFacet;
