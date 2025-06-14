'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { useTireSize } from '@/app/hooks/useTireSize';
import { ButtonSearch, DifferentSizesModal, TireDisplay } from '@/app/ui/components';
import { CarFront } from '@/app/ui/icons';
import { TireSize } from '@/app/ui/interfaces/tireSize';
import { SizeSelectors } from '@/app/ui/sections';
import { diameterDataMock, sidewallDataMock, widthDataMock } from '@/app/utils/tireSizeMockData';

const SearchBySize: FC = () => {
  const { setSelectedFilters, selectedFilters } = useContext(SelectedFiltersContext);

  const [hasDifferentSizes, setHasDifferentSizes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    tireSize: frontTireSize,
    handleFilterChange: handleFrontTireChange,
    removeFilter: removeFrontTireFilter,
    isComplete: isFrontComplete,
  } = useTireSize();

  const {
    tireSize: rearTireSize,
    updateTireSize: updateRearTireSize,
    handleFilterChange: handleRearTireChange,
    removeFilter: removeRearTireFilter,
    isComplete: isRearComplete,
  } = useTireSize();

  const router = useRouter();

  // Adapter functions to match the expected interface
  const handleFilterChange = (value: string, type: keyof TireSize, position: 'all' | 'rear') => {
    if (position === 'all') {
      handleFrontTireChange(value, type);

      // Update selected filters context for the front tire
      setSelectedFilters(prev => ({
        ...prev,
        front: {
          ...prev.front,
          [type]: value,
        },
      }));
    } else {
      handleRearTireChange(value, type);
      // Update selected filters context for the rear tire
      setSelectedFilters(prev => ({
        ...prev,
        rear: {
          ...prev.rear,
          [type]: value,
        },
      }));
    }
  };

  const removeFilter = (type: keyof TireSize, position: 'all' | 'rear') => {
    if (position === 'all') {
      removeFrontTireFilter(type);
      // Update selected filters context for the front tire
      setSelectedFilters(prev => ({
        ...prev,
        front: {
          ...prev.front,
          [type]: '',
        },
      }));
    } else {
      removeRearTireFilter(type);
      // Update selected filters context for the rear tire
      setSelectedFilters(prev => ({
        ...prev,
        rear: {
          ...prev.rear,
          [type]: '',
        },
      }));
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedFilters.front.width) params.append('w', selectedFilters.front.width);
    if (selectedFilters.front.sidewall) params.append('s', selectedFilters.front.sidewall);
    if (selectedFilters.front.diameter) params.append('d', selectedFilters.front.diameter);

    if (hasDifferentSizes) {
      if (selectedFilters.rear.width) params.append('rw', selectedFilters.rear.width);
      if (selectedFilters.rear.sidewall) params.append('rs', selectedFilters.rear.sidewall);
      if (selectedFilters.rear.diameter) params.append('rd', selectedFilters.rear.diameter);
    }

    router.push(`/search-results?${params.toString()}`);
  };

  const handleDifferentSizesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasDifferentSizes(e.target.checked);
    if (!e.target.checked) {
      setIsModalOpen(false);
      // Reset rear tire sizes if different sizes are not selected
      updateRearTireSize({ width: '', sidewall: '', diameter: '' });
    } else {
      // Open modal to select different sizes
      setIsModalOpen(true);
      // Keep the front tire sizes as is
    }
  };

  // Use the isComplete functions from the hooks
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
        handleFilterChange={handleFilterChange}
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
        frontTires={frontTireSize}
        rearTires={rearTireSize}
        onSearch={handleSearch}
      />
    </>
  );
};

export default SearchBySize;
