import React, { FC } from 'react';

interface BenefitsItemProps {
  item: {
    icon: React.ReactElement;
    title: string;
    description: string;
  };
}

const BenefitsItem: FC<BenefitsItemProps> = ({ item }) => {
  return (
    <div className=" col-span-8 sm:col-span-4 xl:col-span-2">
      {item.icon}
      <h3 className="text-center font-semibold mt-3 mb-3 text-base text-gray-900">{item.title}</h3>
      <p className="text-center text-gray-500">{item.description}</p>
    </div>
  );
};

export default BenefitsItem;
