'use client';

import { createContext, useMemo, useState } from 'react';

interface FilterContextType {
  showFilter: boolean;
  setShowFilter: (value: boolean) => void;
}

export const ShowFilterContext = createContext<FilterContextType>({
  showFilter: false,
  setShowFilter: (value: boolean) => {},
});

export const FiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const contextValue = useMemo(() => ({ showFilter, setShowFilter }), [showFilter, setShowFilter]);

  return <ShowFilterContext.Provider value={contextValue}>{children}</ShowFilterContext.Provider>;
};
