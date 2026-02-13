import type { Metadata, NextPage } from 'next';

import Home from '@/app/(home)/container/Home/Home';
import { canonical } from '@/app/utils/seo';

export const metadata: Metadata = {
  title: 'Buy New & Used Tires in Miami, FL | MrGoma Tires',
  description:
    'Shop new and used tires in Miami. Fast installation, multiple locations, and secure online ordering at MrGoma Tires.',
  alternates: { canonical: canonical('/') },
};

const HomePage: NextPage = () => {
  return <Home />;
};

export default HomePage;
