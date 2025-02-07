'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { TireDisplay } from '@/app/ui/components';
import { handleChange } from '@/app/utils/handleChangeInput';
import { handleKeyPress } from '@/app/utils/handleKeyPress';

const SearchByText: FC = () => {
  const [value, setValue] = useState('');
  const router = useRouter();

  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (value) {
      const [width, aspectRatio, diameter] = value.split('/').map(part => part.trim());
      const params = new URLSearchParams();

      if (width) params.append('w', width);
      if (aspectRatio) params.append('s', aspectRatio);
      if (diameter) params.append('d', diameter.replace(/[^0-9]/g, '')); // Remove 'R' if present

      router.push(`/search-results?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="w-full md:w-3/5 space-y-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Search</h3>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="tireSize" className="text-sm font-medium text-gray-700 block">
                Tire Size
              </label>
              <input
                id="tireSize"
                type="text"
                placeholder="e.g. 255/55R18"
                value={value}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange({ event, setValue, setSelectedFilters })
                }
                onKeyDown={handleKeyPress}
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600">
                Enter the tire size in the format: Width/AspectRatio R Diameter
              </p>
            </div>
            <button
              type="submit"
              className={`w-full py-3 text-lg font-medium rounded-lg transition-colors ${
                value.trim()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!value.trim()}
            >
              Search Tires
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1">
        <div className="relative">
          <TireDisplay />
        </div>
      </div>
    </div>
  );
};

export default SearchByText;
