import { FC } from 'react';

interface ProductConditionProps {
  condition: string;
}

const ProductCondition: FC<ProductConditionProps> = ({ condition }) => {
  return (
    <div
      className={`p-2 sm:text-xl md:text-2xl rounded-tl-lg rounded-br-lg text-white inline-block ${
        condition === 'New' ? 'bg-green-600' : 'bg-gray-600'
      }`}
    >
      {condition === 'New' ? 'New' : 'Used'}
    </div>
  );
};

export default ProductCondition;
