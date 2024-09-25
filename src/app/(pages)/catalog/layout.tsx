import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mr. Goma Tires Catalog',
  description: 'Mr. Goma Tires is a tire shop in Miami, FL',
  keywords: 'tires, miami, shop, tire shop, used tires, new tires',
};

export default function CatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return <>{children}</>;
}
