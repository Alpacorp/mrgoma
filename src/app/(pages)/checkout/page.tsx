import React, { Suspense } from 'react';
import type { Metadata, NextPage } from 'next';

import Checkout from '@/app/(pages)/checkout/container/Checkout/Checkout';
import { LoadingScreen } from '@/app/ui/components';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Secure checkout at MrGoma Tires.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const CheckoutPage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
      <Checkout />
    </Suspense>
  );
};

export default CheckoutPage;
