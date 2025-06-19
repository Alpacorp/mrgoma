'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC, Suspense, useState } from 'react';

import { productsTest } from '@/app/(pages)/search-results/data/productsTest';
import { singleproductTest } from '@/app/(pages)/search-results/data/singleProductTest';
import {
  CollapsibleSearchBar,
  ModalDetail,
  OpenFilters,
  SortingMenu,
  Title,
} from '@/app/ui/components';
import {
  LateralFilters,
  MobileLateralFilters,
  MobileTopFilters,
  Pagination,
  TireCard,
} from '@/app/ui/sections';

type TirePosition = 'front' | 'rear';

const SearchResults: FC = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TirePosition>('front');

  const frontWidth = searchParams.get('w') || '';
  const frontSidewall = searchParams.get('s') || '';
  const frontDiameter = searchParams.get('s') || '';

  const rearWidth = searchParams.get('rw') || '';
  const rearSidewall = searchParams.get('rs') || '';
  const rearDiameter = searchParams.get('rd') || '';

  const hasRearTires = rearWidth && rearSidewall && rearDiameter;

  const getTireSize = (position: TirePosition) => {
    if (position === 'front') {
      return `${frontWidth}/${frontSidewall}R${frontDiameter}`;
    }
    return `${rearWidth}/${rearSidewall}R${rearDiameter}`;
  };

  const renderTireResults = (position: TirePosition) => {
    {
      if (position === 'front') {
        return (
          <div className="mx-auto">
            <TireCard products={productsTest} />
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 15 }, (_, index) => (
            <div
              key={`${position}-${index + 1}`}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
            >
              <div className="relative aspect-video mb-4">
                <Image
                  src="/placeholder.svg"
                  alt="Tire example"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Michelin PRIMACY A/S XL{' '}
                {<Suspense fallback={<div>Loading...</div>}>{getTireSize(position)}</Suspense>}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">$140</span>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  View Tire
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="bg-white">
        <div>
          <MobileLateralFilters />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:mb-16 mt-16">
              <Title />
            </div>
            <section aria-labelledby="products-heading" className="pb-24">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 ">
                <div className="hidden lg:block">
                  <aside>
                    <LateralFilters />
                  </aside>
                </div>
                <div className="lg:col-span-3">
                  <div className="hidden sm:block sticky top-0 z-40 bg-gray-100 rounded-b-md shadow-md">
                    <Suspense fallback={<div>Loading...</div>}>
                      <CollapsibleSearchBar />
                    </Suspense>
                  </div>
                  <div className="sticky block sm:hidden top-0 z-40 bg-white rounded my-4">
                    <MobileTopFilters>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CollapsibleSearchBar />
                      </Suspense>
                    </MobileTopFilters>
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <h3 className="text-gray-400 text-base">91 Results</h3>
                    <div className="flex items-baseline justify-end">
                      <div className="flex items-center">
                        <SortingMenu />
                        <OpenFilters />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 relative z-10">
                    <div className="bg-white">
                      <div className="mx-auto">
                        {/*<TireCard products={productsTest} />*/}
                        <div className="flex-1">
                          <div className="mb-6">
                            {/* Tabs for tire position */}
                            <div className="border-b border-gray-200">
                              <nav className="-mb-px flex gap-6" aria-label="Tabs">
                                <button
                                  onClick={() => setActiveTab('front')}
                                  className={`py-4 px-1 relative font-medium text-sm ${
                                    activeTab === 'front'
                                      ? 'text-green-600 border-b-2 border-green-600'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  Front Tires
                                  <span
                                    className={`absolute -bottom-px left-0 w-full h-0.5 ${
                                      activeTab === 'front' ? 'bg-green-600' : 'bg-transparent'
                                    }`}
                                  />
                                </button>
                                {hasRearTires && (
                                  <Suspense fallback={<div>Loading...</div>}>
                                    <button
                                      onClick={() => setActiveTab('rear')}
                                      className={`py-4 px-1 relative font-medium text-sm ${
                                        activeTab === 'rear'
                                          ? 'text-green-600 border-b-2 border-green-600'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                    >
                                      Rear Tires
                                      <span
                                        className={`absolute -bottom-px left-0 w-full h-0.5 ${
                                          activeTab === 'rear' ? 'bg-green-600' : 'bg-transparent'
                                        }`}
                                      />
                                    </button>
                                  </Suspense>
                                )}
                              </nav>
                            </div>

                            {/* Result header */}
                            <div className="flex justify-between items-center mt-6">
                              <h2 className="text-lg text-gray-600">
                                Results for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{' '}
                                Tires:{' '}
                                {
                                  <Suspense fallback={<div>Loading...</div>}>
                                    {getTireSize(activeTab)}
                                  </Suspense>
                                }
                              </h2>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">6 Results</span>
                                <select
                                  className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                  defaultValue="featured"
                                >
                                  <option value="featured">Featured</option>
                                  <option value="price-asc">Price: Low to High</option>
                                  <option value="price-desc">Price: High to Low</option>
                                  <option value="newest">Newest</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Result grid */}
                          {renderTireResults(activeTab)}
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
      </main>
    </Suspense>
  );
};

export default SearchResults;
