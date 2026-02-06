'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { FC, ReactNode, useEffect, useState } from 'react';

import { mrGomaLogo } from '#public/assets/images/Logo';
import { useCart } from '@/app/context/CartContext';
import { HamburgerMenu } from '@/app/ui/components';
import { ShoppingCart } from '@/app/ui/icons';
import { CartModal, MenuMobile } from '@/app/ui/sections';
import { menuItems } from '@/app/ui/sections/Header/MenuItems';
import { useSession } from "next-auth/react"

/**
 * Header component for the website
 * Contains the logo, navigation links, and shopping cart icon
 * The header is sticky and has a background with a gradient and an image
 * @returns {ReactNode} The rendered header component
 */
const Header: FC = (): ReactNode => {
  const { cartCount, setShowCartModal } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession()


  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCartModal(true);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-black backdrop-blur-sm backdrop-filter backdrop-saturate-150 border-b border-white/10 shadow-sm">
        <div className="absolute inset-0 bg-[#111]">
          <div className="absolute z-10 w-full h-full bg-gradient-to-r from-black via-[#1A1A1A] to-[#9DFB40] opacity-80"></div>
          <Image src="/assets/images/bg-header.svg" alt="" fill className="object-cover" priority />
        </div>

        <nav
          aria-label="Global"
          className="relative z-10 mx-auto flex max-w-7xl items-center justify-between p-4"
        >
          <div className="w-full flex items-center justify-between gap-4 rounded-2xl bg-black/40 border border-white/10 px-4 py-2 shadow-sm backdrop-blur-md">
            <HamburgerMenu />
            <Link href="/" className="-m-1.5 p-1.5">
              <Image
                alt="MrGoma Tires logo"
                title="Go to the home page"
                aria-label="Go to the home page"
                src={mrGomaLogo || '/placeholder.svg'}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <div className="hidden lg:flex lg:gap-x-12 items-center">
              {menuItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold leading-6 text-white hover:text-[#65D01E] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex">
              <button
                onClick={handleCartClick}
                className="flex items-center justify-center cursor-pointer rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label={isMounted ? `Shopping cart with ${cartCount} items` : 'Shopping cart'}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"></span>
                    <span className="relative bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  </span>
                )}
              </button>
              <Link href="/login" className="bg-[#9dfb40] p-2 px-3 rounded-lg ml-4 text-sm">Sign in</Link>
            </div>
          </div>
        </nav>
      </header>
      <MenuMobile />
      <CartModal />
    </>
  );
};

export default Header;
