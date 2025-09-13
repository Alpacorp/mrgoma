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

  // Determine availability from DB Condition (exposed as status)
  const isSold =
    typeof (singleTire as any)?.status === 'string' &&
    ((singleTire as any).status as string).trim().toLowerCase() === 'sold';

  const handleAddToCart = (event: SyntheticEvent, product: any) => {
    event.preventDefault();
    addToCart(product);
  };

  return (
    <section aria-labelledby={`product-name-${singleTire.id}`}>
      <div role="group" aria-label="Product header">
        <div>
          <div className="mb-3">
            <span aria-hidden="true" role="presentation">
              <ArrowsToRight className="w-20 h-6" />
            </span>
            <div className="my-4">
              <BrandImage
                product={{
                  brand: singleTire.brand,
                  brandId: singleTire.brandId,
                }}
              />
            </div>
            <ProductName
              id={`product-name-${singleTire.id}`}
              type={1}
              size="3xl"
              weight="bold"
              name={singleTire.name}
            />
            {singleTire.model2 && <p className="text-sm text-gray-600 mt-1">{singleTire.model2}</p>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="sr-only">Product information</h2>
            <ProductPrice price={singleTire.price} />
            {isSold ? (
              <div
                className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                role="status"
                aria-live="polite"
              >
                Not available
              </div>
            ) : (
              <div className="flex gap-2">
                <CtaButton
                  product={singleTire}
                  text={productInCart ? 'In Cart' : 'Add to Cart'}
                  style="primary"
                  onClick={handleAddToCart}
                  disabled={productInCart}
                  isLink={false}
                />
                <div className="sr-only" aria-live="polite" role="status">
                  {productInCart ? 'This item is already in your cart.' : ''}
                </div>
              </div>
            )}
          </div>
          <ul aria-label="Key specifications" className="mt-4 flex flex-wrap gap-2">
            <li className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              Condition: {singleTire.condition}
            </li>
            <li className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              Remaining life: {singleTire.remainingLife}
            </li>
            <li className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              Tread depth: {singleTire.treadDepth}
            </li>
            <li className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              Patched: {singleTire.patched}
            </li>
          </ul>
        </div>
      </div>
      {/*<div className="my-6">*/}
      {/*  <ProductDescription description={singleTire.description || ''} />*/}
      {/*</div>*/}
    </section>
  );
};

export default TireInformation;
