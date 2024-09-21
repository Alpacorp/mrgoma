import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';

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

function LateralFilters() {
  const [rangeInputs, setRangeInputs] = useState<any>({
    price: '0',
    treadDepth: '0',
    remainingLife: '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === 'price') {
      setRangeInputs({
        ...rangeInputs,
        price: value,
      });
    }
    if (name === 'treadDepth') {
      setRangeInputs({
        ...rangeInputs,
        treadDepth: value,
      });
    }
    if (name === 'remainingLife') {
      setRangeInputs({
        ...rangeInputs,
        remainingLife: value,
      });
    }
  };

  useEffect(() => {
    console.log('rangeInputs', rangeInputs);
  }, [rangeInputs]);
 //fixed a este con el ancho del padre que es el div de page y un div adentro con overflow scroll
  return (
    
    <form>
      <h2 className="font-semibold mb-4 text-gray-900">Filters</h2>
      <Disclosure defaultOpen={true} key={1} as="div" className="border-b border-gray-200 py-6">
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
            <label className="text-sm text-gray-600">
              $0 - ${rangeInputs.price}
            </label>
            <input
              className="w-full"
              type="range"
              name="price"
              min="0"
              max="10"
              value={rangeInputs.price}
              onChange={handleChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure defaultOpen={true}  key={2} as="div" className="border-b border-gray-200 py-6">
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
              1.0/32 - {rangeInputs.treadDepth}/32
            </label>
            <input
              className="w-full"
              type="range"
              id="points"
              name="treadDepth"
              min="0"
              max="10"
              value={rangeInputs.treadDepth}
              onChange={handleChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure defaultOpen={true}  key={3} as="div" className="border-b border-gray-200 py-6">
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Remaining life</span>
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
              1% - {rangeInputs.remainingLife}%
            </label>
            <input
              className="w-full"
              type="range"
              id="points"
              name="remainingLife"
              min="0"
              max="10"
              value={rangeInputs.remainingLife}
              onChange={handleChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
      {filters.map((section) => (
        <Disclosure
          key={section.id}
          as="div"
          className="border-b border-gray-200 py-6"
        >
          <h3 className="-my-3 flow-root">
            <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
              <span className="font-medium text-gray-900">{section.name}</span>
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
              {section.options.map((option, optionIdx) => (
                <div key={option.value} className="flex items-center">
                  <input
                    defaultValue={option.value}
                    defaultChecked={option.checked}
                    id={`filter-${section.id}-${optionIdx}`}
                    name={`${section.id}[]`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-greenPrimary focus:ring-greenPrimary"
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
}

export default LateralFilters;
