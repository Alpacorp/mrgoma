import { FC } from 'react';

import Link from 'next/link';

import type { AppliedChip } from './appliedChips';

interface AppliedFiltersProps {
  chips: AppliedChip[];
  className?: string;
}

/**
 * The applied filters, made visible and individually removable.
 *
 * Server-rendered: each chip is a link to the same view minus itself, so
 * removing one filter never disturbs another and the result is a URL like any
 * other.
 *
 * **Clear all lives in the rail's header, not here.** Both rendered it, so the
 * page showed the same control twice, four lines apart — visible only once the
 * two were on screen together.
 */
const AppliedFilters: FC<AppliedFiltersProps> = ({ chips, className = '' }) => {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <span className="sr-only">Applied filters</span>
      {chips.map(chip => (
        <Link
          key={`${chip.group}:${chip.label}`}
          href={chip.href}
          aria-label={`Remove ${chip.label} filter`}
          data-track="filter_remove"
          data-track-category="tires_filter"
          data-track-label={chip.group}
          className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          {chip.label}
          <span aria-hidden="true">×</span>
        </Link>
      ))}
    </div>
  );
};

export default AppliedFilters;
