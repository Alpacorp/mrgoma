import type { Metadata } from 'next';

import AboutUs from '@/app/(shop)/about-us/container/AboutUs/AboutUs';
import { aboutMetadata } from '@/app/utils/seo';

export const metadata: Metadata = aboutMetadata();

export default function AboutUsPage() {
  return <AboutUs />;
}
