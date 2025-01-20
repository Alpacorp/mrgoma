import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useContext } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import { SearchBar } from '@/app/ui/sections';
import { useLateralFilters } from '@/app/ui/sections/LateralFilters/hooks/useLateralFilters';
import { lateralItems } from '@/app/ui/sections/LateralFilters/LateralItems';

function MobileLateralFilters() {
  const { showFilter, setShowFilter } = useContext(ShowFilterContext);
  const { handleChange, rangeInputs } = useLateralFilters();

  return (
    <Dialog
      open={showFilter}
      onClose={() => setShowFilter(false)}
      className="relative z-40 lg:hidden"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 z-40 flex">
        <DialogPanel
          transition
          className="relative ml-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
        >
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-medium text-gray-900">Additional Filters</h2>
            <button
              type="button"
              onClick={() => setShowFilter(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-green-primary"
            >
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <form className="mt-4">
            <Disclosure
              defaultOpen={true}
              key={1}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Price</span>
                  <span className="ml-6 flex items-center text-green-primary">
                    <PlusIcon aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  <label htmlFor="price" className="text-sm text-gray-600">
                    $0 - ${rangeInputs.price}
                  </label>
                  <input
                    className="w-full"
                    type="range"
                    id="price"
                    name="price"
                    min="0"
                    max="10"
                    onChange={handleChange}
                    value={rangeInputs.price}
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure
              defaultOpen={true}
              key={1}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Tread Depth</span>
                  <span className="ml-6 flex items-center text-green-primary">
                    <PlusIcon aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  <label htmlFor="treadDepth" className="text-sm text-gray-600">
                    1.0/32 - {rangeInputs.treadDepth}/32
                  </label>
                  <input
                    id="treadDepth"
                    name="treadDepth"
                    className="w-full"
                    type="range"
                    min="0"
                    max="10"
                    onChange={handleChange}
                    value={rangeInputs.treadDepth}
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure
              defaultOpen={true}
              key={1}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Remaining life</span>
                  <span className="ml-6 flex items-center text-green-primary">
                    <PlusIcon aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4">
                  <label htmlFor="remainingLife" className="text-sm text-gray-600">
                    0% - {rangeInputs.remainingLife}%
                  </label>
                  <input
                    className="w-full"
                    type="range"
                    id="remainingLife"
                    name="remainingLife"
                    min="0"
                    max="10"
                    onChange={handleChange}
                    value={rangeInputs.remainingLife}
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
            {lateralItems.map(section => (
              <Disclosure key={section.id} as="div" className="border-t border-gray-200 px-4 py-6">
                <h3 className="-mx-2 -my-3 flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-green-primary">
                    <span className="font-medium text-gray-900 text-sm">{section.name}</span>
                    <span className="ml-6 flex items-center">
                      <PlusIcon aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
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
                          className="h-4 w-4 rounded border-gray-300 text-green-primary focus:ring-green-primary"
                          onChange={handleChange}
                          value={option.value}
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
            <Disclosure
              defaultOpen={true}
              key={3}
              as="div"
              className="border-t border-gray-200 py-6 px-4"
            >
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">Search by text</span>
                  <span className="ml-6 flex items-center text-green-primary">
                    <PlusIcon aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                    />
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <SearchBar />
              </DisclosurePanel>
            </Disclosure>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default MobileLateralFilters;
