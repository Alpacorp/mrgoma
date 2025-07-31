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
} from '@/app/ui/components';

interface TireCardProps {
  products: any;
}

const TireCard: FC<TireCardProps> = ({ products }: Readonly<{ products: any }>) => {
  const { addToCart, isInCart } = useCart();

  console.log('logale, products:', products);

  const handleAddToCart = (event: SyntheticEvent, product: any) => {
    event.preventDefault();
    addToCart(product);
  };

  return (
    <ul className="mt-3">
      {products.map((product: any) => {
        const productInCart = isInCart(product.id);

        console.log('logale, product:', product);

        return (
          <li
            key={product.id}
            className="bg-white rounded-lg overflow-hidden p-5 shadow-[0px_1px_10px_rgba(0,0,0,0.1)] w-full mb-8 items-center"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="relative col-span-12 md:col-span-4">
                <ProductImage product={product} />
                <div className="absolute top-0 left-0 z-30">
                  <ProductCondition condition={product.condition} />
                </div>
              </div>

              <div className="col-span-12 md:col-span-8 content-center">
                <ProductName type={1} size="lg" weight="bold" name={product.name} />
                <div className="flex flex-wrap mb-4 mt-4 gap-5 items-center justify-between">
                  <div className="flex gap-2 items-center justify-center">
                    <ProductPrice price={product.price} />
                    {product.brandId && (
                      <BrandImage
                        product={{
                          brand: product.brand,
                          brandId: product.brandId,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 justify-center w-full md:w-auto">
                    <CtaButton product={product} text="View Details" style="tertiary" />
                    <CtaButton
                      product={product}
                      text={productInCart ? 'In Cart' : 'Add cart'}
                      style="primary"
                      onClick={handleAddToCart}
                      disabled={productInCart}
                      isLink={false}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-between bg-gray-100 py-2 px-2 xs:px-4 rounded-xl xs:rounded-2xl border border-gray-500">
                  {product?.features &&
                    Array.isArray(product.features) &&
                    product.features.map((feature: any, index: number) => {
                      return (
                        <React.Fragment key={`feature-${index}`}>
                          {index <= 3 && (
                            <ProductItem feature={feature.value} title={feature.name} />
                          )}
                        </React.Fragment>
                      );
                    })}
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
