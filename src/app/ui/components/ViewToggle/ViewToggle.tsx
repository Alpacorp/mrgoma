import { FC } from 'react';

import Link from 'next/link';

import { setParam } from '@/app/utils/filterHref';
import type { TireView } from '@/app/utils/filterUtils';

interface ViewToggleProps {
  current: TireView;
  /** The current query string, so switching keeps every filter. */
  search: string;
  basePath: string;
}

const VIEWS: { value: TireView; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'table', label: 'Table' },
];

/**
 * How the results are read — a list of rows with photos, or a compact table.
 *
 * **Half the catalogue has no photo**, so the row's widest column is a
 * placeholder for every second listing. The choice is in the URL rather than in
 * component state, so a shared link opens the way the sender was reading it and
 * it survives every filter change.
 */
const ViewToggle: FC<ViewToggleProps> = ({ current, search, basePath }) => (
  <div
    role="group"
    aria-label="Result view"
    className="inline-flex rounded-md border border-gray-300 bg-white p-0.5"
  >
    {VIEWS.map(view => {
      const isCurrent = view.value === current;
      return (
        <Link
          key={view.value}
          href={`${basePath}${setParam(search, 'view', view.value === 'list' ? undefined : view.value)}`}
          aria-current={isCurrent ? 'true' : undefined}
          data-track="results_view"
          data-track-category="tires_filter"
          data-track-label={view.value}
          className={`rounded px-3 py-1 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
            // White on `bg-green-600` measures 3.21:1 — below the 4.5:1 AA needs at this
            // size. `green-700` clears it and stays on-brand.
            isCurrent ? 'bg-green-700 text-white' : 'text-gray-600 hover:text-green-700'
          }`}
        >
          {view.label}
        </Link>
      );
    })}
  </div>
);

export default ViewToggle;
