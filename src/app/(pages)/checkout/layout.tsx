import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Checkout - MrGoma Tires',
  description: 'Your Trusted Tire Shop in Miami - Quality New and Used Tires',
  keywords: 'tires, miami, shop, tire shop, used tires, new tires',
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
