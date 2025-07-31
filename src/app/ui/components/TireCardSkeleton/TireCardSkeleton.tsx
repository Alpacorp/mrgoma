import { FC } from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
}

const TireCardSkeleton: FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-full animate-pulse flex gap-6">
    {/* Image skeleton - left side */}
    <div className="relative w-64 h-52 flex-shrink-0">
      <div className="w-full h-full bg-gray-200 rounded-lg" />
    </div>

    {/* Content - right side */}
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Title and brand skeleton */}
        <div className="space-y-2 mt-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>

        <div className="flex gap-2 items-center justify-between">
          {/* Price skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
          {/* Bottom section with buttons */}
          <div className="flex items-center gap-4">
            <div className="h-10 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-24" />
          </div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 rounded w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const ResultsSkeleton: FC<SkeletonProps> = ({ count = 6, className = '' }) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`} role="status" aria-label="Loading results">
      {Array.from({ length: count }).map((_, index) => (
        <TireCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default ResultsSkeleton;
