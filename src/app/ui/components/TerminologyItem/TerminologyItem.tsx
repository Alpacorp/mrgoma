import React, { FC } from 'react';

interface TerminologyItemProps {
  item: {
    title: string;
    description: string;
  };
}

const TerminologyItem: FC<TerminologyItemProps> = ({ item }) => {
  return (
    <div className="col-span-4 md:col-span-2  mb-6">
      <h3 className="mb-3 font-medium text-x">{item.title}</h3>
      <p className="text-sm">{item.description}</p>
    </div>
  );
};

export default TerminologyItem;
