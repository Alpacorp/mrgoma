'use client';

import { FC } from 'react';

import { activeFilterCount } from '@/app/utils/filterHref';

import FilterRail, { type FilterRailProps } from './FilterRail';

/**
 * The rail on a phone: collapsed, one tap away, and **saying how many filters
 * are on while it is shut**.
 *
 * A closed control that only says "Filters" leaves the buyer to work out why
 * they are seeing 40 tires instead of 4.127. The count is the whole point of
 * collapsing it.
 *
 * A native `<details>` rather than a modal: it opens without JavaScript, the
 * browser handles the disclosure semantics, and there is no focus trap to get
 * wrong. The state is the element's own, which is why this file is a client
 * component and the rail inside it is not.
 */
const FilterRailMobile: FC<FilterRailProps> = props => {
  const count = activeFilterCount(props.search);

  return (
    /*
     * The card is on the `<details>`, not on the summary and the panel
     * separately. Drawn twice they read as two unrelated sections with a gap
     * between them — the control and the thing it opens, apparently unconnected.
     */
    <details className="overflow-hidden rounded-xl border border-gray-200 bg-white lg:hidden">
      <summary
        data-track="filter_panel_toggle"
        data-track-category="tires_filter"
        className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <span>
          Filters
          {count > 0 && (
            <span className="ml-2 rounded-full bg-green-700 px-2 py-0.5 text-xs font-bold text-white">
              {count} active
            </span>
          )}
        </span>
        <span aria-hidden="true" className="text-gray-500">
          ▾
        </span>
      </summary>
      {/* The rule only shows when the panel is open, which is when it is wanted. */}
      <div className="border-t border-gray-200 px-4 pb-4 pt-3">
        <FilterRail {...props} showTitle={false} bare />
      </div>
    </details>
  );
};

export default FilterRailMobile;
