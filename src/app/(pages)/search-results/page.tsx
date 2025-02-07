import { NextPage } from 'next';
import { Suspense } from 'react';

import SearchResults from '@/app/(pages)/search-results/container/search-results/search-results';

const SearchResultsPage: NextPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchResultsPage;
