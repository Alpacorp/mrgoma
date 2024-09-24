'use client';

import { FC } from 'react';

import {
  LateralFilters,
  MobileLateralFilters,
  MobileTopFilters,
  TireCard,
  TopFilter,
} from '@/app/ui/sections';

import { OpenFilters, Title, SortingMenu } from '@/app/ui/components';

import { productsTest } from '@/app/(pages)/catalog/data/productsTest';

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
                <div className="hidden sm:block sticky top-0 z-40 bg-white pb-4">
                  <TopFilter />
                </div>
                <div className="sticky block sm:hidden top-0 z-40  pt-4 pb-4 bg-white">
                  <MobileTopFilters>
                    <div className="p-4">
                      <TopFilter />
                    </div>
                  </MobileTopFilters>
                </div>
                <h2 className="font-semibold text-base  sm:mt-14 text-gray-900">
                  Results for Tires: 255/55 R18
                </h2>
                <div className="flex items-center justify-between mt-8">
                  <h3 className="text-gray-400">91 Results</h3>
                  <div className="flex items-baseline justify-end">
                    <div className="flex items-center">
                      <SortingMenu />
                      <OpenFilters />
                    </div>
                  </div>
                </div>
                <div className="mt-12">
                  <TireCard products={productsTest} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </main>
  );
};

export default Catalog;
