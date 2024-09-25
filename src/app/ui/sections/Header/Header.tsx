'use client';

import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { menuItems } from '@/app/ui/sections/Header/MenuItems';
import HamburguerMenu from '@/app/ui/components/HamburguerMenu/HamburguerMenu';
import MenuMobile from '@/app/ui/sections/MenuMobile/MenuMobile';

import { mrGomaLogo } from '#public/assets/images/Logo';

const Header: FC = () => {
  return (
    <header className="bg-black">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <HamburguerMenu />
        <MenuMobile />
        <Link href="#" className="-m-1.5 p-1.5">
          <Image
            alt="Mr. Goma Tires logo"
            title="Go to the home page"
            aria-label="Go to the home page"
            src={mrGomaLogo}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="hidden lg:flex lg:gap-x-12 ">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
