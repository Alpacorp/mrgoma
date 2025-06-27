'use client';

import React, { FC, Suspense } from 'react';

import { TirePosition } from '../TirePositionTabs/TirePositionTabs';

interface ResultsHeaderProps {
  activeTab: TirePosition;
  getTireSize: (position: TirePosition) => string;
  resultsCount: number;
}

const ResultsHeader: FC<ResultsHeaderProps> = ({
  activeTab,
  getTireSize,
  resultsCount
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center lg:justify-between items-center mt-6">
      <h2 className="text-lg text-gray-600">
        Results for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{' '}
        Tires:{' '}
        {
          <Suspense fallback={<div>Loading...</div>}>
            {getTireSize(activeTab)}
          </Suspense>
        }
      </h2>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Showing {resultsCount} results
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
