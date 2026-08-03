import type { Metadata, NextPage } from 'next';

import Login from '@/app/(sellers)/login/container/Login';

export const metadata: Metadata = {
  // Just the page's own name: the root template in `buildDefaultMetadata`
  // appends ` | MrGoma Tires`. Spelling the brand out here too rendered the tab
  // as "MrGoma Tires | Seller Portal | MrGoma Tires".
  title: 'Seller Portal',
  robots: { index: false, follow: false },
  manifest: '/login-manifest.json',
};

const LoginPage: NextPage = () => {
  return <Login />;
};

export default LoginPage;
