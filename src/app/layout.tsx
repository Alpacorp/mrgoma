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
import GoogleAnalytics from '@/app/ui/components/GoogleAnalytics/GoogleAnalytics';
import { Footer, Header, TopHeader } from '@/app/ui/sections';
import { buildDefaultMetadata, organizationJsonLd, websiteJsonLd } from '@/app/utils/seo';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/x-icon" />
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd())}</script>
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd())}</script>
      </head>
      <DetailModalProvider>
        <FiltersProvider>
          <SelectedFiltersProvider>
            <MenuProvider>
              <CartProvider>
                <body className={inter.className} suppressHydrationWarning={true}>
                  <React.Suspense fallback={null}>
                    <GoogleAnalytics />
                  </React.Suspense>
                  <div className="sticky top-0 z-50">
                    <TopHeader />
                    {/*<PromoBar />*/}
                    <Header />
                  </div>
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
