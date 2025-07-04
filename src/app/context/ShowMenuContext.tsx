'use client';

import { createContext, ReactNode, useMemo, useState } from 'react';

interface MenuContextType {
  showMenu: boolean;
  setShowMenu: (value: boolean) => void;
}

export const ShowMenuContext = createContext<MenuContextType>({
  showMenu: false,
  setShowMenu: () => {},
});

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const contextValue = useMemo(() => ({ showMenu, setShowMenu }), [showMenu, setShowMenu]);

  return <ShowMenuContext.Provider value={contextValue}>{children}</ShowMenuContext.Provider>;
};
