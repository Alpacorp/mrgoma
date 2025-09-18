import { FC } from 'react';

interface ProductPriceProps {
  price: string | number;
}

const ProductPrice: FC<ProductPriceProps> = ({ price }) => {
  return <p className="mt-1 text-green-600 font-bold text-3xl sm:text-4xl">${price}</p>;
};

export default ProductPrice;
