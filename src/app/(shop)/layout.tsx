import React from 'react';

import { Header, TopHeader } from '@/app/ui/sections';
import { FooterWrapper } from '@/app/ui/sections/Footer/FooterWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="sticky top-0 z-50">
        <TopHeader />
        <Header />
      </div>
      {children}
      <FooterWrapper />
    </div>
  );
}
