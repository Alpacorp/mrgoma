import type { Metadata } from 'next';

import Contact from '@/app/(shop)/contact/container/Contact/Contact';
import { contactMetadata } from '@/app/utils/seo';

export const metadata: Metadata = contactMetadata();

export default function ContactPage() {
  return <Contact />;
}
