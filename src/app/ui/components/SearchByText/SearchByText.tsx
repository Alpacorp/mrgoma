'use client';

import { type ChangeEvent, useContext, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { TireDisplay } from '@/app/ui/components';

const cleanInput = (input: string): string => input.replace(/\D/g, '');

// Función que formatea el número según el patrón XXX/XX RXX
const formatTireSize = (numbers: string): string => {
  if (numbers.length <= 3) {
    return numbers;
  }
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 3)}/${numbers.slice(3, 5)}`;
  }
  return `${numbers.slice(0, 3)}/${numbers.slice(3, 5)}/${numbers.slice(5, 7)}`;
};

// Función de validación de formato
const isValidTireSize = (value: string): boolean => {
  return /^\d{3}\/\d{2}\sR\d{2}$/.test(value);
};

const SearchByText = () => {
  const [value, setValue] = useState('');

  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const cleanedInput = cleanInput(rawInput);
    const formattedInput = formatTireSize(cleanedInput);
    setValue(formattedInput);
    setSelectedFilters((prev: any) => ({
      ...prev,
      width: Number(formattedInput.slice(0, 3)),
      sidewall: Number(formattedInput.slice(4, 6)),
      diameter: Number(formattedInput.slice(7, 9)),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = /^[0-9/]$/;
    if (!allowedKeys.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) {
      window.location.href = `/catalog?query=${encodeURIComponent(value)}`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
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
                    onChange={handleChange}
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
      </div>
    </div>
  );
};

export default SearchByText;
