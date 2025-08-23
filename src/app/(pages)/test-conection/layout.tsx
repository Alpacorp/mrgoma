import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'MrGoma Tires',
  description: 'MrGoma Tires is a tire shop in Miami, FL',
  keywords: 'tires, miami, shop, tire shop, used tires, new tires',
};

export default function TestConnectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
