import React from 'react';

import { MenuHeader } from './MenuHeader';
import { MenuItems } from './MenuItems';

interface MenuPanelProps {
  isAnimating: boolean;
  animationStage: number;
  onClose: () => void;
  duration?: number;
}

/**
 * Sliding panel component for the mobile menu
 * Contains the header, menu items, and background
 */
export const MenuPanel: React.FC<MenuPanelProps> = ({
  isAnimating,
  animationStage,
  onClose,
  duration = 500,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-[100] w-80 overflow-y-auto bg-[#111] px-6 py-6 sm:w-sm shadow-xl border-r border-[#333] transform transition-all ease-out ${
        isAnimating ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-[#1A1A1A] to-[#222] opacity-80" />

      {/* Content */}
      <div className="relative z-10">
        <MenuHeader onClose={onClose} animationStage={animationStage} />
        <MenuItems onItemClick={onClose} animationStage={animationStage} />
      </div>
    </div>
  );
};
