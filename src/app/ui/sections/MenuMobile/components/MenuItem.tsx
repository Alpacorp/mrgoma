import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isActive =
    pathname === href || (pathname === '/' && activeHash === href.replace('/', ''));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-lg px-4 py-3 text-base font-semibold transition-all duration-300 border ${
        isActive
          ? 'bg-[#222] text-[#65D01E] border-[#65D01E]/50'
          : 'text-white hover:bg-[#222] hover:text-[#65D01E] border-[#333] hover:border-[#65D01E]/50'
      } ${
        animationStage >= index + 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}
    >
      {name}
    </Link>
  );
};
