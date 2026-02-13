import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MrGoma Tires',
  description: 'MrGoma Tires is a tire shop in Miami, FL',
};

export default function DetailLayout({
  children,
}: Readonly<{


  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
