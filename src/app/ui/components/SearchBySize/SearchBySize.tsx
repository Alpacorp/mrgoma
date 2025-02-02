'use client';

import { useRouter } from 'next/navigation';
import { FC, useContext } from 'react';

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

const SearchBySize: FC = () => {
  const { selectedFilters, setSelectedFilters } = useContext(SelectedFiltersContext);
  const router = useRouter();

  const handleFilterChange = (value: string, type: 'width' | 'sidewall' | 'diameter') => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const removeFilter = (type: 'width' | 'sidewall' | 'diameter') => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: '',
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedFilters.width) params.append('width', selectedFilters.width);
    if (selectedFilters.sidewall) params.append('sidewall', selectedFilters.sidewall);
    if (selectedFilters.diameter) params.append('diameter', selectedFilters.diameter);

    router.push(`/catalog?${params.toString()}`);
  };

  const allSelected = selectedFilters.width && selectedFilters.sidewall && selectedFilters.diameter;

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="w-full md:w-3/5 space-y-6 bg-gray-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Find by Measurements</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Width', options: section, type: 'width' },
              { label: 'Sidewall', options: aspectRatio, type: 'sidewall' },
              { label: 'Diameter', options: diameter, type: 'diameter' },
            ].map(field => (
              <div key={field.type} className="w-full">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {field.label}
                </label>
                <SelectDropdown
                  selectedFilters={selectedFilters}
                  handleFilterChange={handleFilterChange}
                  field={field}
                  key={field.type}
                  showDefaultText={false}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center rounded-full bg-green-50 border border-green-300 px-3 py-1 text-sm font-medium text-green-700"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                  <button
                    type="button"
                    onClick={() => removeFilter(key as keyof typeof selectedFilters)}
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

          <button
            onClick={handleSearch}
            className={`w-full py-3 text-lg font-medium rounded-lg transition-colors ${
              allSelected
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!allSelected}
          >
            {allSelected ? 'Search Tires' : 'Select all measurements'}
          </button>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1">
          <TireDisplay />
        </div>
      </div>
    </>
  );
};

export default SearchBySize;
