'use client';

import { FC } from 'react';

import { SearchBySize } from '@/app/ui/components';

const SearchBySizeContainer: FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl md:p-4 shadow-sm border border-gray-100">
        <SearchBySize />
      </div>
    </div>
  );
};

export default SearchBySizeContainer;
