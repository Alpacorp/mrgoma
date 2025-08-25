'use client';

import Image from 'next/image';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { TireInformationProps } from '@/app/interfaces/tires';
import { ProductCondition, ProductCarouselMiniature, StockBadge } from '@/app/ui/components';

const ProductCarousel: FC<TireInformationProps> = ({ singleTire }) => {
  const images = useMemo(() => singleTire.images || [], [singleTire.images]);
  const [index, setIndex] = useState<number>(0);

  const select = useCallback(
    (i: number) => {
      if (i < 0 || i >= images.length) return;
      setIndex(i);
    },
    [images.length]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        select((index + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        select((index - 1 + images.length) % images.length);
      }
    },
    [images.length, index, select]
  );

  const current = images[index] || {
    id: 0,
    name: 'Image',
    src: '/assets/images/generic-tire-image.webp',
    alt: `${singleTire.brand} ${singleTire.name}`,
  };

  return (
    <div className="flex flex-col-reverse" aria-label="Product gallery">
      {/* Thumbnails */}
      <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
        <div
          role="tablist"
          aria-label="Choose image"
          className="grid grid-cols-4 gap-3 max-[25rem]:gap-3"
        >
          {images.map((image, i) => {
            const selected = i === index;
            return (
              <button
                key={image.id}
                role="tab"
                aria-selected={selected}
                aria-controls={`image-panel-${image.id}`}
                id={`image-tab-${image.id}`}
                type="button"
                onClick={() => select(i)}
                className={`group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring ring-green-primary focus:ring-opacity-60 focus:ring-offset-4 ${selected ? 'ring-2 ring-green-primary' : 'ring-2 ring-transparent'}`}
                title={image.name}
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Main image */}
      <div
        className="w-full overflow-hidden rounded-lg"
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product image"
      >
        <div
          id={`image-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`image-tab-${current.id}`}
          className="w-full"
        >
          <div className="relative w-full bg-white rounded-lg overflow-hidden aspect-square sm:aspect-[16/10] lg:aspect-[16/9]">
            <Image
              alt={current.alt || current.name}
              src={current.src}
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
              priority={false}
            />
            <div className="pointer-events-none absolute top-0 left-0 z-30 text-lg font-semibold text-white">
              <ProductCondition condition={singleTire.condition} />
            </div>
            <div className="pointer-events-none absolute top-2 right-2">
              <StockBadge />
            </div>
          </div>
        </div>
        <div className="sr-only" aria-live="polite">
          Showing image {index + 1} of {images.length}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
