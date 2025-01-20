import React from 'react';

import { benefits } from '@/app/(pages)/detail/data/benefits';
import { BenefitsItem } from '@/app/ui/components';

const Benefits = () => {
  return (
    <div className="grid grid-cols-8 mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl  py-8 gap-6">
      {benefits?.map(item => {
        return <BenefitsItem key={item.id} item={item} />;
      })}
    </div>
  );
};

export default Benefits;
