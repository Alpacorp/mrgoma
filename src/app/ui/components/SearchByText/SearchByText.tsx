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
  const isComplete = /^\d{3}\/\d{2}\/\d{2}$/.test(value);
  const isInvalid = value.trim().length > 0 && !isComplete;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (isComplete) {
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
                autoFocus={true}
                id="tireSize"
                inputMode="numeric"
                type="text"
                placeholder="e.g. 255/55/18"
                autoComplete="off"
                title="Enter tire size as Width/Aspect/Diameter, e.g. 255/55/18"
                aria-describedby="tireSizeHelp tireSizeError"
                aria-invalid={isInvalid}
                value={value}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange({ event, setValue, setSelectedFilters })
                }
                onKeyDown={handleKeyPress}
                className={`w-full bg-white rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow border ${
                  isInvalid ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex items-center justify-between">
                <p id="tireSizeHelp" className="text-xs text-gray-600">
                  Enter size as Width/Aspect/Diameter (e.g., 255/55/18).
                </p>
                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('');
                      setSelectedFilters({ width: '', sidewall: '', diameter: '' });
                    }}
                    className="text-xs text-gray-600 cursor-pointer underline hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                    aria-describedby="tireSizeHelp"
                  >
                    Clear
                  </button>
                )}
              </div>
              {isInvalid && (
                <p id="tireSizeError" className="text-xs text-red-600">
                  Please complete the size as 3 digits / 2 digits / 2 digits.
                </p>
              )}
            </div>
            <ButtonSearch type={'submit'} disabled={isComplete} />
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
