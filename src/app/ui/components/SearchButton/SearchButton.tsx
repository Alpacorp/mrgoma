import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import React from 'react';

function SearchButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-x-1.5 rounded-md bg-green-primary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-primary rounded-l-none"
    >
      <MagnifyingGlassIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
    </button>
  );
}

export default SearchButton;
