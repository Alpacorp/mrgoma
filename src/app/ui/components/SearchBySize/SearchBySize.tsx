'use client';

import { useRouter } from 'next/navigation';
import { FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { ButtonSearch } from '@/app/ui/components';
import TireDisplay from '@/app/ui/components/TireDisplay/TireDisplay';
import { TireSize } from '@/app/ui/interfaces/tireSize';
import { SizeSelectors } from '@/app/ui/sections/SizeSelectors/SizeSelectors';

interface FilterOption {
  id: number;
  name: number;
}

const section: FilterOption[] = [
  { id: 1, name: 195 },
  { id: 2, name: 200 },
  { id: 3, name: 210 },
  { id: 4, name: 215 },
  { id: 5, name: 220 },
  { id: 6, name: 225 },
  { id: 7, name: 230 },
  { id: 8, name: 235 },
  { id: 9, name: 240 },
  { id: 10, name: 245 },
  { id: 11, name: 250 },
  { id: 12, name: 255 },
  { id: 13, name: 260 },
  { id: 14, name: 265 },
  { id: 15, name: 270 },
];

const aspectRatio: FilterOption[] = [
  { id: 1, name: 10 },
  { id: 2, name: 20 },
  { id: 3, name: 30 },
  { id: 4, name: 40 },
  { id: 5, name: 50 },
];

const diameter: FilterOption[] = [
  { id: 1, name: 8 },
  { id: 2, name: 10 },
  { id: 3, name: 12 },
  { id: 4, name: 14 },
  { id: 5, name: 16 },
];

const SearchBySize: FC = () => {
  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const [hasDifferentSizes, setHasDifferentSizes] = useState(false);
  const [tireSizes, setTireSizes] = useState<{
    front: TireSize;
    rear: TireSize;
  }>({
    front: { width: '', sidewall: '', diameter: '' },
    rear: { width: '', sidewall: '', diameter: '' },
  });

  const router = useRouter();

  const handleFilterChange = (value: string, type: keyof TireSize, position: 'all' | 'rear') => {
    setTireSizes(prev => ({
      ...prev,
      [position === 'all' ? 'front' : 'rear']: {
        ...prev[position === 'all' ? 'front' : 'rear'],
        [type]: value,
      },
    }));
    setSelectedFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const removeFilter = (type: keyof TireSize, position: 'all' | 'rear') => {
    setTireSizes(prev => ({
      ...prev,
      [position === 'all' ? 'front' : 'rear']: {
        ...prev[position === 'all' ? 'front' : 'rear'],
        [type]: '',
      },
    }));
    setSelectedFilters(prev => ({
      ...prev,
      [type]: '',
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    const { front, rear } = tireSizes;
    // Add all tire parameters
    if (front.width) params.append('w', front.width);
    if (front.sidewall) params.append('s', front.sidewall);
    if (front.diameter) params.append('d', front.diameter);

    // Add rear tire parameters if different sizes are selected
    if (hasDifferentSizes) {
      if (rear.width) params.append('rw', rear.width);
      if (rear.sidewall) params.append('rs', rear.sidewall);
      if (rear.diameter) params.append('rd', rear.diameter);
    }

    router.push(`/search-results?${params.toString()}`);
  };

  const allFieldsSelected = (size: TireSize) => {
    return size.width && size.sidewall && size.diameter;
  };

  const canSearch =
    allFieldsSelected(tireSizes.front) && (!hasDifferentSizes || allFieldsSelected(tireSizes.rear));

  const renderSizeSelectors = (position: 'all' | 'rear') => {
    const currentSize = position === 'all' ? tireSizes.front : tireSizes.rear;

    return (
      <SizeSelectors
        currentSize={currentSize}
        position={position}
        section={section}
        aspectRatio={aspectRatio}
        diameter={diameter}
        handleFilterChange={handleFilterChange}
        removeFilter={removeFilter}
      />
    );
  };

  return (
    <div className="flex w-full max-w-6xl mx-auto">
      <div className="bg-white p-8 w-full md:w-3/5 rounded-xl shadow-sm border border-gray-100">
        <div className="space-y-6">
          {renderSizeSelectors('all')}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="differentSizes"
              checked={hasDifferentSizes}
              onChange={e => setHasDifferentSizes(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="differentSizes" className="text-sm text-gray-600">
              Different sizes on front and rear?
            </label>
          </div>
          {hasDifferentSizes && (
            <div className="pt-4 border-t border-gray-100">{renderSizeSelectors('rear')}</div>
          )}
          <ButtonSearch onClick={handleSearch} disabled={canSearch} />
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center flex-1 mt-8">
        <TireDisplay />
      </div>
    </div>
  );
};

export default SearchBySize;
