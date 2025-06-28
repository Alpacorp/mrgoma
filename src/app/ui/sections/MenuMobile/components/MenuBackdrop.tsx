import React from 'react';

interface MenuBackdropProps {
  isAnimating: boolean;
  onClick: (e: React.MouseEvent) => void;
  duration?: number;
}

/**
 * Backdrop component for the mobile menu
 * Renders a semi-transparent overlay with a blur effect
 */
export const MenuBackdrop: React.FC<MenuBackdropProps> = ({
  isAnimating,
  onClick,
  duration = 500,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClick}
      style={{
        pointerEvents: 'auto',
        transitionDuration: `${duration}ms`,
      }}
      aria-hidden="true"
    />
  );
};
