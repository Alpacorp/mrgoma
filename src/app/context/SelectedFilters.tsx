'use client';

import { createContext, useMemo, useState } from 'react';

interface SelectedFiltersContextType {
  selectedFilters: {
    width: string;
    sidewall: string;
    diameter: string;
  };
  setSelectedFilters: any;
}

export const SelectedFiltersContext = createContext<SelectedFiltersContextType>({
  selectedFilters: {
    width: '',
    sidewall: '',
    diameter: '',
  },
  setSelectedFilters: (value: string) => {},
});

export const SelectedFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    width: '',
    sidewall: '',
    diameter: '',
  });

  console.log('selectedFilters into context', selectedFilters);

  const contextValue = useMemo(
    () => ({ selectedFilters, setSelectedFilters }),
    [selectedFilters, setSelectedFilters]
  );

  return (
    <SelectedFiltersContext.Provider value={contextValue}>
      {children}
    </SelectedFiltersContext.Provider>
  );
};

