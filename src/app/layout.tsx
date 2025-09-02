import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { CartProvider } from '@/app/context/CartContext';
import { SelectedFiltersProvider } from '@/app/context/SelectedFilters';
import { DetailModalProvider } from '@/app/context/ShowDetailModal';
import { FiltersProvider } from '@/app/context/ShowFilterContext';
import { MenuProvider } from '@/app/context/ShowMenuContext';
import { CookieConsent } from '@/app/ui/components';
import { Footer, Header } from '@/app/ui/sections';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MrGoma Tires',
  description: 'MrGoma Tires is a tire shop in Miami, FL',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/x-icon" />
        <title>Mr Goma Tires</title>
      </head>
      <DetailModalProvider>
        <FiltersProvider>
          <SelectedFiltersProvider>
            <MenuProvider>
              <CartProvider>
                <body className={inter.className}>
                  <Header />
                  {children}
                  <Footer />
                  <CookieConsent />
                  <Analytics />
                </body>
              </CartProvider>
            </MenuProvider>
          </SelectedFiltersProvider>
        </FiltersProvider>
      </DetailModalProvider>
    </html>
  );
}
