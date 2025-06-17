'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { FC } from 'react';

import { mrGomaLogo } from '#public/assets/images/Logo';
import HamburgerMenu from '@/app/ui/components/HamburgerMenu/HamburgerMenu';
import { ShoppingCart } from '@/app/ui/icons';
import { MenuMobile } from '@/app/ui/sections';
import { menuItems } from '@/app/ui/sections/Header/MenuItems';

const Header: FC = () => {
  return (
    <header className="w-full sticky top-0 z-10 bg-black backdrop-blur-sm backdrop-filter backdrop-saturate-150">
      <div className="absolute inset-0 bg-[#111]">
        <div className="absolute z-10 w-full h-full bg-gradient-to-r from-black via-[#1A1A1A] to-[#9DFB40] opacity-80"></div>
        <Image src="/assets/images/bg-header.svg" alt="" fill className="object-cover" priority />
      </div>

      <nav
        aria-label="Global"
        className="relative z-10 mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <HamburgerMenu />
        <MenuMobile />
        <Link href="/" className="-m-1.5 p-1.5">
          <Image
            alt="Mr. Goma Tires logo"
            title="Go to the home page"
            aria-label="Go to the home page"
            src={mrGomaLogo || '/placeholder.svg'}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="hidden lg:flex lg:gap-x-12">
          {menuItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibo  ld leading-6 text-white hover:text-[#65D01E] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <Link
          href="/search-results"
          className="hidden lg:flex items-center justify-center rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Store
        </Link>
      </nav>
    </header>
  );
};

export default Header;
