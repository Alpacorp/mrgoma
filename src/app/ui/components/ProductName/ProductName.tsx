import react, { FC } from 'react';

interface ProductNameProps {
  name: string;
  type: number;
  size:
    | 'xs'
    | 'sm'
    | 'base'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | '8xl'
    | '9xl';
  weight: 'medium' | 'semibold' | 'bold';
  id?: string;
  className?: string;
}

const ProductName: FC<ProductNameProps> = ({ type, size, weight, name, id, className }) => {
  const baseClass = `text-${size} font-${weight} text-gray-900`;
  return react.createElement(
    `h${type}`,
    { id, className: className ? `${baseClass} ${className}` : baseClass },
    name
  );
};

export default ProductName;
