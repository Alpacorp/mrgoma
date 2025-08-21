import Image from 'next/image';
import { FC } from 'react';

interface BrandImageProps {
  product: {
    brand: string;
    brandId: number;
  };
}

const BrandImage: FC<BrandImageProps> = ({ product }) => {
  return (
    <Image
      className="h-6 w-auto pl-1 object-contain object-center"
      src={`/assets/images/TireBrand/${product.brandId}-logo.png`}
      alt={product.brand}
      title={product.brand}
      aria-label={product.brand}
      priority
      width={400}
      height={300}
      sizes="(max-width: 768px) 130px, 130px"
    />
  );
};

export default BrandImage;
