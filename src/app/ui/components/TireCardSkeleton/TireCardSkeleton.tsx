import { FC } from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
}

const TireCardSkeleton: FC = () => (
  <li
    className="isolate bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse"
    style={{ borderLeftWidth: 4, borderLeftColor: '#d1d5db' }}
  >
    <div className="flex flex-col sm:flex-row">
      {/* Mobile top bar: condition badge + stock badge */}
      <div className="sm:hidden flex items-center justify-between px-4 py-2.5">
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Image */}
      <div className="bg-gray-200 h-48 sm:h-auto sm:min-h-[180px] sm:w-52 md:w-64 sm:shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col px-4 pt-4 pb-5 sm:px-6 sm:py-5 gap-3 sm:gap-2">
        {/* Desktop: meta + CTA button */}
        <div className="hidden sm:flex items-start justify-between gap-3">
          <div className="h-3.5 w-36 bg-gray-200 rounded mt-0.5" />
          <div className="h-9 w-32 bg-gray-200 rounded-full shrink-0" />
        </div>

        {/* Condition badge (desktop) + size pill */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block h-6 w-14 bg-gray-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-300 rounded-full" />
        </div>

        {/* Title — two lines */}
        <div className="flex flex-col gap-2">
          <div className="h-5 bg-gray-200 rounded w-full" />
          <div className="h-5 bg-gray-200 rounded w-4/5" />
        </div>

        {/* Price + free shipping badge + brand logo */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-8 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-28 bg-gray-200 rounded-full" />
          <div className="hidden sm:block h-8 w-20 bg-gray-200 rounded ml-1" />
        </div>

        {/* Mobile CTA button */}
        <div className="sm:hidden mt-1 mb-2">
          <div className="h-11 bg-gray-200 rounded-full w-full" />
        </div>
      </div>
    </div>

    {/* Spec strip */}
    <div className="grid grid-cols-4 divide-x divide-gray-200 border-t border-gray-200 bg-gray-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1 px-3 py-2.5">
          <div className="h-2 w-10 bg-gray-300 rounded" />
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </li>
);

export const ResultsSkeleton: FC<SkeletonProps> = ({ count = 6, className = '' }) => (
  <div className="mx-auto max-w-3xl px-3 sm:px-0">
    <ul className={`mt-3 space-y-6 ${className}`} role="status" aria-label="Loading results">
      {Array.from({ length: count }).map((_, index) => (
        <TireCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading...</span>
    </ul>
  </div>
);

export default ResultsSkeleton;
