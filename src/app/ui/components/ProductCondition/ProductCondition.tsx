import { FC } from 'react';

interface ProductConditionProps {
  condition: string;
}

const ProductCondition: FC<ProductConditionProps> = ({ condition }) => {
  return (
    <div
      className={`p-2 text-sm rounded-tl-lg rounded-br-lg ${
        condition === 'new' ? 'bg-green-primary' : 'bg-gray-600'
      }`}
    >
      {condition === 'new' ? 'New' : 'Used'}
    </div>
  );
};

export default ProductCondition;
