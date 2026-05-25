import type { Metadata } from 'next';

import AboutUs from '@/app/(shop)/about-us/container/AboutUs/AboutUs';
import { canonical } from '@/app/utils/seo';

export const metadata: Metadata = {
  title: 'About MrGoma Tires | 7 Locations in Miami & Orlando',
  description:
    'Learn about MrGoma Tires — ASE-certified technicians, 180-day warranty on used tires, 7 locations across Miami and Orlando, FL. Free shipping nationwide.',
  alternates: { canonical: canonical('/about-us') },
};

export default function AboutUsPage() {
  return <AboutUs />;
}
