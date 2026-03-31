import type { Metadata, NextPage } from 'next';

import Login from '@/app/(sellers)/login/container/Login';

export const metadata: Metadata = {
  title: 'MrGoma Tires | Seller Portal',
  robots: { index: false, follow: false },
};

const LoginPage: NextPage = () => {
  return <Login />;
};

export default LoginPage;
