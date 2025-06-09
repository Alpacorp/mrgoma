import Image from 'next/image';
import React, { FC } from 'react';

import {
  InfoCardsSection,
  InfoSlider,
  SearchContainer,
  ServicesGrid,
  TitleSection,
} from '@/app/ui/sections';
import { LocationsSlider } from '@/app/ui/sections/LocationsSlider/LocationsSlider';

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
          <section className="bg-[url('/assets/images/bg-section.webp')] bg-cover bg-center bg-no-repeat bg-fixed bg-black/50 pb-28">
            <div
              aria-labelledby="benefits-heading"
              className="px-4 sm:px-6 lg:px-8 py-16 rounded-lg"
            >
              <InfoSlider />
            </div>
          </section>
          <section className="relative">
            <div id="services" className="absolute -top-[6.563rem] left-0 w-full">
              <TitleSection title="OUR SERVICES" />
            </div>
            <div>
              <ServicesGrid />
            </div>
          </section>
          <section>
            <div id="about">
              <TitleSection title="Why Mr. Goma" />
            </div>
            <div>
              <InfoCardsSection className="bg-[url('/assets/images/bg-section.webp')] bg-cover bg-center bg-no-repeat bg-fixed bg-opacity-50 bg-black/50 pb-48" />
            </div>
          </section>
          <section className="relative">
            <div id="locations" className="absolute -top-[6.563rem] left-0 w-full">
              <TitleSection title="OUR LOCATIONS" />
            </div>
            <div>
              <LocationsSlider />
            </div>
          </section>
        </main>
      </div>
    </main>
  );
};

export default HomeContent;
