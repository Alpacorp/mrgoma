import { FC } from 'react';

interface ProductConditionProps {
  condition: string;
}

const ProductCondition: FC<ProductConditionProps> = ({ condition }) => {
  const isNew = condition?.toLowerCase() === 'new';
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
        isNew
          ? 'bg-green-100 text-green-700 border-green-300'
          : 'bg-amber-100 text-amber-700 border-amber-300'
      }`}
    >
      {isNew ? 'New' : 'Used'}
    </span>
  );
};

export default ProductCondition;
