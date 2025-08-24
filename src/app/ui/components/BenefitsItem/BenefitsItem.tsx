import React, { FC } from 'react';

interface BenefitsItemProps {
  item: {
    icon?: React.ReactElement;
    title: string;
    description: string;
  };
}

const BenefitsItem: FC<BenefitsItemProps> = ({ item }) => {
  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-green-500">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600"
        aria-hidden="true"
      >
        {item.icon ?? <span className="text-lg">✅</span>}
      </div>
      <h3 className="mt-3 mb-2 text-base font-semibold text-gray-900">{item.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
    </li>
  );
};

export default BenefitsItem;
