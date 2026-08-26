import { FC } from 'react';

import Link from 'next/link';

export type LooseningSuggestion = {
  /** The filter to drop, named the way the buyer chose it. */
  label: string;
  /** How many tires dropping it returns. */
  count: number;
  href: string;
};

interface NoResultsFoundProps {
  title?: string;
  message?: string;
  className?: string;
  /**
   * Ways out, each with the number of tires it leads to.
   *
   * **79% of the brand × rim combinations this catalogue offers have no stock**
   * — only 338 of 1.610. Until now the page answered every one of them with
   * "Please try different specifications" and left all 114 brand chips on
   * screen, saying nothing about which of them would have worked. These are that
   * answer.
   */
  suggestions?: LooseningSuggestion[];
}

const NoResultsIconAlt: FC = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-6"
  >
    {/* Background circle */}
    <circle cx="100" cy="100" r="90" fill="#F3F4F6" opacity="0.5" />

    {/* Magnifying glass */}
    <g transform="translate(40, 40)">
      {/* Glass circle */}
      <circle cx="50" cy="50" r="35" stroke="#9CA3AF" strokeWidth="6" fill="white" />

      {/* Handle */}
      <line
        x1="75"
        y1="75"
        x2="110"
        y2="110"
        stroke="#9CA3AF"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Exclamation mark inside circle */}
      <circle cx="50" cy="40" r="3" fill="#9CA3AF" />
      <line
        x1="50"
        y1="48"
        x2="50"
        y2="65"
        stroke="#9CA3AF"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </g>

    {/* Decorative elements */}
    <path
      d="M160 40 L170 40 M165 35 L165 45"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M30 140 L40 140 M35 135 L35 145"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="155" cy="140" r="4" fill="#D1D5DB" />
  </svg>
);

export const NoResultsFound: FC<NoResultsFoundProps> = ({
  title = 'No Results Found',
  message = "Sorry, we couldn't find any matches for your search criteria.",
  className = '',
  suggestions = [],
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center 
        py-12 px-4 
        bg-white rounded-lg shadow-sm
        ${className}
      `}
    >
      <NoResultsIconAlt />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-center max-w-md">{message}</p>

      {suggestions.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 text-center text-sm font-semibold text-gray-700">
            Try removing one of these:
          </p>
          <ul className="flex flex-col gap-2">
            {suggestions.map(suggestion => (
              <li key={suggestion.href}>
                <Link
                  href={suggestion.href}
                  data-track="filter_loosen"
                  data-track-category="tires_filter"
                  data-track-label={suggestion.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors hover:border-green-600 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <span className="font-semibold text-gray-800">Remove {suggestion.label}</span>
                  <span className="shrink-0 tabular-nums text-green-700">
                    {suggestion.count.toLocaleString('en-US')}{' '}
                    {suggestion.count === 1 ? 'tire' : 'tires'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NoResultsFound;
