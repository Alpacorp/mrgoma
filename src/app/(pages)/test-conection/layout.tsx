import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'MrGoma Tires',
  description: 'MrGoma Tires is a tire shop in Miami, FL',
};

export default function TestConnectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
