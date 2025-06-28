'use client';

import { FC, useContext } from 'react';

import { ShowMenuContext } from '@/app/context/ShowMenuContext';

import { MenuBackdrop, MenuPanel } from './components';
import { useMenuAnimation } from './hooks';

/**
 * Mobile menu component
 * Handles the mobile navigation menu with animations
 */
const MenuMobile: FC = () => {
  const { showMenu, setShowMenu } = useContext(ShowMenuContext);

  // Use custom hook for animation logic
  const { isVisible, isAnimating, animationStage, pointerEvents } = useMenuAnimation({
    isOpen: showMenu,
    itemCount: 4, // Number of menu items
  });

  // Close menu handler
  const closeMenu = () => setShowMenu(false);

  // Handle backdrop clicks
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeMenu();
    }
  };

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-[100]"
      style={{ pointerEvents }}
    >
      {/* Backdrop with blur and semi-transparent overlay */}
      <MenuBackdrop
        isAnimating={isAnimating}
        onClick={handleBackdropClick}
      />

      {/* Sliding menu panel with content */}
      <MenuPanel
        isAnimating={isAnimating}
        animationStage={animationStage}
        onClose={closeMenu}
      />
    </div>
  );
};

export default MenuMobile;
