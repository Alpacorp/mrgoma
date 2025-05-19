'use client';

import { FC } from 'react';

import { SearchBySize } from '@/app/ui/components';

const SearchBySizeContainer: FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-center rounded-xl md:p-4 shadow-xl bg-white h-64 overflow-auto">
        <SearchBySize />
      </div>
    </div>
  );
};

export default SearchBySizeContainer;
