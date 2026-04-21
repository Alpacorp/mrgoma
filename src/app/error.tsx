'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Try again
      </button>
    </div>
  );
}
