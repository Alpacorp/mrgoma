import React from 'react';

import { citiesLabel } from '@/app/utils/cartSets';

type City = 'Miami' | 'Orlando';

/**
 * Where a cart tire is: the city only, never the warehouse (feature 041).
 * `cities` names where a set's tires are — one city, or "Miami and Orlando"
 * (feature 047, D5). Nothing marks a tire as blocking pickup any more: pickup
 * is at any store (047, D2).
 */
const CityTag: React.FC<{ city?: City; cities?: Array<City | undefined>; className?: string }> = ({
  city,
  cities,
  className,
}) => {
  const label = cities ? citiesLabel(cities) : city;
  if (!label) return null;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        // Same shape as the condition pill.
        'bg-white text-gray-800 ring-gray-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        <span className="sr-only">Located in </span>
        {label}
      </span>
    </span>
  );
};

export default CityTag;
