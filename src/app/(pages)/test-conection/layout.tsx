import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mr. Goma Tires',
  description: 'Mr. Goma Tires is a tire shop in Miami, FL',
  keywords: 'tires, miami, shop, tire shop, used tires, new tires',
};

export default function TestConectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return <>{children}</>;
}
