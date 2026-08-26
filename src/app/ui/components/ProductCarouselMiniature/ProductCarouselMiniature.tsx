import React, { FC } from 'react';

import Image from 'next/image';

import { isOptimisableImage } from '@/app/utils/imageHosts';

interface ProductImageProps {
  product: {
    imageAlt: string;
    imageSrc: string;
    brand: string;
  };
  isHovered?: boolean;
  /**
   * Thumbnails sit beside the main photo, above the fold, and `next/image`
   * defers them anyway — they were `loading="lazy"` and arrived visibly late,
   * after the frame they belong to had already been drawn empty.
   */
  eager?: boolean;
}

const ProductCarouselMiniature: FC<ProductImageProps> = ({ product, isHovered, eager = false }) => {
  const fallbackSrc = '/images/placeholder-tire.svg';
  // This file used to carry its own validator, which accepted any absolute
  // URL — and `next/image` throws during render for a host it is not configured
  // for. Three components had three different answers to the same question.
  const safeSrc = isOptimisableImage(product?.imageSrc) ? product.imageSrc! : fallbackSrc;
  const safeAlt = product?.imageAlt?.trim() || product?.brand || 'Product image';

  return (
    <div className="relative z-20 h-full w-full overflow-hidden rounded-lg">
      <Image
        className={`product-image h-full w-full object-cover object-center transition duration-400 ease-in-out max-[25rem]:object-cover ${
          isHovered ? 'scale-110 duration-300' : ''
        }`}
        alt={safeAlt}
        src={safeSrc}
        title={safeAlt}
        aria-label={safeAlt}
        width={128}
        height={128}
        loading={eager ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default ProductCarouselMiniature;
