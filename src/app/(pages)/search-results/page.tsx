import { NextPage } from 'next';
import { Suspense } from 'react';

import SearchResults from '@/app/(pages)/search-results/container/search-results/search-results';
import { getTires } from '@/app/(pages)/search-results/utils/getTires';
import { LoadingScreen } from '@/app/ui/components';

export const dynamic = 'force-dynamic'; // Disable static rendering

interface SearchResultsPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    w?: string;
    s?: string;
    d?: string;
    rw?: string;
    rs?: string;
    rd?: string;
  };
}

const SearchResultsPage: NextPage<SearchResultsPageProps> = async ({ searchParams }) => {
  // Extract pagination parameters from the URL
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;

  // Fetch tires data server-side
  const tiresData = await getTires(page, pageSize);

  // Check if there was an error fetching the data
  if ('error' in tiresData) {
    console.error('Error fetching tires:', tiresData.error);
  }

  return (
    <Suspense fallback={<LoadingScreen message="Finding the perfect tires for you..." />}>
      <SearchResults initialTiresData={tiresData} searchParams={params} />
    </Suspense>
  );
};

export default SearchResultsPage;
