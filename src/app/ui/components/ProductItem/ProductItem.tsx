import React, { FC, ReactNode } from 'react';

import { getIconForFeature } from '@/app/ui/utils/IconMapper';

interface ProductItemProps {
  feature: string;
  title: string;
  children?: ReactNode;
}

const ProductItem: FC<ProductItemProps> = ({ feature, title, children }) => {
  const displayIcon = getIconForFeature(title);

  return (
    <div className="flex flex-col gap-2">
      {displayIcon}
      {children}
      <p className="text-gray-900 text-xs md:text-sm flex flex-col">
        <span className="font-semibold">{title}: </span>
        {feature}
      </p>
    </div>
  );
};

export default ProductItem;
