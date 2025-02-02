'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';

function MobileTopFilters({ children }: Readonly<{ children: React.ReactElement }>) {
  const [openDrop, setOpenDrop] = useState<boolean>(false);

  const handleDropDown = (state: boolean) => {
    setOpenDrop(!state);
  };

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <div className="flex items-center justify-between rounded ring-1 ring-gray-300 p-2 px-2">
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
        className="absolute left-0 right-0 z-10 mt-1 origin-top-right rounded-md py-4 bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div>{children}</div>
        <div className="">
          <MenuItem>
            <button className="block bg-cyan-600 w-full max-w-72 mx-auto rounded px-4 py-2.5 text-center text-sm text-white">
              Close
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default MobileTopFilters;
