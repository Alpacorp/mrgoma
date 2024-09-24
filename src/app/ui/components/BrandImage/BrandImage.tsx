import { FC } from 'react';
import Image from 'next/image';

interface BrandImageProps {
  product: {
    brand: string;
    brandId: string;
  };
}

const BrandImage: FC<BrandImageProps> = ({ product }) => {
  return (
    <Image
      className="w-32"
      src={`/assets/images/TireBrand/${product.brandId}-logo.png`}
      alt={product.brand}
      title={product.brand}
      aria-label={product.brand}
      priority
      width={500}
      height={500}
    />
  );
};

export default BrandImage;
