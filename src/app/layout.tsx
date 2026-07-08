import React from 'react';

import { Inter } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import { CartProvider } from '@/app/context/CartContext';
import { SelectedFiltersProvider } from '@/app/context/SelectedFilters';
import { DetailModalProvider } from '@/app/context/ShowDetailModal';
import { FiltersProvider } from '@/app/context/ShowFilterContext';
import { MenuProvider } from '@/app/context/ShowMenuContext';
import { CookieConsent } from '@/app/ui/components';
import SiteAiChat from '@/app/ui/components/AiChat/SiteAiChat';
import GoogleAnalytics from '@/app/ui/components/GoogleAnalytics/GoogleAnalytics';
import InteractionTracker from '@/app/ui/components/InteractionTracker/InteractionTracker';
import { locationsData } from '@/app/ui/sections/LocationsSlider/locationsData';
import {
  buildDefaultMetadata,
  buildLocationsJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '@/app/utils/seo';

import './globals.css';

// Inter is the app's single typeface. Options are explicit (not left to
// next/font defaults) so the loading decision is reviewable and regression-safe:
// - `display: 'swap'` — show the fallback immediately, swap Inter in (no FOIT).
// - `preload: true` — request the Inter woff2 as early as possible.
// - `adjustFontFallback: true` — generate a size-adjusted "Inter Fallback"
//   (@font-face with size-adjust/ascent-override…) so the swap causes no CLS.
// - `variable` — expose Inter as `--font-inter` and wire it as Tailwind's `sans`
//   token (tailwind.config.ts) so `font-sans` utilities resolve to Inter too.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-inter',
});

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.png" sizes="any" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/desk-logo.png" />
        {/* Hide an already-dismissed PromoBanner before it paints, so a returning
            user's banner never occupies space and hydration causes no layout
            shift. Reads the `promo_<key>=dismissed` cookie and injects a hide-rule
            for `#promo-<key>` before the body parses. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var i=[];document.cookie.split('; ').forEach(function(c){var m=c.match(/^promo_(.+)=dismissed$/);if(m)i.push('#promo-'+m[1]);});if(i.length){var s=document.createElement('style');s.textContent=i.join(',')+'{display:none!important}';document.head.appendChild(s);}}catch(e){}})();",
          }}
        />
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd())}</script>
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd())}</script>
        {buildLocationsJsonLd(
          locationsData.map(l => ({
            name: l.name,
            address: l.address,
            phone: l.phone,
            mapLink: l.link,
          }))
        ).map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </head>
      <SessionProvider>
        <DetailModalProvider>
          <FiltersProvider>
            <SelectedFiltersProvider>
              <MenuProvider>
                <CartProvider>
                  <body className="font-sans" suppressHydrationWarning={true}>
                    <React.Suspense fallback={null}>
                      <GoogleAnalytics />
                    </React.Suspense>
                    <InteractionTracker />
                    {children}
                    <SiteAiChat />
                    <CookieConsent />
                    <Analytics />
                  </body>
                </CartProvider>
              </MenuProvider>
            </SelectedFiltersProvider>
          </FiltersProvider>
        </DetailModalProvider>
      </SessionProvider>
    </html>
  );
}
