'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import React, { useContext } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';

interface FilterOption {
  id: number;
  name: number;
}

const section: FilterOption[] = [
  { id: 1, name: 250 },
  { id: 2, name: 255 },
  { id: 3, name: 300 },
];

const aspectRatio: FilterOption[] = [
  { id: 1, name: 6.5 },
  { id: 2, name: 8.5 },
  { id: 3, name: 8.9 },
];

const diameter: FilterOption[] = [
  { id: 1, name: 8 },
  { id: 2, name: 10 },
  { id: 3, name: 12 },
];

function TopFilter() {
  // const [selectedFilters, setSelectedFilters] = useState({
  //   width: '',
  //   sidewall: '',
  //   diameter: '',
  // });

  const { selectedFilters, setSelectedFilters } = useContext(SelectedFiltersContext);

  const handleFilterChange = (value: string, type: 'width' | 'sidewall' | 'diameter') => {
    setSelectedFilters((prev: any) => ({
      ...prev,
      [type]: value,
    }));
  };

  const removeFilter = (type: 'width' | 'sidewall' | 'diameter') => {
    setSelectedFilters((prev: any) => ({
      ...prev,
      [type]: '',
    }));
  };

  return (
    <div className="flex flex-col md:flex-row justify-evenly items-start w-full">
      <div className="flex flex-col gap-10 w-full md:w-auto mb-4 md:mb-0">
        <form className="flex flex-col md:flex-row gap-2 md:gap-4 items-end">
          <Listbox
            value={selectedFilters.width}
            onChange={value => handleFilterChange(value, 'width')}
          >
            <div className="relative w-full md:w-32">
              <div className="flex items-start">
                <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900  ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
                  <span className="block truncate">
                    {selectedFilters.width ? selectedFilters.width : 'Width'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-green-primary" />
                  </span>
                </ListboxButton>
              </div>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {section.map(section => (
                  <ListboxOption
                    key={section.id}
                    value={section.name}
                    className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
                  >
                    <span className="block truncate font-normal group-data-[selected]:font-semibold">
                      {section.name}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
          <Listbox
            value={selectedFilters.sidewall}
            onChange={value => handleFilterChange(value, 'sidewall')}
          >
            <div className="relative w-full md:w-32">
              <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
                <span className="block truncate">
                  {selectedFilters.sidewall ? selectedFilters.sidewall : 'Sidewall'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-green-primary" />
                </span>
              </ListboxButton>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {aspectRatio.map(aspectRatio => (
                  <ListboxOption
                    key={aspectRatio.id}
                    value={aspectRatio.name}
                    className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
                  >
                    <span className="block truncate font-normal group-data-[selected]:font-semibold">
                      {aspectRatio.name}
                    </span>

                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
          <Listbox
            value={selectedFilters.diameter}
            onChange={value => handleFilterChange(value, 'diameter')}
          >
            <div className="relative w-full md:w-32">
              <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
                <span className="block truncate">
                  {selectedFilters.diameter ? selectedFilters.diameter : 'Diameter'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-green-primary" />
                </span>
              </ListboxButton>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {diameter.map(diameter => (
                  <ListboxOption
                    key={diameter.id}
                    value={diameter.name}
                    className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
                  >
                    <span className="block truncate font-normal group-data-[selected]:font-semibold">
                      {diameter.name}
                    </span>

                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                      <CheckIcon aria-hidden="true" className="h-5 w-5 text-green-primary" />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </form>
        <div>
          <div className="-m-1 flex items-center justify-center mt-2">
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
                >
                  <span className="block text-xs">
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                  </span>
                  <button
                    type="button"
                    className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                    onClick={() => removeFilter(key as keyof typeof selectedFilters)}
                  >
                    <span className="sr-only">Remove {key} filter </span>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 8 8" className="h-2 w-2">
                      <path d="M1 1l6 6m0-6L1 7" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopFilter;
