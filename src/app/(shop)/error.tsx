'use client';

import { useEffect } from 'react';

export default function ShopError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500">We couldn&apos;t load this page. Please try again.</p>
      <button
        onClick={reset}
        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Try again
      </button>
    </div>
  );
}
