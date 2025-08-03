'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { FC, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useGenerateFixedPagination } from '@/app/hooks/useGeneratePagination';
import { TiresData, TransformedTire } from '@/app/interfaces/tires';
import {
  CollapsibleSearchBar,
  ErrorDisplay,
  LoadingScreen,
  NoResultsFound,
  ResultsHeader,
  ResultsSkeleton,
  TireResults,
} from '@/app/ui/components';
import { LateralFilters, TitleSection } from '@/app/ui/sections';
import { createPaginatedResponse } from '@/app/utils/transformTireData';

interface PaginatedTiresResponse {
  tires: TransformedTire[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

interface SearchResultsProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
    w?: string;
    s?: string;
    d?: string;
  };
}

/**
 * SearchResults component displays the search results page for tires,
 * including the header section, lateral filters, and the list of tire products.
 * It handles pagination, sorting, and filtering functionality.
 *
 * @returns The SearchResults component.
 */
const SearchResults: FC<SearchResultsProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tiresData, setTiresData] = useState<PaginatedTiresResponse>({
    tires: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    error: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const totalPages = Math.ceil(tiresData.totalCount / pageSize);
  const maxVisiblePages = 10;

  // Refs to track current values for comparison in effects
  const pageRef = useRef(page);
  const pageSizeRef = useRef(pageSize);

  // Tire size parameters
  const width = searchParams.get('w') || '';
  const sidewall = searchParams.get('s') || '';
  const diameter = searchParams.get('d') || '';

  // Function to get the tire size to display
  const getTireSize = () => {
    if (width && sidewall && diameter) {
      return `${width}/${sidewall}/${diameter}`;
    }
    return '';
  };

  // Function to update pagination parameters in the URL
  const updatePaginationParams = useCallback(
    (pageNum: number, pageSizeNum: number) => {
      try {
        const validPageSizes = [5, 10, 15, 20, 25, 50, 100];
        const validatedPageSize = validPageSizes.includes(pageSizeNum) ? pageSizeNum : 10;

        // Create a new URL with the updated pagination parameters
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', pageNum.toString());
        params.set('pageSize', validatedPageSize.toString());

        router.push(`?${params.toString()}`, { scroll: false });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error updating pagination:', errorMessage);
      }
    },
    [router, searchParams]
  );

  const getDataTires = useCallback(
    async (page: number) => {
      if (count === 1) {
        setLoading(true);
        try {
          const baseUrl = window.location.origin;
          const params = new URLSearchParams(searchParams.toString());

          params.set('page', page.toString());
          params.set('pageSize', pageSize.toString());

          const response = await fetch(`${baseUrl}/api/tires?${params.toString()}`);
          const result: { records: TiresData[]; totalCount: number } = await response.json();

          const tiresData = result.records;
          const totalCount = result.totalCount;

          const dataTransformed = createPaginatedResponse(tiresData, page, pageSize, totalCount);
          setTiresData(dataTransformed);

          setCount(0);
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : String(error));
        } finally {
          setLoading(false);
        }
      }
    },
    [searchParams, pageSize, count]
  );

  const handleUpScroll = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
      handleUpScroll();
    }
  }, [page, totalPages, handleUpScroll]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
      handleUpScroll();
    }
  }, [page, handleUpScroll]);

  const handlePageClick = useCallback(
    (pageNumber: number) => {
      setPage(pageNumber);
      handleUpScroll();
    },
    [handleUpScroll]
  );

  const handleFirstPage = useCallback(() => {
    setPage(1);
    handleUpScroll();
  }, [handleUpScroll]);

  const handleLastPage = useCallback(() => {
    setPage(totalPages);
    handleUpScroll();
  }, [totalPages, handleUpScroll]);

  const handlePageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newPageSize = parseInt(event.target.value, 10);

      const currentRecordIndex = (page - 1) * pageSize;
      const newPage = Math.floor(currentRecordIndex / newPageSize) + 1;

      setPageSize(newPageSize);
      setPage(newPage);
    },
    [page, pageSize]
  );

  const pagination = useGenerateFixedPagination(page, totalPages, maxVisiblePages);
  const availablePageSizes = [5, 10, 15, 20, 25, 50, 100].filter(
    size => size <= tiresData.totalCount
  );

  // Update refs when state changes
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlSize = parseInt(searchParams.get('pageSize') || '10', 10);

    if (pageRef.current !== urlPage) setPage(urlPage);
    if (pageSizeRef.current !== urlSize) setPageSize(urlSize);
  }, [searchParams]);

  useEffect(() => {
    void getDataTires(page);
  }, [getDataTires, page]);

  useEffect(() => {
    updatePaginationParams(page, pageSize);
  }, [updatePaginationParams, page, pageSize]);

  useEffect(() => {
    setCount(1);
  }, [searchParams]);

  return (
    <Suspense fallback={<LoadingScreen message="Preparing your tire selection..." />}>
      <main className="bg-white">
        <section aria-labelledby="products-heading" className="relative">
          <div className="h-64 sm:h-80 lg:h-64">
            <Image
              src="/assets/images/banner-tires-search.webp"
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
                            <ResultsHeader
                              getTireSize={getTireSize}
                              resultsCount={tiresData?.tires?.length || 0}
                              totalCount={tiresData.totalCount}
                            />
                          </div>
                          {error ? (
                            <ErrorDisplay
                              title="Error Loading Tires"
                              message="We couldn't load the tire data at this moment."
                              error={error}
                              onRetry={() => window.location.reload()}
                            />
                          ) : (
                            <div className="relative">
                              {loading ? (
                                <ResultsSkeleton count={pageSize} />
                              ) : tiresData.tires.length === 0 ? (
                                <NoResultsFound
                                  title="No Tires Found"
                                  message="We couldn't find any tires matching your search criteria. Please try different specifications."
                                />
                              ) : (
                                <TireResults products={tiresData.tires} />
                              )}
                              {tiresData.tires.length > 0 && (
                                <div className="mt-16">
                                  <div className="flex mt-16 items-baseline w-full overflow-auto h-min sm:justify-start md:justify-center">
                                    <div className="mt-4 flex justify-center gap-1 h-min">
                                      <div className="flex gap-1">
                                        <button
                                          onClick={handleFirstPage}
                                          disabled={page === 1}
                                          className={`${page === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} px-4 py-1 bg-gray-700 h-min text-white rounded hover:bg-gray-600 disabled:bg-gray-400`}
                                        >
                                          &lt;&lt;
                                        </button>
                                        <button
                                          onClick={handlePreviousPage}
                                          disabled={page === 1}
                                          className={`${page === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} px-4 py-1 bg-gray-700 h-min text-white rounded hover:bg-gray-600 disabled:bg-gray-400`}
                                        >
                                          &lt;
                                        </button>
                                      </div>
                                      {pagination.map((pageNumber, index) =>
                                        typeof pageNumber === 'number' ? (
                                          <button
                                            key={index}
                                            onClick={() => handlePageClick(pageNumber)}
                                            className={`px-3 py-1 h-min border border-gray-300 rounded cursor-pointer ${
                                              pageNumber === page
                                                ? 'bg-green-500 text-white'
                                                : 'text-gray-700 hover:bg-green-800 hover:text-white'
                                            }`}
                                          >
                                            {pageNumber}
                                          </button>
                                        ) : (
                                          <span
                                            key={index}
                                            className="px-3 py-1 mx-1 text-gray-500"
                                          >
                                            {pageNumber}
                                          </span>
                                        )
                                      )}
                                      <div className="flex gap-1">
                                        <button
                                          onClick={handleNextPage}
                                          disabled={page === totalPages}
                                          className={`${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} px-4 py-1 bg-gray-700 h-min text-white rounded hover:bg-gray-600 disabled:bg-gray-400`}
                                        >
                                          &gt;
                                        </button>
                                        <button
                                          onClick={handleLastPage}
                                          disabled={page === totalPages}
                                          className={`${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} px-4 py-1 bg-gray-700 h-min text-white rounded hover:bg-gray-600 disabled:bg-gray-400`}
                                        >
                                          &gt;&gt;
                                        </button>
                                      </div>
                                    </div>
                                    {tiresData.totalCount >= 10 && (
                                      <div className="ml-4 h-min">
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
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
        <CollapsibleSearchBar />
      </main>
    </Suspense>
  );
};

export default SearchResults;
