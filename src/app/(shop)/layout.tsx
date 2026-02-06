import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { CartProvider } from '@/app/context/CartContext';
import { SelectedFiltersProvider } from '@/app/context/SelectedFilters';
import { DetailModalProvider } from '@/app/context/ShowDetailModal';
import { FiltersProvider } from '@/app/context/ShowFilterContext';
import { MenuProvider } from '@/app/context/ShowMenuContext';
import { SessionProvider } from 'next-auth/react';
import { CookieConsent } from '@/app/ui/components';
import GoogleAnalytics from '@/app/ui/components/GoogleAnalytics/GoogleAnalytics';
import { Footer, Header, TopHeader } from '@/app/ui/sections';
import { buildDefaultMetadata, organizationJsonLd, websiteJsonLd } from '@/app/utils/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="sticky top-0 z-50">
        <TopHeader />
        {/*<PromoBar />*/}
        <Header />
      </div>
      {children}
      <Footer />
    </div>
  );
}
