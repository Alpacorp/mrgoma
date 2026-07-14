import React, { FC } from 'react';

import Image from 'next/image';

interface ProductImageProps {
  product: {
    imageAlt: string;
    imageSrc: string;
    brand: string;
  };
  isHovered?: boolean;
}

const isValidNextImageSrc = (src: unknown): src is string => {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed || trimmed.toUpperCase() === 'N/A') return false;
  return trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

const ProductCarouselMiniature: FC<ProductImageProps> = ({ product, isHovered }) => {
  const fallbackSrc = '/images/placeholder-tire.svg';
  const safeSrc = isValidNextImageSrc(product?.imageSrc) ? product.imageSrc : fallbackSrc;
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
      />
    </div>
  );
};

export default ProductCarouselMiniature;
