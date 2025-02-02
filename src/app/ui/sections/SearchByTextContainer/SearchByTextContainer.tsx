'use client';

import { FC } from 'react';

import { SearchByText } from '@/app/ui/components';

const SearchByTextContainer: FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl md:p-4 shadow-sm border border-gray-100">
        <SearchByText />
      </div>
    </div>
  );
};

export default SearchByTextContainer;
