'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { FC, Suspense, useCallback, useEffect, useState } from 'react';

import { singleproductTest } from '@/app/(pages)/search-results/data/singleProductTest';
import { useGenerateFixedPagination } from '@/app/hooks/useGeneratePagination';
import {
  CollapsibleSearchBar,
  LoadingScreen,
  ModalDetail,
  ResultsHeader,
  TirePositionTabs,
  TireResults,
} from '@/app/ui/components';
import { TirePosition } from '@/app/ui/components/TirePositionTabs/tire-position-tabs';
import { LateralFilters, TitleSection } from '@/app/ui/sections';
import { createPaginatedResponse } from '@/app/utils/transformTireData';

interface PaginatedTiresResponse {
  tires: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string; // Optional error message
}

interface SearchResultsProps {
  initialTiresData: PaginatedTiresResponse;
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

/**
 * `SearchResults` is a page component that renders a search results page.
 *
 * The page displays a list of tires matching the search query, along with
 * filters and sorting options. The component is a `Suspense` boundary,
 * which means that it will only be rendered once the search results data
 * has been loaded.
 *
 * @returns a JSX element representing the search results page.
 */
const SearchResults: FC<SearchResultsProps> = ({ initialTiresData, searchParams }) => {
  console.log('logale, initialTiresData:', initialTiresData);

  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TirePosition>('front');
  const [tiresData, setTiresData] = useState<PaginatedTiresResponse>(initialTiresData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(
    // Check if initialTiresData has an error property
    'error' in initialTiresData ? (initialTiresData.error as string) : null
  );

  // Pagination state
  const [page, setPage] = useState<number>(initialTiresData.page);
  const [pageSize, setPageSize] = useState<number>(initialTiresData.pageSize);
  const totalPages = initialTiresData.totalPages;
  const maxVisiblePages = 10;

  // Tire size parameters
  const frontWidth = searchParams.w || '';
  const frontSidewall = searchParams.s || '';
  const frontDiameter = searchParams.d || '';

  const rearWidth = searchParams.rw || '';
  const rearSidewall = searchParams.rs || '';
  const rearDiameter = searchParams.rd || '';

  const hasRearTires = !!(rearWidth && rearSidewall && rearDiameter);

  const getTireSize = (position: TirePosition) => {
    if (position === 'front') {
      return `${frontWidth}/${frontSidewall}R${frontDiameter}`;
    }
    return `${rearWidth}/${rearSidewall}R${rearDiameter}`;
  };

  // Function to fetch tires data from the API
  const fetchTires = useCallback(
    async (pageNum: number, pageSizeNum: number) => {
      setLoading(true);
      try {
        // Create a new URL with the updated pagination parameters
        const params = new URLSearchParams(urlSearchParams.toString());
        params.set('page', pageNum.toString());
        params.set('pageSize', pageSizeNum.toString());

        // Update the URL without refreshing the page
        router.push(`?${params.toString()}`, { scroll: false });

        // Fetch the data from the API
        const baseUrl = window.location.origin;
        const response = await fetch(
          `${baseUrl}/api/tires?page=${pageNum}&pageSize=${pageSizeNum}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch tires: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Use the shared utility function to create a paginated response
        const transformedData = createPaginatedResponse(data, pageNum, pageSizeNum);

        setTiresData(transformedData);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch tires';
        console.error('Error fetching tires:', error);
        // Use the shared utility function for error handling
        const errorResponse = createPaginatedResponse([], pageNum, pageSizeNum, errorMessage);
        setTiresData(errorResponse);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router, urlSearchParams]
  );

  // Fetch tires when page or pageSize changes
  useEffect(() => {
    if (page !== initialTiresData.page || pageSize !== initialTiresData.pageSize) {
      fetchTires(page, pageSize);
    }
  }, [fetchTires, page, pageSize, initialTiresData.page, initialTiresData.pageSize]);

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleFirstPage = () => {
    setPage(1);
  };

  const handleLastPage = () => {
    setPage(totalPages);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);

    // Calculate the new page based on the current position
    const currentRecordIndex = (page - 1) * pageSize; // Index of the first record on the current page
    const newPage = Math.floor(currentRecordIndex / newPageSize) + 1;

    setPageSize(newPageSize);
    setPage(newPage);
  };

  // Generate pagination UI
  const pagination = useGenerateFixedPagination(page, totalPages, maxVisiblePages);
  const availablePageSizes = [10, 20, 50].filter(size => size <= tiresData.totalCount);

  return (
    <Suspense fallback={<LoadingScreen message="Preparing your tire selection..." />}>
      <main className="bg-white">
        <section aria-labelledby="products-heading" className="relative">
          <div className="h-64 sm:h-80 lg:h-40">
            <Image
              src="/assets/images/banner-tires-search.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div id="services" className="absolute z-30 -mt-26 left-0 w-full">
            <TitleSection title="STORE TIRES" />
          </div>
        </section>
        <div>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section aria-labelledby="products-heading" className="pb-24">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 md:mt-10">
                <div>
                  <aside>
                    <LateralFilters />
                  </aside>
                </div>
                <div className="lg:col-span-3">
                  <div>
                    <div className="bg-white">
                      <div className="mx-auto">
                        <div className="flex-1">
                          <div className="mb-6">
                            <TirePositionTabs
                              activeTab={activeTab}
                              setActiveTab={setActiveTab}
                              hasRearTires={hasRearTires}
                            />
                            <ResultsHeader
                              activeTab={activeTab}
                              getTireSize={getTireSize}
                              resultsCount={activeTab === 'front' ? tiresData.tires.length : 15}
                            />
                          </div>
                          {error ? (
                            <div className="text-red-500">Error: {error}</div>
                          ) : (
                            <div className="relative">
                              <TireResults
                                activeTab={activeTab}
                                products={tiresData.tires}
                                getTireSize={getTireSize}
                              />
                              {loading && <LoadingScreen message="Loading your tires..." />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-16">
                      <div className="mt-4 flex justify-center gap-1">
                        <div className="flex gap-1">
                          <button
                            onClick={handleFirstPage}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                          >
                            &lt;&lt;
                          </button>
                          <button
                            onClick={handlePreviousPage}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                          >
                            &lt;
                          </button>
                        </div>
                        {pagination.map((pageNumber, index) =>
                          typeof pageNumber === 'number' ? (
                            <button
                              key={index}
                              onClick={() => handlePageClick(pageNumber)}
                              className={`px-3 py-1 mx-1 rounded ${
                                pageNumber === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-white hover:bg-gray-600'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          ) : (
                            <span key={index} className="px-3 py-1 mx-1 text-gray-500">
                              {pageNumber}
                            </span>
                          )
                        )}
                        <div className="flex gap-1">
                          <button
                            onClick={handleNextPage}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                            disabled={page === totalPages}
                          >
                            &gt;
                          </button>
                          <button
                            onClick={handleLastPage}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                          >
                            &gt;&gt;
                          </button>
                        </div>
                      </div>
                      {tiresData.totalCount >= 10 && (
                        <div className="mt-4 ml-4">
                          <label htmlFor="pageSize" className="mr-2">
                            Page Size:
                          </label>
                          <select
                            id="pageSize"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="px-4 py-2 bg-gray-700 rounded text-white"
                          >
                            {availablePageSizes.map(size => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
        <ModalDetail singleTire={singleproductTest} />
        <CollapsibleSearchBar />
      </main>
    </Suspense>
  );
};

export default SearchResults;
