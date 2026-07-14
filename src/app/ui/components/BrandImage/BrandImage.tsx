'use client';

import { FC, useState } from 'react';

import Image from 'next/image';

interface BrandImageProps {
  product: {
    brand: string;
    brandId: number;
  };
}

const BrandImage: FC<BrandImageProps> = ({ product }) => {
  const [src, setSrc] = useState(`/assets/images/TireBrand/${product.brandId}-logo.webp`);
  return (
    <Image
      className="h-full aspect-auto max-w-32 w-full pl-1 object-contain object-center"
      src={src}
      alt={product.brand}
      title={product.brand}
      aria-label={product.brand}
      priority
      width={128}
      height={96}
      onError={() => setSrc('/assets/images/TireBrand/no-brand.webp')}
    />
  );
};

export default BrandImage;
