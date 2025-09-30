import React, { FC, SyntheticEvent } from 'react';

import { useCart } from '@/app/context/CartContext';
import {
  BrandImage,
  CtaButton,
  ProductCondition,
  ProductImage,
  ProductItem,
  ProductName,
  ProductPrice,
  StockBadge,
  FreeShippingBadge,
} from '@/app/ui/components';

interface TireCardProps {
  products: any;
}

const TireCard: FC<TireCardProps> = ({ products }: Readonly<{ products: any }>) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (event: SyntheticEvent, product: any) => {
    event.preventDefault();
    addToCart(product);
  };

  return (
    <ul className="mt-3">
      {products.map((product: any) => {
        const productInCart = isInCart(product.id);

        return (
          <li
            key={product.id}
            className="relative bg-white rounded-xl overflow-hidden p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:transition-shadow w-full mb-8 items-center transition-transform duration-200 focus-within:ring-2 focus-within:ring-green-500 group"
          >
            {(() => {
              const statusVal = (product as any)?.status;
              const isSold =
                typeof statusVal === 'string' && statusVal.trim().toLowerCase() === 'sold';
              return !isSold ? (
                <div className="pointer-events-none absolute top-2 right-2 z-30">
                  <StockBadge />
                </div>
              ) : null;
            })()}
            <div className="grid grid-cols-12 gap-4">
              <div className="relative col-span-12 md:col-span-4 rounded-md transition-shadow group-hover:ring-1 group-hover:ring-green-200">
                <ProductImage product={product} />
                <div className="absolute top-0 left-0 z-30">
                  <ProductCondition condition={product.condition} />
                </div>
              </div>

              <div className="col-span-12 md:col-span-8 content-center">
                <ProductName type={2} size="lg" weight="bold" name={product.name} />
                <div className="h-px bg-gray-100 mt-2" />
                <div className="flex flex-wrap mb-4 mt-3 gap-5 items-center justify-between">
                  <div className="flex gap-2 items-center justify-center">
                    <div className="flex items-center gap-2">
                      <ProductPrice price={product.price} />
                      <FreeShippingBadge className="ml-1" />
                    </div>
                    {product.brandId && (
                      <div className="h-10 md:h-12 overflow-hidden flex items-center">
                        <BrandImage
                          product={{
                            brand: product.brand,
                            brandId: product.brandId,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 justify-center w-full md:w-auto">
                    <CtaButton product={product} text="View Details" style="tertiary" />
                    <CtaButton
                      product={product}
                      text={productInCart ? 'In Cart' : 'Add to Cart'}
                      style="primary"
                      onClick={handleAddToCart}
                      disabled={productInCart}
                      isLink={false}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-between bg-green-50 border border-green-300 py-2 px-2 xs:px-4 rounded-md xs:rounded-2xl">
                  {product?.features &&
                    Array.isArray(product.features) &&
                    product.features.map(
                      (feature: { name: string; value: string }, index: number) => {
                        return (
                          <React.Fragment key={`feature-${index}`}>
                            {index <= 4 && (
                              <ProductItem feature={feature.value} title={feature.name} />
                            )}
                          </React.Fragment>
                        );
                      }
                    )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TireCard;
