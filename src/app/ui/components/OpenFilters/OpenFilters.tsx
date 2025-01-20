import { FunnelIcon } from '@heroicons/react/20/solid';
import { FC, useContext } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';

const OpenFilters: FC = () => {
  const { setShowFilter } = useContext(ShowFilterContext);

  return (
    <button
      type="button"
      onClick={() => setShowFilter(true)}
      className="-m-2 ml-4 p-2 text-green-primary sm:ml-6 lg:hidden"
    >
      <span className="sr-only">Filters</span>
      <FunnelIcon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
};

export default OpenFilters;
