'use client';

import { useRouter } from 'next/navigation';
import { FC, useContext } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { useTireSizeWithContext } from '@/app/hooks/useTireSizeWithContext';
import { ButtonSearch, TireDisplay } from '@/app/ui/components';
import { CarFront } from '@/app/ui/icons';
import { SizeSelectors } from '@/app/ui/sections';
import { diameterDataMock, sidewallDataMock, widthDataMock } from '@/app/utils/tireSizeMockData';

const URL_PARAMS = {
  width: 'w',
  sidewall: 's',
  diameter: 'd',
};

const SearchBySize: FC = () => {
  const { selectedFilters } = useContext(SelectedFiltersContext);

  const { tireSize, handleFilterChange, removeFilter, isComplete } = useTireSizeWithContext();

  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();

    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value && key in URL_PARAMS) {
        const paramName = URL_PARAMS[key as keyof typeof URL_PARAMS];
        params.append(paramName, value);
      }
    });

    router.push(`/search-results?${params.toString()}`);
  };

  const canSearch = isComplete();

  return (
    <>
      <div className="flex gap-5 w-full">
        <div className="w-full md:w-3/5">
          <div className="space-y-4">
            <div className="flex items-center">
              <CarFront className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-600 capitalize ml-1">Tire Size</span>
            </div>
            <SizeSelectors
              currentSize={tireSize}
              width={widthDataMock}
              sidewall={sidewallDataMock}
              diameter={diameterDataMock}
              handleFilterChange={handleFilterChange}
              removeFilter={removeFilter}
            />
            <ButtonSearch onClick={handleSearch} disabled={canSearch} />
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center flex-1">
          <TireDisplay />
        </div>
      </div>
    </>
  );
};

export default SearchBySize;
