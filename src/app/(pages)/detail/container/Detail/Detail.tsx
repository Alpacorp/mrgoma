import React from 'react';

import { singleproductTest } from '@/app/(pages)/catalog/data/singleProductTest';
import {
  ProductCarousel,
  TireInformation,
  TireFeatures,
  Terminology,
  Benefits,
} from '@/app/ui/sections';

function Detail() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <ProductCarousel singleTire={singleproductTest} />
          <div className="mt-10 sm:mt-16 lg:mt-0">
            <TireInformation singleTire={singleproductTest} />
            <section aria-labelledby="details-heading" className="mt-12 lg:px-8">
              <TireFeatures singleTire={singleproductTest} />
            </section>
          </div>
        </div>
      </div>
      <section className="bg-[#111828] text-white py-16">
        <Terminology />
      </section>
      <section className="mt-8 mb-8">
        <Benefits />
      </section>
    </div>
  );
}

export default Detail;
