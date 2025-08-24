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
            <div className="my-1">
              <BrandImage
                product={{
                  brand: singleTire.brand,
                  brandId: singleTire.brandId,
                }}
              />
            </div>
            <ProductName type={1} size="3xl" weight="bold" name={singleTire.name} />
          </div>
          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <ProductPrice price={singleTire.price} />
          </div>
        </div>
      </div>
      <div className="my-6">
        <ProductDescription description={singleTire.description || ''} />
      </div>
      <div className="flex gap-2">
        <CtaButton
          product={singleTire}
          text={productInCart ? 'In Cart' : 'Add cart'}
          style="primary"
          onClick={handleAddToCart}
          disabled={productInCart}
          isLink={false}
        />
      </div>
    </div>
  );
};

export default TireInformation;
