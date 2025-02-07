'use client';

import { CarFront, CarIcon as CarRear } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { SelectDropdown } from '@/app/ui/components';
import TireDisplay from '@/app/ui/components/TireDisplay/TireDisplay';

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

interface TireSize {
  width: string;
  sidewall: string;
  diameter: string;
}

const SearchBySize: FC = () => {
  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const [hasDifferentSizes, setHasDifferentSizes] = useState(false);
  const [frontTireSize, setFrontTireSize] = useState<TireSize>({
    width: '',
    sidewall: '',
    diameter: '',
  });
  const [rearTireSize, setRearTireSize] = useState<TireSize>({
    width: '',
    sidewall: '',
    diameter: '',
  });

  const router = useRouter();

  const handleFilterChange = (value: string, type: keyof TireSize, position: 'all' | 'rear') => {
    if (position === 'all') {
      setFrontTireSize(prev => ({ ...prev, [type]: value }));
    } else {
      setRearTireSize(prev => ({ ...prev, [type]: value }));
    }
    setSelectedFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const removeFilter = (type: keyof TireSize, position: 'all' | 'rear') => {
    if (position === 'all') {
      setFrontTireSize(prev => ({ ...prev, [type]: '' }));
      if (!hasDifferentSizes) {
        setRearTireSize(prev => ({ ...prev, [type]: '' }));
      }
    } else {
      setRearTireSize(prev => ({ ...prev, [type]: '' }));
    }
    setSelectedFilters(prev => ({
      ...prev,
      [type]: '',
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    // Add all tire parameters
    if (frontTireSize.width) params.append('w', frontTireSize.width);
    if (frontTireSize.sidewall) params.append('s', frontTireSize.sidewall);
    if (frontTireSize.diameter) params.append('d', frontTireSize.diameter);

    // Add rear tire parameters if different sizes are selected
    if (hasDifferentSizes) {
      if (rearTireSize.width) params.append('rw', rearTireSize.width);
      if (rearTireSize.sidewall) params.append('rs', rearTireSize.sidewall);
      if (rearTireSize.diameter) params.append('rd', rearTireSize.diameter);
    }

    router.push(`/search-results?${params.toString()}`);
  };

  const allFieldsSelected = (size: TireSize) => {
    return size.width && size.sidewall && size.diameter;
  };

  const canSearch =
    allFieldsSelected(frontTireSize) && (!hasDifferentSizes || allFieldsSelected(rearTireSize));

  const renderSizeSelectors = (position: 'all' | 'rear') => {
    const currentSize = position === 'all' ? frontTireSize : rearTireSize;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          {position === 'all' ? (
            <CarFront className="w-5 h-5 text-gray-600" />
          ) : (
            <CarRear className="w-5 h-5 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-600 capitalize">{position} Tires</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Width', options: section, type: 'width' as const },
            { label: 'Sidewall', options: aspectRatio, type: 'sidewall' as const },
            { label: 'Diameter', options: diameter, type: 'diameter' as const },
          ].map(field => (
            <div key={`${position}-${field.type}`} className="w-full">
              <label className="text-sm font-medium text-gray-700 mb-2 block">{field.label}</label>
              <SelectDropdown
                selectedFilters={currentSize}
                handleFilterChange={value => handleFilterChange(value, field.type, position)}
                field={field}
                showDefaultText={false}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(currentSize).map(([key, value]) => {
            if (!value) return null;
            return (
              <span
                key={`${position}-${key}`}
                className="inline-flex items-center rounded-full bg-green-50 border border-green-300 px-3 py-1 text-sm font-medium text-green-700"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                <button
                  type="button"
                  onClick={() => removeFilter(key as keyof TireSize, position)}
                  className="ml-1 inline-flex items-center rounded-full bg-green-50 p-1 text-green-700 hover:bg-green-100"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Remove {key} filter</span>
                </button>
              </span>
            );
          })}
        </div>
      </div>
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

          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className={`w-full py-3 text-lg font-medium rounded-lg transition-colors ${
              canSearch
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canSearch ? 'Search Tires' : 'Select all measurements'}
          </button>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center flex-1 mt-8">
        <TireDisplay />
      </div>
    </div>
  );
};

export default SearchBySize;
