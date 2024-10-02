import React from 'react';
import { TerminologyItem } from '@/app/ui/components';
import { terminology } from '@/app/(pages)/detail/data/terminology';

const Terminology = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 className="text-3xl font-bold mb-16">Terminology</h1>
      <div className="grid grid-cols-4 gap-6">
        {terminology.map((item) => {
          return <TerminologyItem item={item} key={item.id} />;
        })}
      </div>
    </div>
  );
};

export default Terminology;
