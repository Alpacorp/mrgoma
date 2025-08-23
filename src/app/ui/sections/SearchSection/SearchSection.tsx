'use client';

import { FC } from 'react';

import { SearchBySize, SearchByText } from '@/app/ui/components';

interface SearchSectionProps {
  type: 'size' | 'text';
}

const SearchSection: FC<SearchSectionProps> = ({ type }) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center rounded-b-2xl md:rounded-2xl bg-white bg-gradient-to-br from-green-primary via-lime-200 to-white justify-center p-4 shadow-xl h-64 overflow-auto ring-1 ring-lime-500">
        {type === 'size' ? <SearchBySize /> : <SearchByText />}
      </div>
    </div>
  );
};

export default SearchSection;
