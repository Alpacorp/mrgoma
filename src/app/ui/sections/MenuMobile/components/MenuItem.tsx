import Link from 'next/link';
import React from 'react';

interface MenuItemProps {
  name: string;
  href: string;
  index: number;
  animationStage: number;
  onClick: () => void;
}

/**
 * Individual menu item component
 * Handles its own animation based on index and animation stage
 */
export const MenuItem: React.FC<MenuItemProps> = ({
  name,
  href,
  index,
  animationStage,
  onClick,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-lg px-4 py-3 text-base font-semibold text-white hover:bg-[#222] hover:text-[#65D01E] transition-all duration-300 border border-[#333] hover:border-[#65D01E]/50 ${
        animationStage >= index + 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
    >
      {name}
    </Link>
  );
};
