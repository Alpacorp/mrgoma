'use client';

import { usePathname } from 'next/navigation';

import { DashboardFooter, Footer } from '@/app/ui/sections/Footer/Footer';

export const FooterWrapper = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard')) {
    return <DashboardFooter />;
  }

  return <Footer />;
};
