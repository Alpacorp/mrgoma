import React, { FC } from 'react';

interface TerminologyItemProps {
  item: {
    title: string;
    description: string;
  };
}

const TerminologyItem: FC<TerminologyItemProps> = ({ item }) => {
  return (
    <li className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5 hover:bg-white/10 transition-colors focus-within:ring-2 focus-within:ring-green-500">
      <h3 className="mb-2 text-base font-semibold text-white">{item.title}</h3>
      <p className="text-sm leading-relaxed text-gray-300">{item.description}</p>
    </li>
  );
};

export default TerminologyItem;
