import { FC } from 'react';

interface ProductPriceProps {
  price: string | number;
}

const ProductPrice: FC<ProductPriceProps> = ({ price }) => {
  return <p className="mt-1 text-green-600 font-semibold text-2xl sm:text-3xl">${price}</p>;
};

export default ProductPrice;
