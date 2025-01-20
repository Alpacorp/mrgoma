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
      className="w-full h-10 max-w-[8.125rem] pl-1 object-contain object-center"
      src={`/assets/images/TireBrand/${product.brandId}-logo.png`}
      alt={product.brand}
      title={product.brand}
      aria-label={product.brand}
      priority
      width={400}
      height={300}
    />
  );
};

export default BrandImage;
