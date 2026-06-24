import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';

export interface MenuChild {
  name: string;
  href: string;
  city?: 'Miami' | 'Orlando';
}

export interface MenuItem {
  name: string;
  href: string;
  children?: MenuChild[];
}

export const menuItems: MenuItem[] = [
  { name: 'Shop Tires', href: '/tires' },
  { name: 'Services', href: '/services' },
  {
    name: 'Locations',
    href: '/locations',
    children: locationsConfig.map(l => ({
      name: l.name,
      href: `/locations/${l.slug}`,
      city: l.city,
    })),
  },
  { name: 'About us', href: '/about-us' },
  { name: 'Guides', href: '/guides' },
  { name: 'Contact us', href: '/contact' },
];
