import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Image from 'next/image';
import React, { FC } from 'react';

import { TireInformationProps } from '@/app/interfaces/tires';
import { ProductCondition, ProductCarouselMiniature } from '@/app/ui/components';

const ProductCarousel: FC<TireInformationProps> = ({ singleTire }) => {
  return (
    <TabGroup className="flex flex-col-reverse">
      <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
        <TabList className="grid grid-cols-4 gap-3 max-[25rem]:gap-3">
          {singleTire.images.map(image => (
            <Tab
              key={image.id}
              className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring ring-green-primary focus:ring-opacity-60 focus:ring-offset-4"
            >
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
      <TabPanels className="w-full overflow-hidden rounded-lg">
        {singleTire.images.map(image => (
          <TabPanel
            key={image.id}
            className="max-h-60 h-full w-full object-fill object-center sm:h-96 sm:min-h-[28.125rem] sm:max-h-[31.25rem]"
          >
            <div className="relative">
              <Image
                alt={image.alt}
                src={image.src}
                className="max-h-60 h-full w-full object-fill object-center sm:h-96 sm:min-h-[28.125rem] sm:max-h-[31.25rem]"
                width={500}
                height={500}
              />
              <div className="absolute z-30 text-lg font-semibold text-white top-0 left-0 text-center">
                <ProductCondition condition={singleTire.condition} />
              </div>
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

export default ProductCarousel;
