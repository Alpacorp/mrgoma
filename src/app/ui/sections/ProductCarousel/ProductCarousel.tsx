import React, { FC } from 'react';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import {
  ProductCondition,
  BrandImage,
  ProductCarouselMiniature,
} from '@/app/ui/components';

import { TireInformationProps } from '@/app/interfaces/tires';

const ProductCarousel: FC<TireInformationProps> = ({ singleTire }) => {
  return (
    <TabGroup className="flex flex-col-reverse">
      {/* Image selector */}
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <TabList className="grid grid-cols-4 gap-6">
          {singleTire.images.map((image) => (
            <Tab
              aria-selected={true}
              key={image.id}
              className=" group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring ring-green-primary  focus:ring-opacity-60 focus:ring-offset-4"
            >
              <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black opacity-30 z-30"
        />
              <span className="sr-only">{image.name}</span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <ProductCarouselMiniature
                  product={{
                    imageAlt: image.name,
                    imageSrc: image.src,
                    brand: singleTire.brand,
                  }}
                />
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent group-data-[selected]:ring-green-primary"
              />
            </Tab>
          ))}
        </TabList>
      </div>

      <TabPanels className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black opacity-30 z-30"
        />
        {singleTire.images.map((image) => (
          <TabPanel key={image.id}>
            <div className="relative">
              <img
                alt={image.alt}
                src={image.src}
                className="h-full w-full object-cover object-center sm:rounded-lg"
              />
              <div className="absolute z-30 text-lg font-semibold text-white -top-2 -left-11 text-center -rotate-45">
                <ProductCondition condition={singleTire.condition} />
              </div>
              <div className="absolute z-30 text-lg font-semibold text-white right-0 bottom-0">
                {singleTire.brandId && (
                  <BrandImage
                    product={{
                      brand: singleTire.brand,
                      brandId: singleTire.brandId,
                    }}
                  />
                )}
              </div>
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

export default ProductCarousel;
