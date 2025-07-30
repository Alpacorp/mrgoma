import { FC } from 'react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: string;
  className?: string;
  onRetry?: () => void;
}

const ErrorIcon: FC = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-6"
  >
    {/* Background circle */}
    <circle cx="100" cy="100" r="90" fill="#FEE2E2" opacity="0.5" />

    {/* Error icon */}
    <g transform="translate(50, 50)">
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" stroke="#EF4444" strokeWidth="6" fill="white" />

      {/* "X" mark */}
      <line
        x1="32"
        y1="32"
        x2="68"
        y2="68"
        stroke="#EF4444"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="68"
        y1="32"
        x2="32"
        y2="68"
        stroke="#EF4444"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </g>

    {/* Decorative elements */}
    <path
      d="M160 40 L170 40 M165 35 L165 45"
      stroke="#FCA5A5"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M30 140 L40 140 M35 135 L35 145"
      stroke="#FCA5A5"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="155" cy="140" r="4" fill="#FCA5A5" />
  </svg>
);

const ErrorDisplay: FC<ErrorDisplayProps> = ({
  title = 'Oops! Something went wrong',
  message = 'We encountered an error while processing your request.',
  error,
  className = '',
  onRetry,
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center 
        py-12 px-4 
        bg-white rounded-lg shadow-sm
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <ErrorIcon />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-center max-w-md mb-4">{message}</p>

      {/* Technical details - collapsible */}
      {error && (
        <details className="mt-2 text-sm">
          <summary className="text-gray-600 cursor-pointer hover:text-gray-800">
            Technical Details
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-w-full text-sm text-red-600">
            {error}
          </pre>
        </details>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
