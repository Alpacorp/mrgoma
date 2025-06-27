import React, { FC, useContext } from 'react';

import { ShowDetailModalContext } from '@/app/context/ShowDetailModal';
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
  const { setShowDetailModal } = useContext(ShowDetailModalContext);

  return (
    <ul className="mt-3">
      {products.map((product: any) => (
        <li
          key={product.id}
          className="bg-white rounded-lg overflow-hidden p-5 shadow-[0px_1px_10px_rgba(0,0,0,0.1)] w-full mb-8 items-center"
        >
          <div className="grid grid-cols-12 gap-4 ">
            <div className=" relative col-span-12  md:col-span-4">
              <ProductImage product={product} />
              <div className="absolute top-0 left-0 z-30">
                <ProductCondition condition={product.condition} />
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 content-center">
              <ProductName type={1} size="lg" weight="bold" name={product.name} />
              <div className="flex flex-wrap mb-4 mt-4 gap-5 items-center justify-between">
                <div className="flex">
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
                  <CtaButton
                    product={product}
                    text="View Details"
                    style="tertiary"
                    urlParams={{ action: 'view', source: 'tirecard' }}
                  />
                  <CtaButton
                    product={product}
                    text="Add cart"
                    style="primary"
                    urlParams={{ action: 'add', source: 'tirecard' }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-between bg-gray-100 py-2 px-2 xs:px-4 rounded-xl xs:rounded-2xl border border-gray-500">
                {product?.features && Array.isArray(product.features) && product.features.map((feature: any, index: number) => {
                  return (
                    <React.Fragment key={`feature-${index}`}>
                      {index <= 3 && <ProductItem feature={feature.value} title={feature.name} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TireCard;
