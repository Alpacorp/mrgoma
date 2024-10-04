import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { MenuProvider } from '@/app/context/ShowMenuContext';
import { FiltersProvider } from '@/app/context/ShowFilterContext';

import { Footer, Header } from '@/app/ui/sections';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mr. Goma Tires',
  description: 'Mr. Goma Tires is a tire shop in Miami, FL',
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
      </head>
      <FiltersProvider>
        <MenuProvider>
          <body className={inter.className}>
            <Header />
            {children}
            <Footer />
          </body>
        </MenuProvider>
      </FiltersProvider>
    </html>
  );
}
