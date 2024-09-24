import { FC } from 'react';

interface ProductConditionProps {
  product: {
    condition: string;
  };
}

const ProductCondition: FC<ProductConditionProps> = ({ product }) => {
  return (
    <div
      className={`pt-6 pb-3 px-12 text-sm ${
        product.condition === 'new' ? 'bg-green-primary' : 'bg-gray-600'
      }`}
    >
      {product.condition === 'new' ? 'New' : 'Used'}
    </div>
  );
};

export default ProductCondition;
