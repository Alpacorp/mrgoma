'use client';

import { FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { SizeIcon, TextIcon } from '@/app/ui/icons';
import { SearchSection } from '@/app/ui/sections';

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
        <h1 className="text-3xl sm:text-4xl md:text-5xl uppercase font-extrabold text-white tracking-tight [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.45)]">
          The <span className="text-lime-400">Tires</span> you{' '}
          <span className="text-lime-400">need</span>
        </h1>
        <p className="text-2xl sm:text-3xl font-bold uppercase text-white tracking-tight">
          The <span className="text-lime-400">Price</span> you{' '}
          <span className="text-lime-400">want</span>
        </p>
      </div>

      <div className="w-full">
        <div className="flex justify-center">
          <div className="grid w-full max-w-2xl grid-cols-2 rounded-lg" role="tablist">
            <button
              onClick={() => handleChangeTab('size')}
              role="tab"
              aria-selected={activeTab === 'size'}
              className={`py-2 px-4 transition-all text-neutral-800 rounded-tl-3xl rounded-tr-3xl text-md cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                activeTab === 'size' ? 'bg-lime-400 ring-2 ring-lime-500' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 justify-center leading-none">
                <SizeIcon className="w-6 h-6" fill={activeTab === 'size' ? '#262626' : '#4B5563'} />{' '}
                Search by Size
              </div>
            </button>
            <button
              onClick={() => handleChangeTab('text')}
              role="tab"
              aria-selected={activeTab === 'text'}
              className={`py-2 px-4 transition-all text-neutral-800 rounded-tl-3xl rounded-tr-3xl text-md cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                activeTab === 'text' ? 'bg-lime-400 ring-2 ring-lime-500' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <TextIcon className="w-6 h-6" fill={activeTab === 'text' ? '#262626' : '#4B5563'} />{' '}
                Search by Text
              </div>
            </button>
          </div>
        </div>
        <SearchSection type={activeTab} />
      </div>
    </div>
  );
};

export default SearchContainer;
