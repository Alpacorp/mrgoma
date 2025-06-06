import Image from 'next/image';
import React, { FC } from 'react';

import { SearchContainer } from '@/app/ui/components';
import { InfoSlider, ServicesGrid, TitleSection } from '@/app/ui/sections';

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
          <div className="bg-[url('/assets/images/bg-section.webp')] bg-cover bg-center bg-no-repeat bg-fixed bg-opacity-50 bg-black/50">
            <section
              aria-labelledby="benefits-heading"
              className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 rounded-lg"
            >
              <InfoSlider />
            </section>
            <section>
              <TitleSection title="OUR SERVICES" />
            </section>
          </div>
          <section>
            <ServicesGrid className="px-4 sm:px-6 lg:px-8 py-8" />
          </section>
        </main>
      </div>
    </main>
  );
};

export default HomeContent;
