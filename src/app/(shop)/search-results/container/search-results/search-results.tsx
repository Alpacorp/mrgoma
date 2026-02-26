'use client';

import React, { FC, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

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
import { FiltersMobile, TitleSection, TopFilters, PromoBanner } from '@/app/ui/sections';
import { promoBannerConfig } from '@/app/ui/sections/PromoBanner/config/promoBanner';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  getAvailablePageSizes,
  validatePageSize,
} from '@/app/utils/paginationUtils';
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
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    error: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // Pagination state
  const [page, setPage] = useState<number>(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
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
        // Validar el tamaño de página
        const validatedPageSize = validatePageSize(pageSizeNum);

        // Solo avisar si se ajustó
        if (pageSizeNum !== validatedPageSize) {
          console.warn(`Invalid pageSize: ${pageSizeNum} adjusted to ${validatedPageSize}`);
        }

        // Usar la ubicación actual para evitar dependencia de la identidad de searchParams
        const params = new URLSearchParams(
          typeof window !== 'undefined' ? window.location.search : ''
        );

        const currentPage = parseInt(params.get('page') || String(DEFAULT_PAGE), 10);
        const currentPageSize = parseInt(params.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);

        // Si ya coincide, no navegar para evitar loops
        if (currentPage === pageNum && currentPageSize === validatedPageSize) {
          return;
        }

        // Actualizar y reemplazar (no push) para no contaminar el historial
        params.set('page', pageNum.toString());
        params.set('pageSize', validatedPageSize.toString());
        router.replace(`?${params.toString()}`, { scroll: false });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error updating pagination:', errorMessage);
      }
    },
    [router]
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

          const dataTransformed = createPaginatedResponse(
            tiresData,
            page,
            pageSize,
            totalCount
          ) as PaginatedTiresResponse;
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
  const availablePageSizes = getAvailablePageSizes(tiresData.totalCount);

  // Update refs when state changes
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10);
    const urlPageSizeRaw = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);

    // Validar el tamaño de página
    const urlPageSize = validatePageSize(urlPageSizeRaw);

    // Si se detectó un valor inválido, actualizarlo en la URL
    if (urlPageSizeRaw !== urlPageSize && searchParams.has('pageSize')) {
      updatePaginationParams(urlPage, urlPageSize);
    }

    if (pageRef.current !== urlPage) setPage(urlPage);
    if (pageSizeRef.current !== urlPageSize) setPageSize(urlPageSize);
  }, [searchParams, updatePaginationParams]);

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
      <main className="bg-gray-50">
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
          <div id="services" className="absolute z-30 -mt-25 left-0 w-full">
            <TitleSection title="STORE" className="bg-gray-50!" />
          </div>
        </section>
        <div>
          <main className="bg-gray-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative h-full">
            {/* Primary page heading for SEO and accessibility */}
            <h1 className="sr-only">
              {getTireSize()
                ? `Used & New Tires in Miami – Size ${getTireSize()}`
                : 'Used & New Tires in Miami'}
            </h1>
            <section aria-labelledby="products-heading" className="pb-24">
              <div className="md:mt-10 space-y-6">
                <div className="w-full">
                  <FiltersMobile />
                </div>
                <div>
                  <div>
                    <TopFilters />
                    <div className="bg-gray-50">
                      <div className="mx-auto">
                        <div className="flex-1">
                          <div className="mb-6">
                            <ResultsHeader
                              getTireSize={getTireSize}
                              resultsCount={tiresData?.tires?.length || 0}
                              totalCount={tiresData.totalCount}
                            />
                          </div>
                          <PromoBanner content={promoBannerConfig.home} className="mb-6" />
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
                                  <div className="mt-16 w-full">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                      <div className="overflow-auto">
                                        <nav
                                          aria-label="Pagination"
                                          className="mt-4 flex items-center justify-start md:justify-center gap-2 h-min"
                                        >
                                          <div className="flex gap-1">
                                            <button
                                              onClick={handleFirstPage}
                                              disabled={page === 1}
                                              aria-label="First page"
                                              title="First page"
                                              aria-disabled={page === 1}
                                              className={`${page === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-500'} px-3 py-1.5 h-min rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500`}
                                            >
                                              &lt;&lt;
                                            </button>
                                            <button
                                              onClick={handlePreviousPage}
                                              disabled={page === 1}
                                              aria-label="Previous page"
                                              title="Previous page"
                                              aria-disabled={page === 1}
                                              className={`${page === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-500'} px-3 py-1.5 h-min rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500`}
                                            >
                                              &lt;
                                            </button>
                                          </div>
                                          {pagination.map((pageNumber, index) =>
                                            typeof pageNumber === 'number' ? (
                                              <button
                                                key={index}
                                                onClick={() => handlePageClick(pageNumber)}
                                                aria-current={
                                                  pageNumber === page ? 'page' : undefined
                                                }
                                                className={`px-3 py-1.5 cursor-pointer h-min rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                                                  pageNumber === page
                                                    ? 'bg-green-600 text-white border-green-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-500'
                                                }`}
                                              >
                                                {pageNumber}
                                              </button>
                                            ) : (
                                              <span
                                                key={index}
                                                className="px-3 py-1.5 mx-1 text-gray-500"
                                              >
                                                {pageNumber}
                                              </span>
                                            )
                                          )}
                                          <div className="flex gap-1">
                                            <button
                                              onClick={handleNextPage}
                                              disabled={page === totalPages}
                                              aria-label="Next page"
                                              title="Next page"
                                              aria-disabled={page === totalPages}
                                              className={`${page === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-500'} px-3 py-1.5 h-min rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500`}
                                            >
                                              &gt;
                                            </button>
                                            <button
                                              onClick={handleLastPage}
                                              disabled={page === totalPages}
                                              aria-label="Last page"
                                              title="Last page"
                                              aria-disabled={page === totalPages}
                                              className={`${page === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' : 'cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-500'} px-3 py-1.5 h-min rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500`}
                                            >
                                              &gt;&gt;
                                            </button>
                                          </div>
                                          <span className="ml-3 text-sm text-gray-500 shrink-0">
                                            Page{' '}
                                            <span className="font-semibold text-gray-700">
                                              {page}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-semibold text-gray-700">
                                              {totalPages}
                                            </span>
                                          </span>
                                        </nav>
                                      </div>
                                      {tiresData.totalCount >= 10 && (
                                        <div className="md:ml-4 h-min flex items-center md:justify-end">
                                          <label
                                            htmlFor="pageSize"
                                            className="mr-2 text-sm text-gray-600"
                                          >
                                            Rows per page:
                                          </label>
                                          <select
                                            id="pageSize"
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
                                            className="bg-white border border-gray-300 rounded-md py-1.5 px-3 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer transition-colors"
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
        <div className="block lg:hidden">
          <CollapsibleSearchBar />
        </div>
      </main>
    </Suspense>
  );
};

export default SearchResults;
