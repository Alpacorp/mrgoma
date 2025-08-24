'use client';

import React, { FC, useState } from 'react';

import { TireInformationProps, SingleTireDetails } from '@/app/interfaces/tires';

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180 text-green-500' : 'text-gray-400'}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.29a.75.75 0 01.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
);

const TireFeatures: FC<TireInformationProps> = ({ singleTire }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? -1 : idx));
  };

  return (
    <div aria-labelledby="details-heading">
      <h2 id="details-heading" className="sr-only">
        Additional details
      </h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y">
        {singleTire.details.map((detail: SingleTireDetails, index: number) => {
          const isOpen = openIndex === index;
          return (
            <div key={detail.name} className="bg-white">
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                <span
                  className={`text-sm font-medium ${isOpen ? 'text-green-600' : 'text-gray-900'}`}
                >
                  {detail.name}
                </span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-6 pb-6">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside text-sm text-gray-700">
                    {detail.items.map((item: string) => (
                      <li key={item} className="leading-6">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TireFeatures;
