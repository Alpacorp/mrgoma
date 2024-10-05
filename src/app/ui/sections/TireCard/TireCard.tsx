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

interface TireCardProps {
  products: any;
}

const TireCard: FC<TireCardProps> = ({
  products,
}: Readonly<{ products: any }>) => {

  const {setShowDetailModal } = useContext(ShowDetailModalContext);

  return (
    <>
      {products.map((product: any) => (
        <li
          key={product.id}
          className="bg-white rounded-lg overflow-hidden pb-2 shadow-[0px_1px_10px_rgba(0,0,0,0.1)]"
        >
          <div className="relative">
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
              {/* <div className="absolute z-50 text-lg font-semibold text-white -top-2 -left-12 text-center -rotate-45"> */}
              <div className="absolute z-30 text-lg font-semibold text-white top-0 left-0 text-center">
                <ProductCondition condition={product.condition} />
              </div>
            </div>
          </div>
          <div className="mt-4 px-3">
            <CtaButton product={product} text="View Tire" />
          </div>
        </li>
      ))}
    </>
  );
};

export default TireCard;
