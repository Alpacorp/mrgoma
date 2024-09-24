import React, { useState } from 'react';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

function MobileTopFilters({
  children,
}: Readonly<{ children: React.ReactElement }>) {
  const [openDrop, setOpenDrop] = useState<boolean>(false);

  const handleDropDown = (state: boolean) => {
    setOpenDrop(!state);
  };

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <div className="flex items-center justify-between rounded-xl ring-1 ring-gray-300 p-2 px-2">
        <p className="font-medium text-sm text-gray-900">Select Tire</p>
        <MenuButton
          onClick={() => handleDropDown(openDrop)}
          className="flex items-center rounded-full bg-green-primary text-white focus:outline-none focus:ring-offset-green-primary"
        >
          <span className="sr-only">Open options</span>
          {openDrop ? (
            <ChevronUpIcon aria-hidden="true" className="h-6 w-6" />
          ) : (
            <ChevronDownIcon aria-hidden="true" className="h-6 w-6" />
          )}
        </MenuButton>
      </div>
      <MenuItems
        transition
        className="absolute left-0 right-0 z-10 mt-2 origin-top-right rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">{children}</div>
        <div className="flex">
          <MenuItem>
            {/* <button className="block  bg-red-600 w-6/12  px-4 py-2 text-center text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"></button> */}
            <button className="block  bg-black w-6/12  px-4 py-2.5 text-center text-sm text-white">
              Close
            </button>
          </MenuItem>
          <button className="block bg-indigo-600 w-6/12 px-4 py-2.5 text-center text-sm text-white">
            ResetFilters
          </button>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default MobileTopFilters;
