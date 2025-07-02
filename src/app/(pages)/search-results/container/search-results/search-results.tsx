'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { FC, Suspense, useState } from 'react';

import { productsTest } from '@/app/(pages)/search-results/data/productsTest';
import { singleproductTest } from '@/app/(pages)/search-results/data/singleProductTest';
import {
  CollapsibleSearchBar,
  ModalDetail,
  ResultsHeader,
  TirePositionTabs,
  TireResults,
} from '@/app/ui/components';
import { TirePosition } from '@/app/ui/components/TirePositionTabs/tire-position-tabs';
import { LateralFilters, Pagination, TitleSection } from '@/app/ui/sections';

/**
 * `SearchResults` is a page component that renders a search results page.
 *
 * The page displays a list of tires matching the search query, along with
 * filters and sorting options. The component is a `Suspense` boundary,
 * which means that it will only be rendered once the search results data
 * has been loaded.
 *
 * The component expects the following props:
 *
 * - `searchParams`: an object containing the search query parameters.
 *   The object should have the following properties:
 *   - `w`: the width of the front tires.
 *   - `s`: the sidewall of the front tires.
 *   - `d`: the diameter of the front tires.
 *   - `rw`: the width of the rear tires.
 *   - `rs`: the sidewall of the rear tires.
 *   - `rd`: the diameter of the rear tires.
 *
 * @returns a JSX element representing the search results page.
 */
const SearchResults: FC = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TirePosition>('front');

  const frontWidth = searchParams.get('w') || '';
  const frontSidewall = searchParams.get('s') || '';
  const frontDiameter = searchParams.get('d') || '';

  const rearWidth = searchParams.get('rw') || '';
  const rearSidewall = searchParams.get('rs') || '';
  const rearDiameter = searchParams.get('rd') || '';

  const hasRearTires = !!(rearWidth && rearSidewall && rearDiameter);

  const getTireSize = (position: TirePosition) => {
    if (position === 'front') {
      return `${frontWidth}/${frontSidewall}R${frontDiameter}`;
    }
    return `${rearWidth}/${rearSidewall}R${rearDiameter}`;
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
                              resultsCount={activeTab === 'front' ? productsTest.length : 15}
                            />
                          </div>
                          <TireResults
                            activeTab={activeTab}
                            products={productsTest}
                            getTireSize={getTireSize}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-16">
                      <Pagination />
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
