import { FC } from 'react';

interface ProductPriceProps {
  product: {
    price: string;
  };
}

const ProductPrice: FC<ProductPriceProps> = ({ product }) => {
  return (
    <p className="mt-1 text-green-primary font-semibold text-2xl">
      {product.price}
    </p>
  );
};

export default ProductPrice;
