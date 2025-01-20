'use client';

import { useState } from 'react';

import { TopFilter } from '@/app/ui/sections';

const SearchTabs = () => {
  const [activeTab, setActiveTab] = useState<'size' | 'text'>('size');

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded">
          <button
            onClick={() => setActiveTab('size')}
            className={`py-2 px-4 rounded transition-colors ${
              activeTab === 'size' ? 'bg-[#00B207] text-white' : 'hover:bg-gray-200'
            }`}
          >
            SEARCH BY SIZE
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`py-2 px-4 rounded transition-colors ${
              activeTab === 'text' ? 'bg-[#00B207] text-white' : 'hover:bg-gray-200'
            }`}
          >
            SEARCH BY TEXT
          </button>
        </div>
      </div>
      {activeTab === 'size' ? <TopFilter /> : <div className="flex gap-2">test</div>}
    </div>
  );
};

export default SearchTabs;
