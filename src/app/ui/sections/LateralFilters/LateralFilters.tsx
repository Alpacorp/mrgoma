'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';
import { FC, useState } from 'react';

import { RangeSlider } from '@/app/ui/components';

interface RangeInputs {
  price: [number, number];
  treadDepth: [number, number];
}

const LateralFilters: FC = () => {
  const [rangeInputs, setRangeInputs] = useState<RangeInputs>({
    price: [0, 50],
    treadDepth: [1, 32],
  });

  const handleTreadDepthChange = (value: [number, number]) => {
    setRangeInputs(prev => ({ ...prev, treadDepth: value }));
  };

  return (
    <form>
      <h2 className="font-semibold mb-4 text-gray-900">Additional Filters</h2>
      <Disclosure defaultOpen={true} key={1} as="div" className="border-b border-gray-200 py-6">
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{rangeInputs.treadDepth[0]}/32</span>
              <span className="text-sm text-gray-600">{rangeInputs.treadDepth[1]}/32</span>
            </div>
            <RangeSlider
              min={1}
              max={32}
              step={1}
              value={rangeInputs.treadDepth}
              onChange={handleTreadDepthChange}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>
    </form>
  );
};

export default LateralFilters;
