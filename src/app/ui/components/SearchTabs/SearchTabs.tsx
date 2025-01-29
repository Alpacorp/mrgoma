'use client';

import React, { useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import TireDisplay from '@/app/ui/components/TireDisplay/TireDisplay';
import { TireSearchInput } from '@/app/ui/components/TireSearchInput/TireSearchInput';
import { TopFilter } from '@/app/ui/sections';

const SearchTabs = () => {
  const [activeTab, setActiveTab] = useState<'size' | 'text'>('size');

  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  return (
    <section className="flex items-start">
      <div className="w-full max-w-4xl mx-auto p-2">
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded">
            <button
              onClick={() => {
                setActiveTab('size');
                setSelectedFilters((prev: any) => ({
                  ...prev,
                  width: '',
                  sidewall: '',
                  diameter: '',
                }));
              }}
              className={`py-2 px-4 rounded transition-colors ${
                activeTab === 'size' ? 'bg-[#00B207] text-white' : 'hover:bg-gray-200'
              }`}
            >
              SEARCH BY SIZE
            </button>
            <button
              onClick={() => {
                setActiveTab('text');
                setSelectedFilters((prev: any) => ({
                  ...prev,
                  width: '',
                  sidewall: '',
                  diameter: '',
                }));
              }}
              className={`py-2 px-4 rounded transition-colors ${
                activeTab === 'text' ? 'bg-[#00B207] text-white' : 'hover:bg-gray-200'
              }`}
            >
              SEARCH BY TEXT
            </button>
          </div>
        </div>
        {activeTab === 'size' ? (
          <TopFilter />
        ) : (
          <div className="flex gap-2">
            <TireSearchInput />
          </div>
        )}
      </div>
      <div>
        <TireDisplay />
      </div>
    </section>
  );
};

export default SearchTabs;
