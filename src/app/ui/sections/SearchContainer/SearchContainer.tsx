'use client';

import { FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { SizeIcon, TextIcon } from '@/app/ui/icons';
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
    <div className="py-14">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-white [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.45)]">
          Search Your Perfect Tire
        </h1>
        <p className="text-lg text-white">You can purchase your tires on the view details page</p>
      </div>

      <div className="w-full">
        <div className="flex justify-center">
          <div className="grid w-full max-w-md grid-cols-2 rounded-lg">
            <button
              onClick={() => handleChangeTab('size')}
              className={`py-2 px-4 transition-all text-neutral-800 rounded-tl-3xl rounded-tr-3xl text-md ${
                activeTab === 'size' ? 'bg-lime-400' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <SizeIcon className="w-6 h-6" fill={activeTab === 'size' ? '#262626' : '#4B5563'} />{' '}
                Search by Size
              </div>
            </button>
            <button
              onClick={() => handleChangeTab('text')}
              className={`py-2 px-4 transition-all text-neutral-800 rounded-tl-3xl rounded-tr-3xl text-md ${
                activeTab === 'text' ? 'bg-lime-400' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <TextIcon className="w-6 h-6" fill={activeTab === 'text' ? '#262626' : '#4B5563'} />{' '}
                Search by Text
              </div>
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
