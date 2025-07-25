import { NextPage } from 'next';

import SearchResults from '@/app/(pages)/search-results/container/search-results/search-results';

const SearchResultsPage: NextPage = async () => {
  // Fetch tires data server-side
  // const tiresData = await getTires(page, pageSize);

  // console.log('logale, tiresData in SearchResultsPage:', tiresData);

  // Check if there was an error fetching the data
  // if ('error' in tiresData) {
  //   // Log the error but continue rendering with available data
  //   console.error('Error fetching tires:', tiresData.error);
  // }

  return <SearchResults />;
};

export default SearchResultsPage;
