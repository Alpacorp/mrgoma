import React, { FC } from 'react';

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: FC<ProductDescriptionProps> = ({ description }) => {
  return (
    <div>
      <h3>Description:</h3>
      <div className="space-y-6 text-base text-gray-700" />
      <p>{description}</p>
    </div>
  );
};

export default ProductDescription;
