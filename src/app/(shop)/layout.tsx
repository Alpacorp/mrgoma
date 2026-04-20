import React from 'react';

import { Header, TopHeader } from '@/app/ui/sections';
import { Footer } from '@/app/ui/sections/Footer/Footer';

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
      <Footer />
    </div>
  );
}
