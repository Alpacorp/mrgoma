import { FC } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';

import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

import { lateralItems } from '@/app/ui/sections/LateralFilters/LateralItems';
import { useLateralFilters } from '@/app/ui/sections/LateralFilters/hooks/useLateralFilters';

const LateralFilters: FC = () => {
  const { handleChange, rangeInputs } = useLateralFilters();

  return (
    <form>
      <h2 className="font-semibold mb-4 text-gray-900">Additional Filters</h2>
      <Disclosure
        defaultOpen={true}
        key={1}
        as="div"
        className="border-b border-gray-200 py-6"
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Price</span>
            <span className="ml-6 flex items-center text-green-primary">
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
              value={rangeInputs.price}
              onChange={handleChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure
        defaultOpen={true}
        key={2}
        as="div"
        className="border-b border-gray-200 py-6"
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Tread Depth</span>
            <span className="ml-6 flex items-center text-green-primary">
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
            <label htmlFor="treadDepth" className="text-sm text-gray-600">
              1.0/32 - {rangeInputs.treadDepth}/32
            </label>
            <input
              className="w-full"
              type="range"
              id="treadDepth"
              name="treadDepth"
              min="0"
              max="10"
              value={rangeInputs.treadDepth}
              onChange={handleChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure
        defaultOpen={true}
        key={3}
        as="div"
        className="border-b border-gray-200 py-6"
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Remaining life</span>
            <span className="ml-6 flex items-center text-green-primary">
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
            <label htmlFor="remainingLife" className="text-sm text-gray-600">
              1% - {rangeInputs.remainingLife}%
            </label>
            <input
              className="w-full"
              type="range"
              id="remainingLife"
              name="remainingLife"
              min="0"
              max="10"
              value={rangeInputs.remainingLife}
              onChange={handleChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
      {lateralItems.map((section) => (
        <Disclosure
          key={section.id}
          as="div"
          className="border-b border-gray-200 py-6"
        >
          <h3 className="-my-3 flow-root">
            <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
              <span className="font-medium text-gray-900">{section.name}</span>
              <span className="ml-6 flex items-center text-green-primary">
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
              {section.options.map((option, optionIdx) => (
                <div key={option.value} className="flex items-center">
                  <input
                    defaultValue={option.value}
                    defaultChecked={option.checked}
                    id={`filter-${section.id}-${optionIdx}`}
                    name={`${section.id}[]`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-green-primary focus:ring-green-primary"
                    onChange={handleChange}
                    value={option.value}
                  />
                  <label
                    htmlFor={`filter-${section.id}-${optionIdx}`}
                    className="ml-3 text-sm text-gray-600"
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
  );
};

export default LateralFilters;