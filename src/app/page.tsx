import type { Metadata, NextPage } from 'next';

import HomeContent from '@/app/(pages)/home/container/Home/HomeContent';
import { canonical } from '@/app/utils/seo';

export const metadata: Metadata = {
  title: 'Buy New & Used Tires in Miami, FL | MrGoma Tires',
  description:
    'Shop new and used tires in Miami. Fast installation, multiple locations, and secure online ordering at MrGoma Tires.',
  alternates: { canonical: canonical('/') },
};

const Home: NextPage = () => {
  return <HomeContent />;
};

export default Home;
