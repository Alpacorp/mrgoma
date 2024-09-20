import React from 'react';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

const filters = [
  {
    id: 'condition',
    name: 'Condition',
    options: [
      { value: 'new', label: 'New', checked: false },
      { value: 'used', label: 'Used', checked: false },
    ],
  },
  {
    id: 'patched',
    name: 'Pathched',
    options: [
      { value: 'yes', label: 'Yes', checked: false },
      { value: 'no', label: 'No', checked: false },
    ],
  },
  {
    id: 'brands',
    name: 'Brands',
    options: [{ value: 'selectAll', label: 'Select All', checked: false }],
  },
];

function MobileLateralFilters({
  x,
  y,
}: {
  x: boolean;
  y: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={x} onClose={y} className="relative z-40 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 z-40 flex">
        {/* Filters  Mobile*/}
        <DialogPanel
          transition
          className="relative ml-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
        >
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-medium text-gray-900">
              Filters Mobile
            </h2>
            <button
              type="button"
              onClick={() => y(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-greenPrimary"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          {/* Filters  Mobile otro*/}
          <form className="mt-4">
            <Disclosure
              key={1}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Price</span>
                  <span className="ml-6 flex items-center text-greenPrimary">
                    <PlusIcon
                      aria-hidden="true"
                      className="h-5 w-5 group-data-[open]:hidden"
                    />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  <label className="text-sm text-gray-600">$0 - $0</label>
                  <input
                    className="w-full"
                    type="range"
                    name="points"
                    min="0"
                    max="10"
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure
              key={1}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Tread Depth</span>
                  <span className="ml-6 flex items-center text-greenPrimary">
                    <PlusIcon
                      aria-hidden="true"
                      className="h-5 w-5 group-data-[open]:hidden"
                    />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  <label className="text-sm text-gray-600">
                    1.0/32 - 15.0/32
                  </label>
                  <input
                    className="w-full"
                    type="range"
                    name="points"
                    min="0"
                    max="10"
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure
              key={1}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">
                    Remaining life
                  </span>
                  <span className="ml-6 flex items-center text-greenPrimary">
                    <PlusIcon
                      aria-hidden="true"
                      className="h-5 w-5 group-data-[open]:hidden"
                    />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  <label className="text-sm text-gray-600">1% - 100%</label>
                  <input
                    className="w-full"
                    type="range"
                    name="points"
                    min="0"
                    max="10"
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
            {filters.map((section) => (
              <Disclosure
                key={section.id}
                as="div"
                className="border-t border-gray-200 px-4 py-6"
              >
                <h3 className="-mx-2 -my-3 flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-greenPrimary">
                    <span className="font-medium text-gray-900 text-sm">
                      {section.name}
                    </span>
                    <span className="ml-6 flex items-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="h-5 w-5 group-data-[open]:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel className="pt-6">
                  <div className="space-y-6">
                    {section.options.map((option, optionIdx) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          defaultValue={option.value}
                          defaultChecked={option.checked}
                          id={`filter-mobile-${section.id}-${optionIdx}`}
                          name={`${section.id}[]`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-greenPrimary focus:ring-greenPrimary"
                        />
                        <label
                          htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                          className="ml-3 min-w-0 flex-1 text-gray-500 text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default MobileLateralFilters;
