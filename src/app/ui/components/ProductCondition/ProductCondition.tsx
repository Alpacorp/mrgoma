import { FC } from 'react';

interface ProductConditionProps {
  condition: string;
}

const ProductCondition: FC<ProductConditionProps> = ({ condition }) => {
  return (
    <div
      className={`pt-6 pb-3 px-12 text-sm ${
        condition === 'new' ? 'bg-green-primary' : 'bg-gray-600'
      }`}
    >
      {condition === 'new' ? 'New' : 'Used'}
    </div>
  );
};

export default ProductCondition;
