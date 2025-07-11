'use client';

import React, { FC, SyntheticEvent } from 'react';

import { useCart } from '@/app/context/CartContext';
import { TireInformationProps } from '@/app/interfaces/tires';
import {
  ProductName,
  ProductPrice,
  ProductDescription,
  BrandImage,
  CtaButton,
} from '@/app/ui/components';
import { ArrowsToRight } from '@/app/ui/icons';

const TireInformation: FC<TireInformationProps> = ({ singleTire }) => {
  const { addToCart, isInCart } = useCart();
  const productInCart = isInCart(singleTire.id);

  const handleAddToCart = (event: SyntheticEvent, product: any) => {
    event.preventDefault();
    addToCart(product);
  };

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="mb-3">
            <ArrowsToRight className="w-20 h-6" />
            <ProductName type={1} size="3xl" weight="bold" name={singleTire.name} />
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
      <div className="my-6">
        <ProductDescription description="The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use" />
      </div>
      <CtaButton
        product={singleTire}
        text={productInCart ? 'In Cart' : 'Add cart'}
        style="primary"
        onClick={handleAddToCart}
        disabled={productInCart}
        isLink={false}
      />
    </div>
  );
};

export default TireInformation;
