import { FC } from 'react';

interface ProductConditionProps {
  condition: 'New' | 'Used';
}

const ProductCondition: FC<ProductConditionProps> = ({ condition }) => {
  return (
    <div
      className={`p-2 text-sm rounded-tl-lg rounded-br-lg text-white inline-block ${
        condition === 'New' ? 'bg-green-600' : 'bg-gray-600'
      }`}
    >
      {condition === 'New' ? 'New' : 'Used'}
    </div>
  );
};

export default ProductCondition;
