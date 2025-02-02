'use client';

import { FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { SearchBySizeContainer, SearchByTextContainer } from '@/app/ui/sections';

const SearchContainer: FC = () => {
  const [activeTab, setActiveTab] = useState<'size' | 'text'>('size');

  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const handleChangeTab = (tab: 'size' | 'text') => {
    setActiveTab(tab);
    setSelectedFilters({
      width: '',
      sidewall: '',
      diameter: '',
    });
  };

  return (
    <div className="container mx-auto py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Search Your Perfect Tire</h1>
        <p className="text-lg text-gray-600">
          You can purchase your tires on the view details page
        </p>
      </div>

      <div className="w-full">
        <div className="flex justify-center mb-8">
          <div className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleChangeTab('size')}
              className={`py-2 px-4 rounded-md transition-all ${
                activeTab === 'size' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Size
            </button>
            <button
              onClick={() => handleChangeTab('text')}
              className={`py-2 px-4 rounded-md transition-all ${
                activeTab === 'text' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Text
            </button>
          </div>
        </div>

        {activeTab === 'size' && <SearchBySizeContainer />}
        {activeTab === 'text' && <SearchByTextContainer />}
      </div>
    </div>
  );
};

export default SearchContainer;
