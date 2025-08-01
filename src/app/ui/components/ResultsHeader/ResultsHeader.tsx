'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { FC, Suspense, useCallback, useContext, useEffect, useState } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import { AdjustmentsHorizontalIcon } from '@/app/ui/components/Icons/Icons';
import { TirePosition } from '@/app/ui/components/TirePositionTabs/tire-position-tabs';

interface ResultsHeaderProps {
  activeTab: TirePosition;
  getTireSize: (position: TirePosition) => string;
  resultsCount: number;
  totalCount: number;
}

/**
 * ResultsHeader component displays the header section for tire search results,
 * including the current tire size, filter button for mobile, results count,
 * and sorting options for price.
 */
const ResultsHeader: FC<ResultsHeaderProps> = ({
  activeTab,
  getTireSize,
  resultsCount,
  totalCount,
}) => {
  const { setShowFilter } = useContext(ShowFilterContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOption, setSortOption] = useState('');

  // Initialize sort option from URL on component mount
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

  return (
    <div className="flex flex-wrap gap-2 justify-center lg:justify-between items-center mt-6">
      <h2 className="text-lg text-gray-600">
        Results for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tires:{' '}
        {
          <Suspense fallback={<div>Loading...</div>}>
            <strong>{getTireSize(activeTab)}</strong>
          </Suspense>
        }
      </h2>
      <div className="flex items-center gap-2">
        {/* Filter button - only visible on mobile */}
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          className="lg:hidden flex items-center justify-center p-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
          aria-label="Show filters"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span className="ml-1">Filters</span>
        </button>
        <span className="text-sm text-gray-600">
          Showing {resultsCount} of {totalCount.toLocaleString('en-US')} results
        </span>
        <select
          className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
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
