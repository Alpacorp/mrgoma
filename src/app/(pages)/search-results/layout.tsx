import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'MrGoma Tires SearchResults',
  description: 'MrGoma Tires is a tire shop in Miami, FL',
  keywords: 'tires, miami, shop, tire shop, used tires, new tires',
};

export default function SearchResultsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
