import Image from 'next/image';
import { FC } from 'react';

interface ProductImageProps {
  product: {
    imageAlt: string;
    imageSrc: string;
    brand: string;
  };
}

const ProductImage: FC<ProductImageProps> = ({ product }) => {
  return (
    <div className="relative z-30 h-full w-full overflow-hidden rounded-lg">
      <Image
        className={`w-full object-contain object-center transition ease-in-out hover:scale-105 duration-300`}
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

export default ProductImage;
