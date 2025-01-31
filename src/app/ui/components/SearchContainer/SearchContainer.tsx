'use client';

import { useState } from 'react';

import { SearchBySize, SearchByText } from '@/app/ui/components';

const SearchContainer = () => {
  const [activeTab, setActiveTab] = useState<'size' | 'text'>('size');

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
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
              onClick={() => setActiveTab('size')}
              className={`py-2 px-4 rounded-md transition-all ${
                activeTab === 'size' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Size
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`py-2 px-4 rounded-md transition-all ${
                activeTab === 'text' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Text
            </button>
          </div>
        </div>

        {activeTab === 'size' && <SearchBySize />}
        {activeTab === 'text' && <SearchByText />}
      </div>
    </div>
  );
};

export default SearchContainer;
