import React, { FC } from 'react';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

import {
  TireInformationProps,
  SingleTireDetails,
} from '@/app/interfaces/tires';

const TireFeatures: FC<TireInformationProps> = ({ singleTire }) => {
  return (
    <div aria-labelledby="details-heading">
      <h2 id="details-heading" className="sr-only">
        Additional details
      </h2>

      <div className="divide-y divide-gray-200 border-t">
        {singleTire.details.map((detail: SingleTireDetails, index: number) => (
          <Disclosure defaultOpen={index === 0} key={detail.name} as="div">
            <h3>
              <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                <span className="text-sm font-medium text-gray-900 group-data-[open]:text-indigo-600">
                  {detail.name}
                </span>
                <span className="ml-6 flex items-center">
                  <PlusIcon
                    aria-hidden="true"
                    className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                  />
                  <MinusIcon
                    aria-hidden="true"
                    className="hidden h-6 w-6 text-indigo-400 group-hover:text-indigo-500 group-data-[open]:block"
                  />
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="prose prose-sm pb-6">
              <ul>
                {detail.items.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DisclosurePanel>
          </Disclosure>
        ))}
      </div>
    </div>
  );
};
export default TireFeatures;
