import { FC } from 'react';

interface ProductPriceProps {
    price: string;
}

const ProductPrice: FC<ProductPriceProps> = ({ price }) => {
  return (
    <p className="mt-1 text-green-primary font-semibold text-2xl sm:text-3xl">
      {price}
    </p>
  );
};

export default ProductPrice;
