'use client';

import { FC } from 'react';

import { SearchByText } from '@/app/ui/components';

const SearchByTextContainer: FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-center xs:rounded-none sm:rounded-xl xs:rounded-b-xl p-4 shadow-xl bg-white h-64 overflow-auto border border-[#A3E635]">
        <SearchByText />
      </div>
    </div>
  );
};

export default SearchByTextContainer;
