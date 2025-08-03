'use client';

import React, { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';

type SelectedFilters = {
  width: string;
  sidewall: string;
  diameter: string;
};

interface SelectedFiltersContextProps {
  selectedFilters: SelectedFilters;
  setSelectedFilters: Dispatch<SetStateAction<SelectedFilters>>;
}

const defaultSelectedFilters: SelectedFilters = {
  width: '',
  sidewall: '',
  diameter: '',
};

export const SelectedFiltersContext = createContext<SelectedFiltersContextProps>({
  selectedFilters: defaultSelectedFilters,
  setSelectedFilters: () => {},
});

export const SelectedFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(defaultSelectedFilters);

  const contextValue = useMemo(
    () => ({
      selectedFilters,
      setSelectedFilters,
    }),
    [selectedFilters]
  );

  return (
    <SelectedFiltersContext.Provider value={contextValue}>
      {children}
    </SelectedFiltersContext.Provider>
  );
};
