import React, { FC, ReactNode } from 'react';

interface ProductItemProps {
  product: string;
  title: string;
  children?: ReactNode;
  icon: ReactNode;
}

const ProductItem: FC<ProductItemProps> = ({
  product,
  title,
  children,
  icon,
}) => {
  return (
    <div className="flex items-end gap-3">
      {icon}
      {children}
      <p className="mt-1 text-gray-900 text-sm">
        <span>{title}: </span>
        {product}
      </p>
    </div>
  );
};

export default ProductItem;
