import type { Metadata, NextPage } from 'next';

import Home from '@/app/(home)/container/Home/Home';
import { homeMetadata } from '@/app/utils/seo';

export const metadata: Metadata = homeMetadata();

const HomePage: NextPage = () => {
  return <Home />;
};

export default HomePage;
