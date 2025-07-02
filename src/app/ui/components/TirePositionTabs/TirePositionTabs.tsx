'use client';

import React, { FC, Suspense } from 'react';

import { TirePositionTabsProps } from '@/app/ui/components/TirePositionTabs/tire-position-tabs';

/**
 * `TirePositionTabs` is a React functional component that renders tabs
 * for selecting tire positions (front or rear). It allows users to switch
 * between front and rear tire views, with the rear tab being conditionally
 * rendered based on the presence of rear tires.
 *
 * @param {TirePositionTabsProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered component.
 */
const TirePositionTabs: FC<TirePositionTabsProps> = ({ activeTab, setActiveTab, hasRearTires }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-6" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('front')}
          className={`py-4 px-1 relative font-medium text-sm cursor-pointer ${
            activeTab === 'front'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Front Tires
          <span
            className={`absolute -bottom-px left-0 w-full h-0.5 ${
              activeTab === 'front' ? 'bg-green-600' : 'bg-transparent'
            }`}
          />
        </button>
        {hasRearTires && (
          <Suspense fallback={<div>Loading...</div>}>
            <button
              onClick={() => setActiveTab('rear')}
              className={`py-4 px-1 relative font-medium text-sm cursor-pointer ${
                activeTab === 'rear'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Rear Tires
              <span
                className={`absolute -bottom-px left-0 w-full h-0.5 ${
                  activeTab === 'rear' ? 'bg-green-600' : 'bg-transparent'
                }`}
              />
            </button>
          </Suspense>
        )}
      </nav>
    </div>
  );
};

export default TirePositionTabs;
