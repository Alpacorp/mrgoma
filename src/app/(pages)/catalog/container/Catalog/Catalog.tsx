'use client';

import { FC } from 'react';

import { productsTest } from '@/app/(pages)/catalog/data/productsTest';
import { singleproductTest } from '@/app/(pages)/catalog/data/singleProductTest';
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

const Catalog: FC = () => {
  return (
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
                <div>
                  <LateralFilters />
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="hidden sm:block sticky top-0 z-40 bg-gray-100 rounded-b-md shadow-md">
                  <CollapsibleSearchBar />
                </div>
                <div className="sticky block sm:hidden top-0 z-40 bg-white rounded my-4">
                  <MobileTopFilters>
                    <CollapsibleSearchBar />
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
                      <TireCard products={productsTest} />
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
  );
};

export default Catalog;
