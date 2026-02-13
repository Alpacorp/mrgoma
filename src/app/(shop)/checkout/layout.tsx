import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - MrGoma Tires',
  description: 'Your Trusted Tire Shop in Miami - Quality New and Used Tires',
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
