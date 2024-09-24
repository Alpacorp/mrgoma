import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MenuProvider } from '@/app/context/ShowMenuContext';
import { FiltersProvider } from '@/app/context/ShowFilterContext';
import Header from '@/app/ui/sections/Header/Header';

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
          </body>
        </MenuProvider>
      </FiltersProvider>
    </html>
  );
}
