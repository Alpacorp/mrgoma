import type { Metadata } from 'next';

import Contact from '@/app/(shop)/contact/container/Contact/Contact';
import { canonical } from '@/app/utils/seo';

export const metadata: Metadata = {
  title: 'Contact Us | 7 Locations in Miami & Orlando',
  description:
    'Reach MrGoma Tires at any of our 7 locations across Miami and Orlando, FL. Call, WhatsApp, or visit us. ASE-certified technicians.',
  alternates: { canonical: canonical('/contact') },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <Contact />;
}
