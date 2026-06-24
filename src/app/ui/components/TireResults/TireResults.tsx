'use client';

import React, { FC } from 'react';

import { TransformedTire } from '@/app/interfaces/tires';
import { TireCard } from '@/app/ui/sections';

interface TireResultsProps {
  products: TransformedTire[];
}

const TireResults: FC<TireResultsProps> = ({ products }) => {
  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-0">
      {products && products.length > 0 ? (
        <TireCard products={products} />
      ) : (
        <div className="text-center py-8">
          <p className="text-lg font-medium text-gray-700">
            No tires found with the specified criteria
          </p>
          <p className="text-sm text-gray-500 mt-2">Try different dimensions or filters.</p>
        </div>
      )}
    </div>
  );
};

export default TireResults;
