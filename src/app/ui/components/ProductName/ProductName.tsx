import { FC } from 'react';

interface ProductNameProps {
  product: {
    name: string;
  };
}

const ProductName: FC<ProductNameProps> = ({ product }) => {
  return <h3 className="font-medium text-gray-900">{product.name}</h3>;
};

export default ProductName;
