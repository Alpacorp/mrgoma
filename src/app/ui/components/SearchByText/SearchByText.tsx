'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { ButtonSearch, TireDisplay } from '@/app/ui/components';
import { CarFront } from '@/app/ui/icons';
import { handleChange } from '@/app/utils/handleChangeInput';
import { handleKeyPress } from '@/app/utils/handleKeyPress';

const SearchByText: FC = () => {
  const [value, setValue] = useState('');
  const router = useRouter();

  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (value) {
      const [width, aspectRatio, diameter] = value.split('/').map(part => part.trim());
      const params = new URLSearchParams();

      if (width) params.append('w', width);
      if (aspectRatio) params.append('s', aspectRatio);
      if (diameter) params.append('d', diameter.replace(/[^0-9]/g, ''));

      router.push(`/search-results?${params.toString()}`);
    }
  };

  return (
    <div className="flex gap-5 w-full">
      <div className="w-full md:w-3/5">
        <div>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-4">
              <label
                htmlFor="tireSize"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <CarFront className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium text-gray-600 capitalize ml-1">
                  Tire Size
                </span>
              </label>
              <input
                id="tireSize"
                inputMode="numeric"
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
            <ButtonSearch type={'submit'} disabled={value.trim()} />
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
