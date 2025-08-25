import { FC } from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
}

const TireCardSkeleton: FC = () => (
  <li className="bg-white rounded-lg overflow-hidden p-5 shadow-[0px_1px_10px_rgba(0,0,0,0.1)] w-full mb-8 animate-pulse">
    <div className="grid grid-cols-12 gap-4">
      {/* Image skeleton - left side - Matches ProductImage placement */}
      <div className="relative col-span-12 md:col-span-4">
        <div className="w-full h-52 bg-gray-200 rounded-lg shadow-sm" />
        {/* Condition badge skeleton */}
        <div className="absolute top-0 left-0 z-30">
          <div className="h-6 w-20 bg-gray-300 rounded-br-lg" />
        </div>
        {/* Stock badge skeleton (top-right) */}
        <div className="absolute top-2 right-2 z-30">
          <div className="h-6 w-24 bg-gray-200/80 rounded-full shadow-sm" />
        </div>
      </div>

      {/* Content - right side */}
      <div className="col-span-12 md:col-span-8 content-center">
        {/* Product name skeleton - Matches ProductName */}
        <div className="h-7 bg-gray-200 rounded w-3/4" />

        {/* Price and brand section - Matches the flex layout in TireCard */}
        <div className="flex flex-wrap mb-4 mt-4 gap-5 items-center justify-between">
          {/* Price and brand area */}
          <div className="flex gap-2 items-center justify-center">
            {/* Price skeleton */}
            <div className="h-8 bg-gray-200 rounded-full w-24" />
            {/* Brand skeleton */}
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
          </div>

          {/* Buttons area */}
          <div className="flex items-center gap-2 justify-center w-full md:w-auto">
            {/* View details button skeleton */}
            <div className="h-10 bg-gray-200 rounded-full w-28" />
            {/* Add to cart button skeleton */}
            <div className="h-10 bg-gray-300 rounded-full w-28" />
          </div>
        </div>

        {/* Features section - Matches the feature box in TireCard */}
        <div className="flex flex-wrap gap-3 justify-between bg-gray-100 py-2 px-2 xs:px-4 rounded-xl xs:rounded-2xl border-gray-500">
          {/* Feature items - Create 4 placeholders to match the layout */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-1">
              <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
              <div className="h-4 bg-gray-300 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </li>
);

export const ResultsSkeleton: FC<SkeletonProps> = ({ count = 6, className = '' }) => {
  return (
    <ul className={`mt-3 ${className}`} role="status" aria-label="Loading results">
      {Array.from({ length: count }).map((_, index) => (
        <TireCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading...</span>
    </ul>
  );
};

export default ResultsSkeleton;
