import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
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

interface Feature {
  name: string;
  value: string;
  icon?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  condition: string;
  brandId?: string;
  brand?: string;
  features: Feature[];
}

interface TireCardProps {
  products: Product[];
}

const TireCard: FC<TireCardProps> = ({ products }: Readonly<{ products: Product[] }>) => {
  const { setShowDetailModal } = useContext(ShowDetailModalContext);

  return (
    <ul className="mt-3">
      {products.map((product: Product) => (
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

            <div className="col-span-12 md:col-span-8">
              <ProductName type={1} size="lg" weight="bold" name={product.name} />
              <div className="flex  flex-wrap xs:flex-nowrap mb-4 mt-4 items-center justify-between">
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
                <div className="w-full xs:w-auto mt-4 mb-1.5 xs:mt-0">
                  <CtaButton product={product} text="View Tire" />
                </div>
              </div>
              <div className="xs:flex justify-between bg-gray-100 py-2 px-2 xs:px-4  rounded-xl xs:rounded-2xl">
                {product.features.map((feature: Feature, index: number) => {
                  return (
                    <>
                      {index <= 3 && (
                        <ProductItem
                          product={feature.value}
                          title={feature.name}
                          icon={feature.icon}
                        />
                      )}
                    </>
                  );
                })}
              </div>
              <Disclosure>
                <DisclosureButton
                  data-open
                  className="group flex items-center gap-2  w-full mt-4 text-sm justify-between font-bold "
                >
                  More details
                  <ChevronDownIcon className="w-5 h-5 ui-open:rotate-180 ui-open:transform" />
                </DisclosureButton>
                <DisclosurePanel transition className="origin-top xs:flex  justify-between gap-6">
                  <ul className="text-sm mt-2 w-full">
                    {product.features.map((feature: Feature, index: number) => {
                      return (
                        <>
                          {index > 2 && index <= 5 && (
                            <li className="flex justify-between text-xs sm:text-sm">
                              <span className="font-semibold">{feature.name}:</span> {feature.value}
                            </li>
                          )}
                        </>
                      );
                    })}
                  </ul>
                  <ul className="text-sm xs:mt-2 w-full">
                    {product.features.map((feature: Feature, index: number) => {
                      return (
                        <>
                          {index > 5 && index <= 8 && (
                            <li className="flex justify-between text-xs sm:text-sm">
                              <span className="font-semibold">{feature.name}:</span> {feature.value}
                            </li>
                          )}
                        </>
                      );
                    })}
                  </ul>
                </DisclosurePanel>
              </Disclosure>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TireCard;
