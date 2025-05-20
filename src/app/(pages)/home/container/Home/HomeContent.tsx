import Image from 'next/image';
import React, { FC } from 'react';

import { SearchContainer } from '@/app/ui/components';
import { InfoSlider } from '@/app/ui/sections';

const HomeContent: FC = () => {
  return (
    <main className="bg-white">
      <div>
        <main className="mx-auto">
          <section aria-labelledby="products-heading" className="px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/assets/images/banner-hero.webp"
                alt=""
                fill
                className="absolute inset-0 object-cover"
                priority
              />
            </div>
            <div className="relative z-10 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
              <div className="lg:col-span-3">
                <div>
                  <SearchContainer />
                </div>
              </div>
            </div>
          </section>
          <section aria-labelledby="benefits-heading" className="px-4 sm:px-6 lg:px-8">
            <InfoSlider />
          </section>
        </main>
      </div>
    </main>
  );
};

export default HomeContent;
