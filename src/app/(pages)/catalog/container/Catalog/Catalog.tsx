'use client';

import { FC } from 'react';

import { productsTest } from '@/app/(pages)/catalog/data/productsTest';
import { singleproductTest } from '@/app/(pages)/catalog/data/singleProductTest';

import {
  LateralFilters,
  MobileLateralFilters,
  MobileTopFilters,
  TireCard,
  TopFilter,
} from '@/app/ui/sections';

import { OpenFilters, Title, SortingMenu, ModalDetail } from '@/app/ui/components';






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
                <div className="hidden sm:block sticky top-0 z-40 bg-gray-100 p-2 rounded-lg shadow-lg">
                  <TopFilter />
                </div>
                <div className="sticky block sm:hidden top-0 z-40 bg-white rounded-b-lg shadow-md my-4">
                  <MobileTopFilters>
                    <div className="p-4">
                      <TopFilter />
                    </div>
                  </MobileTopFilters>
                </div>
                <h2 className="font-semibold text-base sm:mt-8 text-gray-400">
                  Results for Tires: 255/55 R18
                </h2>
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
                      <ul className="mt-3 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-4">
                        <TireCard products={productsTest} />
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <ModalDetail singleTire={singleproductTest}/>
    </main>
  );
};

export default Catalog;
