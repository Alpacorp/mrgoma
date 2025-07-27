'use client';

import React, { FC, Suspense, useContext } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import { AdjustmentsHorizontalIcon } from '@/app/ui/components/Icons/Icons';
import { TirePosition } from '@/app/ui/components/TirePositionTabs/tire-position-tabs';

interface ResultsHeaderProps {
  activeTab: TirePosition;
  getTireSize: (position: TirePosition) => string;
  resultsCount: number;
  totalCount: number;
}

const ResultsHeader: FC<ResultsHeaderProps> = ({
  activeTab,
  getTireSize,
  resultsCount,
  totalCount,
}) => {
  const { setShowFilter } = useContext(ShowFilterContext);

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
          Showing {resultsCount} results / Total: {totalCount}
        </span>
        <select
          className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          defaultValue="featured"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default ResultsHeader;
