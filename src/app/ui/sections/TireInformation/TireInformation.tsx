import React, { FC } from 'react';
import { TireInformationProps } from '@/app/interfaces/tires';

import {
  ProductName,
  ProductPrice,
  ProductDescription,
  CartButton,
  BrandImage,
} from '@/app/ui/components';

const TireInformation: FC<TireInformationProps> = ({ singleTire }) => {
  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="mb-3">
            <ProductName
              type={1}
              size="3xl"
              weight="bold"
              name={singleTire.name}
            />
          </div>
          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <ProductPrice price={singleTire.price} />
          </div>
        </div>
        <div>
          <BrandImage
            product={{
              brand: singleTire.brand,
              brandId: singleTire.brandId,
            }}
          />
        </div>
      </div>
      <div className="mt-6">
        <ProductDescription description="The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use" />
      </div>
      <CartButton message="CTA Pendiente por definir" />
    </div>
  );
};

export default TireInformation;
