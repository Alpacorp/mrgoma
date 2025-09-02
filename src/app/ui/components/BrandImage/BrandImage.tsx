'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

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
      className="h-auto aspect-auto max-w-32 w-full pl-1 object-contain object-center"
      src={src}
      alt={product.brand}
      title={product.brand}
      aria-label={product.brand}
      priority
      width={400}
      height={300}
      sizes="(max-width: 768px) 160px, 200px"
      onError={() => setSrc('/assets/images/TireBrand/no-brand.webp')}
    />
  );
};

export default BrandImage;
