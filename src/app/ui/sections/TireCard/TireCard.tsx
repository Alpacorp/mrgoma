import React, { FC, useContext } from 'react';
import Link from 'next/link';
import { ShowDetailModalContext } from '@/app/context/ShowDetailModal';

import {
  ArrowDownOnSquareIcon,
  ClockIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

import {
  BrandImage,
  CtaButton,
  DetailsButton,
  ProductCondition,
  ProductImage,
  ProductItem,
  ProductName,
  ProductPrice,
} from '@/app/ui/components';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface TireCardProps {
  products: any;
}

const TireCard: FC<TireCardProps> = ({
  products,
}: Readonly<{ products: any }>) => {
  console.log('products', products);
  const { setShowDetailModal } = useContext(ShowDetailModalContext);

  return (
    <>
      {products.map((product: any) => (
        <li
          key={product.fetures}
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
              <ProductName
                type={1}
                size="lg"
                weight="bold"
                name={product.name}
              />

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
                <div className='w-full xs:w-auto mt-4 mb-1.5 xs:mt-0'>
                  <CtaButton product={product} text="View Tire" />
                </div>
         
              </div>

              <div className="xs:flex justify-between bg-gray-100 py-2 px-2 xs:px-4  rounded-xl xs:rounded-2xl">
                {product.features.map((feature: any, index: number) => {
                  return (
                    <>
                      {index <= 2 && (
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
                  className="group flex items-center gap-2  w-full mt-4 text-sm justify-between font-bold"
                >
                  More details
                  <ChevronUpDownIcon className="w-5 h-5" />
                </DisclosureButton>
                <DisclosurePanel
                  transition
                  className="origin-top transition duration-300 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0 xs:flex  justify-between gap-6"
                >
                  <ul className="text-sm mt-2 w-full">
                    {product.features.map((feature: any, index: number) => {
                      return (
                        <>
                          {index > 2 && index <= 5 && (
                            <li className="flex justify-between text-xs sm:text-sm">
                              <span className="font-semibold">
                                {feature.name}:
                              </span>{' '}
                              {feature.value}
                            </li>
                          )}
                        </>
                      );
                    })}
                  </ul>
                  <ul className="text-sm xs:mt-2 w-full">
                    {product.features.map((feature: any, index: number) => {
                      return (
                        <>
                          {index > 5 && index <= 8 && (
                            <li className="flex justify-between text-xs sm:text-sm">
                              <span className="font-semibold">
                                {feature.name}:
                              </span>{' '}
                              {feature.value}
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
          {/* <div className="relative">
            <div>
              <Link href="/detail">
                <ProductImage product={product} />
              </Link>
            </div>
            <div className="relative mt-4 px-3">
              <div className="flex justify-between items-center">
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
              <div className="flex justify-between mt-3">
                <div>
                  <ProductName
                    type={3}
                    size="lg"
                    weight="medium"
                    name={product.name}
                  />
                  <ProductItem
                    product={product.patched}
                    title="Patched"
                    icon={<WrenchIcon color="#8F8F8F" width={18} height={18} />}
                  />
                  <ProductItem
                    product={product.remainingLife}
                    title="Remaining Life"
                    icon={<ClockIcon color="#8F8F8F" width={18} height={18} />}
                  />
                  <ProductItem
                    product={product.treadDepth}
                    title="Tread Depth"
                    icon={
                      <ArrowDownOnSquareIcon
                        color="#8F8F8F"
                        width={18}
                        height={18}
                      />
                    }
                  />
                </div>
                <div>
                  <DetailsButton onClick={() => setShowDetailModal(true)}>
                    Details
                  </DetailsButton>
                </div>
              </div>
            </div>
            <div className="inset-x-0 top-0 flex items-end justify-end overflow-hidden rounded-t-lg">
              <div className="absolute z-50 text-lg font-semibold text-white -top-2 -left-12 text-center -rotate-45">
              <div className="absolute z-30 text-lg font-semibold text-white top-0 left-0 text-center">
                <ProductCondition condition={product.condition} />
              </div>
            </div>
          </div>
          <div className="mt-4 px-3">
            <CtaButton product={product} text="View Tire" />
          </div> */}
        </li>
      ))}
    </>
  );
};

export default TireCard;
