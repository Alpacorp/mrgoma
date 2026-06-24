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
    children: [
      { name: 'Cutler Bay', href: '/locations/cutler-bay', city: 'Miami' },
      { name: 'Miami Airport', href: '/locations/miami-airport', city: 'Miami' },
      { name: 'Miami Gardens', href: '/locations/miami-gardens', city: 'Miami' },
      { name: 'Coral Gables', href: '/locations/coral-gables', city: 'Miami' },
      { name: 'Hialeah', href: '/locations/hialeah', city: 'Miami' },
      { name: 'Orlando West Colonial', href: '/locations/orlando-west-colonial', city: 'Orlando' },
      { name: 'East Orlando', href: '/locations/east-orlando', city: 'Orlando' },
    ],
  },
  { name: 'About us', href: '/about-us' },
  { name: 'Guides', href: '/guides' },
  { name: 'Contact us', href: '/contact' },
];
