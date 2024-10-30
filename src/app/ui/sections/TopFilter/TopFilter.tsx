'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const section = [
  { id: 1, name: 4.8 },
  { id: 2, name: 5.3 },
  { id: 3, name: 5.7 },
];

const aspectRatio = [
  { id: 1, name: 6.5 },
  { id: 2, name: 8 },
  { id: 3, name: 8.5 },
];

const diameter = [
  { id: 1, name: 8 },
  { id: 2, name: 10 },
  { id: 3, name: 12 },
];

const activeFilters = [
  { value: 'Width', label: 'Width' },
  { value: 'AspectRatio', label: 'AspectRatio' },
  { value: 'Diameter', label: 'Diameter' },
];

function TopFilter() {
  const [sectionSelected, setSectionSelected] = useState({
    name: 'Select an option',
  });
  const [aspectRatioSelected, setAspectRatioSelected] = useState({
    name: 'Select an option',
  });
  const [diameterRatioSelected, setDiameterRatioSelected] = useState({
    name: 'Select an option',
  });

  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-2 justify-between items-start w-full">
      <div className="col-span-10">
        <form className="grid grid-cols-12 gap-2 sm:gap-2 justify-between items-end w-full">
          <Listbox value={sectionSelected} onChange={setSectionSelected}>
            <div className="relative col-span-12 sm:col-span-4">
              <Label className="block text-xs font-medium leading-6 text-gray-900">
                Width/Height
              </Label>
              <div className="flex items-start">
                <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900  ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
                  <span className="block truncate">{sectionSelected.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-green-primary"
                    />
                  </span>
                </ListboxButton>
              </div>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {section.map((section) => (
                  <ListboxOption
                    key={section.id}
                    value={section}
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
            value={aspectRatioSelected}
            onChange={setAspectRatioSelected}
          >
            <div className="relative col-span-12 sm:col-span-4">
              <Label className="block text-xs font-medium leading-6 text-gray-900">
                Aspect Ratio / Width
              </Label>
              <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
                <span className="block truncate">
                  {aspectRatioSelected.name}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-green-primary"
                  />
                </span>
              </ListboxButton>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {aspectRatio.map((aspectRatio) => (
                  <ListboxOption
                    key={aspectRatio.id}
                    value={aspectRatio}
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
            value={diameterRatioSelected}
            onChange={setDiameterRatioSelected}
          >
            <div className="relative col-span-12 sm:col-span-4">
              <Label className="block text-xs font-medium leading-6 text-gray-900">
                Wheel Diameter
              </Label>
              <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
                <span className="block truncate">
                  {diameterRatioSelected.name}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-green-primary"
                  />
                </span>
              </ListboxButton>

              <ListboxOptions
                transition
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
              >
                {diameter.map((diameter) => (
                  <ListboxOption
                    key={diameter.id}
                    value={diameter}
                    className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
                  >
                    <span className="block truncate font-normal group-data-[selected]:font-semibold">
                      {diameter.name}
                    </span>

                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                      <CheckIcon
                        aria-hidden="true"
                        className="h-5 w-5 text-green-primary"
                      />
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </form>
        <div>
          <div className="-m-1 flex items-center mt-2">
            {activeFilters.map((activeFilter) => (
              <span
                key={activeFilter.value}
                className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
              >
                <span className="block text-xs">{activeFilter.label}</span>
                <button
                  type="button"
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Remove filter for {activeFilter.label}
                  </span>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 8 8"
                    className="h-2 w-2"
                  >
                    <path
                      d="M1 1l6 6m0-6L1 7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-2 flex justify-end">
        <div className="w-36">
          <Image
            className="w-full"
            src="/assets/images/tireSize.png"
            width={200}
            height={200}
            alt="tire"
          />
        </div>
      </div>
    </div>
    // <form
    //   className="grid grid-cols-12 gap-2 sm:gap-2 justify-between items-end w-full"
    //   action=""
    // >
    //   <Listbox value={sectionSelected} onChange={setSectionSelected}>
    //     <div className="relative col-span-12 sm:col-span-4">
    //       <Label className="block text-xs font-medium leading-6 text-gray-900">
    //         Width/Height
    //       </Label>
    //       <div className="flex items-start">
    //         <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900  ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
    //           <span className="block truncate">{sectionSelected.name}</span>
    //           <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    //             <ChevronUpDownIcon
    //               aria-hidden="true"
    //               className="h-5 w-5 text-green-primary"
    //             />
    //           </span>
    //         </ListboxButton>
    //       </div>

    //       <ListboxOptions
    //         transition
    //         className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
    //       >
    //         {section.map((section) => (
    //           <ListboxOption
    //             key={section.id}
    //             value={section}
    //             className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
    //           >
    //             <span className="block truncate font-normal group-data-[selected]:font-semibold">
    //               {section.name}
    //             </span>

    //             <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
    //               <CheckIcon aria-hidden="true" className="h-5 w-5" />
    //             </span>
    //           </ListboxOption>
    //         ))}
    //       </ListboxOptions>
    //     </div>
    //   </Listbox>

    //   <Listbox value={aspectRatioSelected} onChange={setAspectRatioSelected}>
    //     <div className="relative col-span-12 sm:col-span-4">
    //       <Label className="block text-xs font-medium leading-6 text-gray-900">
    //         Aspect Ratio / Width
    //       </Label>
    //       <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
    //         <span className="block truncate">{aspectRatioSelected.name}</span>
    //         <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    //           <ChevronUpDownIcon
    //             aria-hidden="true"
    //             className="h-5 w-5 text-green-primary"
    //           />
    //         </span>
    //       </ListboxButton>

    //       <ListboxOptions
    //         transition
    //         className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
    //       >
    //         {aspectRatio.map((aspectRatio) => (
    //           <ListboxOption
    //             key={aspectRatio.id}
    //             value={aspectRatio}
    //             className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
    //           >
    //             <span className="block truncate font-normal group-data-[selected]:font-semibold">
    //               {aspectRatio.name}
    //             </span>

    //             <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
    //               <CheckIcon aria-hidden="true" className="h-5 w-5" />
    //             </span>
    //           </ListboxOption>
    //         ))}
    //       </ListboxOptions>
    //     </div>
    //   </Listbox>

    //   <Listbox
    //     value={diameterRatioSelected}
    //     onChange={setDiameterRatioSelected}
    //   >
    //     <div className="relative col-span-12 sm:col-span-4">
    //       <Label className="block text-xs font-medium leading-6 text-gray-900">
    //         Wheel Diameter
    //       </Label>
    //       <ListboxButton className="text-sm hover:ring-2 hover:ring-green-primary relative w-full cursor-default rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-primary sm:text-sm sm:leading-6">
    //         <span className="block truncate">{diameterRatioSelected.name}</span>
    //         <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    //           <ChevronUpDownIcon
    //             aria-hidden="true"
    //             className="h-5 w-5 text-green-primary"
    //           />
    //         </span>
    //       </ListboxButton>

    //       <ListboxOptions
    //         transition
    //         className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
    //       >
    //         {diameter.map((diameter) => (
    //           <ListboxOption
    //             key={diameter.id}
    //             value={diameter}
    //             className="text-sm group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-green-primary data-[focus]:text-white"
    //           >
    //             <span className="block truncate font-normal group-data-[selected]:font-semibold">
    //               {diameter.name}
    //             </span>

    //             <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-primary group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
    //               <CheckIcon
    //                 aria-hidden="true"
    //                 className="h-5 w-5 text-green-primary"
    //               />
    //             </span>
    //           </ListboxOption>
    //         ))}
    //       </ListboxOptions>
    //     </div>
    //   </Listbox>

    //   <div>
    //     <div className="-m-1 flex items-center">
    //       {activeFilters.map((activeFilter) => (
    //         <span
    //           key={activeFilter.value}
    //           className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
    //         >
    //           <span className="block text-xs">{activeFilter.label}</span>
    //           <button
    //             type="button"
    //             className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
    //           >
    //             <span className="sr-only">
    //               Remove filter for {activeFilter.label}
    //             </span>
    //             <svg
    //               fill="none"
    //               stroke="currentColor"
    //               viewBox="0 0 8 8"
    //               className="h-2 w-2"
    //             >
    //               <path
    //                 d="M1 1l6 6m0-6L1 7"
    //                 strokeWidth="1.5"
    //                 strokeLinecap="round"
    //               />
    //             </svg>
    //           </button>
    //         </span>
    //       ))}
    //     </div>
    //   </div>
    // </form>
  );
}

export default TopFilter;
