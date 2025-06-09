'use client';

import { createContext, ReactNode, useMemo, useState } from 'react';

interface DetailModalContextType {
  showDetailModal: boolean;
  setShowDetailModal: (value: boolean) => void;
}

export const ShowDetailModalContext = createContext<DetailModalContextType>({
  showDetailModal: false,
  setShowDetailModal: () => {},
});

export const DetailModalProvider = ({ children }: { children: ReactNode }) => {
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
