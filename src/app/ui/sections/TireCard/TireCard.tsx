import React, { FC, useState } from 'react';

import {
  ArrowDownOnSquareIcon,
  ClockIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

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

const TireCard: FC<TireCardProps> = ({
  products,
}: Readonly<{ products: any }>) => {
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  return (
    <div className="bg-white">
      <div className="mx-auto">
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product: any) => (
            <div key={product.id}>
              <div className="relative">
                <ProductImage
                  product={product}
                  isHovered={hoveredProductId === product.id}
                />
                <div className="relative mt-4">
                  <ProductPrice product={product} />
                  <ProductName product={product} />
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
                <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4 groupTest">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black opacity-30 z-30"
                    onMouseEnter={() => setHoveredProductId(product.id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  />
                  <div className="absolute z-30 text-lg font-semibold text-white -top-2 -left-12 text-center -rotate-45">
                    <ProductCondition product={product} />
                  </div>
                  <div className="absolute z-30 text-lg font-semibold text-white right-0 bottom-0">
                    {product.brandId && (
                      <BrandImage
                        product={{
                          brand: product.brand,
                          brandId: product.brandId,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <CtaButton product={product} text="View Tire" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TireCard;
