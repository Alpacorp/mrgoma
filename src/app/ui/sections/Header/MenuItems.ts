export interface MenuChild {
  name: string;
  href: string;
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
      { name: 'Miami – South (US-1)', href: '/locations/miami-south-us1' },
      { name: 'Miami – Airport', href: '/locations/miami-airport' },
      { name: 'Miami – North (441)', href: '/locations/miami-north-441' },
      { name: 'Miami – Coral Gables', href: '/locations/miami-coral-gables' },
      { name: 'Miami – Hialeah', href: '/locations/miami-hialeah' },
      { name: 'Orlando – West Colonial', href: '/locations/orlando-west-colonial' },
      { name: 'Orlando – Semoran', href: '/locations/orlando-semoran' },
    ],
  },
  { name: 'About us', href: '/about-us' },
  { name: 'Guides', href: '/guides' },
  { name: 'Contact us', href: '/contact' },
];
