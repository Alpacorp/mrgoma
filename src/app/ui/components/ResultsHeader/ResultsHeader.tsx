'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import { AdjustmentsHorizontalIcon } from '@/app/ui/components/Icons/Icons';

interface ResultsHeaderProps {
  getTireSize: () => string;
  resultsCount: number;
  totalCount: number;
}

/**
 * ResultsHeader component displays the header section for tire search results,
 * including the current tire size, filter button for mobile, results' count,
 * and sorting options for price.
 */
const ResultsHeader: FC<ResultsHeaderProps> = ({ getTireSize, resultsCount, totalCount }) => {
  const { setShowFilter } = useContext(ShowFilterContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOption, setSortOption] = useState('');

  // Initialize a sort option from URL on the component mount
  useEffect(() => {
    const urlSortOption = searchParams.get('sort') || '';
    setSortOption(urlSortOption);
  }, [searchParams]);

  // Handle sort change
  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSortOption = event.target.value;
      setSortOption(newSortOption);

      // Update URL with new sort parameter
      const params = new URLSearchParams(searchParams.toString());

      if (newSortOption) {
        params.set('sort', newSortOption);
      } else {
        params.delete('sort');
      }

      // Reset to first page when sort changes
      params.set('page', '1');

      // Update URL without refreshing page
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Get the tire size to display
  const tireSize = getTireSize();

  return (
    <div className="flex flex-wrap gap-2 justify-between lg:justify-between items-center mt-6">
      {/* Left side - Tire size title */}
      <div className="flex flex-wrap items-center gap-2 min-w-[250px]">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {tireSize ? (
            <>
              Results Tires for: <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700">{tireSize}</span>
            </>
          ) : (
            'All Tires'
          )}
        </h2>
        <button
          type="button"
          className="lg:hidden flex items-center justify-center p-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
          aria-label="Show filters"
          onClick={() => setShowFilter(true)}
        >
          <span className="sr-only">Filters</span>
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span className="ml-1">Filters</span>
        </button>
      </div>

      {/* Right side - Sort and count */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500" aria-live="polite">
          Showing <span className="font-semibold text-gray-700">{resultsCount}</span> of{' '}
          <span className="font-semibold text-gray-700">{totalCount.toLocaleString('en-US')}</span> results
        </span>
        <select
          className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer transition-colors"
          value={sortOption}
          onChange={handleSortChange}
          aria-label="Sort results"
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default ResultsHeader;
