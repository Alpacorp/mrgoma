import React from 'react';

import { singleproductTest } from '@/app/(pages)/catalog/data/singleProductTest';
import { ProductCarousel, TireInformation, TireFeatures } from '@/app/ui/sections';


function Detail() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Images carousel falta usar el componente Image */}
          <ProductCarousel singleTire={singleproductTest} />
          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <TireInformation singleTire={singleproductTest}/>
          {/* features */}
            <section aria-labelledby="details-heading" className="mt-12">
              <TireFeatures singleTire={singleproductTest}/>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
