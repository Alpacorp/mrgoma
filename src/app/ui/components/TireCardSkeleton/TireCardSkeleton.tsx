import { FC } from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
}

const TireCardSkeleton: FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-full animate-pulse flex gap-6">
    {/* Image skeleton - left side */}
    <div className="relative w-48 h-48 flex-shrink-0">
      <div className="w-full h-full bg-gray-200 rounded-lg" />
    </div>

    {/* Content - right side */}
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Title and brand skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>

        {/* Price skeleton */}
        <div className="h-8 bg-gray-200 rounded w-24" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>

      {/* Bottom section with buttons */}
      <div className="flex items-center gap-4 mt-4">
        <div className="h-10 bg-gray-200 rounded flex-1" />
        <div className="h-10 bg-gray-200 rounded w-32" />
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
