import Image from 'next/image';
import React, { FC } from 'react';

interface ProductImageProps {
  product: {
    imageAlt: string;
    imageSrc: string;
    brand: string;
  };
  isHovered?: boolean;
}

const ProductCarouselMiniature: FC<ProductImageProps> = ({ product, isHovered }) => {
  return (
    <div className="relative z-20 h-full w-full overflow-hidden rounded-lg">
      <Image
        className={`product-image h-full w-full object-cover object-center transition duration-400 ease-in-out max-[25rem]:object-cover ${
          isHovered ? 'scale-110 duration-300' : ''
        }`}
        alt={product.imageAlt}
        src={product.imageSrc}
        title={product.imageAlt}
        aria-label={product.imageAlt}
        priority
        width={500}
        height={500}
      />
    </div>
  );
};

export default ProductCarouselMiniature;
