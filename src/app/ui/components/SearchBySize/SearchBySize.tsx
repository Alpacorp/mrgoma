'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { handleFilterAllChange as handleFilterAllChangeUtil, removeFilterAll, useTireSizeWithContext } from '@/app/hooks/useTireSizeWithContext';
import { ButtonSearch, DifferentSizesModal, TireDisplay } from '@/app/ui/components';
import { CarFront } from '@/app/ui/icons';
import { TireSize } from '@/app/ui/interfaces/tireSize';
import { SizeSelectors } from '@/app/ui/sections';
import { diameterDataMock, sidewallDataMock, widthDataMock } from '@/app/utils/tireSizeMockData';

const URL_PARAMS = {
  front: {
    width: 'w',
    sidewall: 's',
    diameter: 'd',
  },
  rear: {
    width: 'rw',
    sidewall: 'rs',
    diameter: 'rd',
  },
} as const;

const SearchBySize: FC = () => {
  const { selectedFilters } = useContext(SelectedFiltersContext);

  const [hasDifferentSizes, setHasDifferentSizes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    tireSize: frontTireSize,
    handleFilterChange: handleFrontTireChange,
    removeFilter: removeFrontTireFilter,
    isComplete: isFrontComplete,
  } = useTireSizeWithContext('front');

  const {
    tireSize: rearTireSize,
    updateTireSize: updateRearTireSize,
    handleFilterChange: handleRearTireChange,
    removeFilter: removeRearTireFilter,
    isComplete: isRearComplete,
  } = useTireSizeWithContext('rear');

  const router = useRouter();

  const handleFilterAllChange = (value: string, type: keyof TireSize, position: 'all' | 'rear') => {
    handleFilterAllChangeUtil(handleFrontTireChange, handleRearTireChange, value, type, position);
  };

  const removeFilter = (type: keyof TireSize, position: 'all' | 'rear') => {
    removeFilterAll(removeFrontTireFilter, removeRearTireFilter, type, position);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    const addTireParams = (
      tireData: TireSize,
      paramNames: typeof URL_PARAMS.front | typeof URL_PARAMS.rear
    ) => {
      Object.entries(tireData).forEach(([key, value]) => {
        if (value) {
          params.append(paramNames[key as keyof TireSize], value);
        }
      });
    };

    addTireParams(selectedFilters.front, URL_PARAMS.front);

    if (hasDifferentSizes) {
      addTireParams(selectedFilters.rear, URL_PARAMS.rear);
    }

    router.push(`/search-results?${params.toString()}`);
  };

  const handleDifferentSizesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasDifferentSizes(e.target.checked);
    if (!e.target.checked) {
      setIsModalOpen(false);
      updateRearTireSize({ width: '', sidewall: '', diameter: '' });
    } else {
      setIsModalOpen(true);
    }
  };

  const canSearch = isFrontComplete() && (!hasDifferentSizes || isRearComplete());

  const renderSizeSelectors = (position: 'all' | 'rear') => {
    const currentSize = position === 'all' ? frontTireSize : rearTireSize;

    return (
      <SizeSelectors
        currentSize={currentSize}
        position={position}
        width={widthDataMock}
        sidewall={sidewallDataMock}
        diameter={diameterDataMock}
        handleFilterChange={handleFilterAllChange}
        removeFilter={removeFilter}
      />
    );
  };

  return (
    <>
      <div className="flex gap-5 h-full w-full">
        <div className="w-full md:w-3/5">
          <div className="space-y-4">
            <div className="flex items-center">
              <CarFront className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-600 capitalize ml-1">All Tires</span>
            </div>
            {renderSizeSelectors('all')}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="differentSizes"
                checked={hasDifferentSizes}
                onChange={handleDifferentSizesChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="differentSizes" className="text-sm text-gray-600">
                Different sizes on front and rear?
              </label>
            </div>
            <ButtonSearch onClick={handleSearch} disabled={canSearch} />
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center flex-1">
          <TireDisplay />
        </div>
      </div>
      <DifferentSizesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setHasDifferentSizes(false);
        }}
        onSearch={handleSearch}
      />
    </>
  );
};

export default SearchBySize;
