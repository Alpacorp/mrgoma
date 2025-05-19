'use client';

import { FC } from 'react';

import { SearchByText } from '@/app/ui/components';

const SearchByTextContainer: FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-center rounded-xl md:p-4 shadow-xl bg-white h-64 overflow-auto">
        <SearchByText />
      </div>
    </div>
  );
};

export default SearchByTextContainer;
