'use client';

import { createContext, ReactNode, useMemo, useState } from 'react';

interface FilterContextType {
  showFilter: boolean;
  setShowFilter: (value: boolean) => void;
}

export const ShowFilterContext = createContext<FilterContextType>({
  showFilter: false,
  setShowFilter: () => {},
});

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const contextValue = useMemo(() => ({ showFilter, setShowFilter }), [showFilter, setShowFilter]);

  return <ShowFilterContext.Provider value={contextValue}>{children}</ShowFilterContext.Provider>;
};
