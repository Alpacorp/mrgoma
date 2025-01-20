import React, { FC, ReactNode } from 'react';

interface ProductItemProps {
  product: string;
  title: string;
  children?: ReactNode;
  icon: ReactNode;
}

const ProductItem: FC<ProductItemProps> = ({ product, title, children, icon }) => {
  return (
    <div className="flex gap-3 items-start">
      {icon}
      {children}
      <p className=" text-gray-900 text-xs md:text-sm ">
        <span className="font-semibold">{title}: </span>
        {product}
      </p>
    </div>
  );
};

export default ProductItem;
