'use client';

import { FC } from 'react';

import { SearchBySize, SearchByText } from '@/app/ui/components';

interface SearchSectionProps {
  type: 'size' | 'text';
}

const SearchSection: FC<SearchSectionProps> = ({ type }) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center xs:rounded-none sm:rounded-xl xs:rounded-b-xl p-4 shadow-xl bg-white h-64 overflow-auto border border-[#A3E635]">
        {type === 'size' ? <SearchBySize /> : <SearchByText />}
      </div>
    </div>
  );
};

export default SearchSection;
