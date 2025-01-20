'use client';

import { createContext, useMemo, useState } from 'react';

interface DetailModalContextType {
  showDetailModal: boolean;
  setShowDetailModal: (value: boolean) => void;
}

export const ShowDetailModalContext = createContext<DetailModalContextType>({
  showDetailModal: false,
  setShowDetailModal: (value: boolean) => {},
});

export const DetailModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  const contextValue = useMemo(
    () => ({ showDetailModal, setShowDetailModal }),
    [showDetailModal, setShowDetailModal]
  );

  return (
    <ShowDetailModalContext.Provider value={contextValue}>
      {children}
    </ShowDetailModalContext.Provider>
  );
};
