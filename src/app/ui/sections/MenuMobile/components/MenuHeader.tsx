import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { mrGomaLogo } from '#public/assets/images/Logo';
import { XMarkIcon } from '@/app/ui/icons/XMarkIcon';

interface MenuHeaderProps {
  onClose: () => void;
  animationStage: number;
}

/**
 * Header component for the mobile menu
 * Contains the logo and close button
 */
export const MenuHeader: React.FC<MenuHeaderProps> = ({ onClose, animationStage }) => {
  return (
    <div
      className={`flex items-center justify-between transition-all duration-300 ease-out ${
        animationStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <Link href="/" className="-m-1.5 p-1.5 bg-black rounded">
        <Image
          alt="Mr. Goma Tires logo"
          title="Go to the home page"
          aria-label="Go to the home page"
          src={mrGomaLogo}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="-m-2.5 rounded-full p-2.5 text-white hover:bg-[#333] transition-colors"
        aria-label="Close menu"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  );
};
