import React, { Suspense } from 'react';

import type { Metadata, NextPage } from 'next';

import Checkout from '@/app/(shop)/checkout/container/Checkout/Checkout';
import { LoadingScreen } from '@/app/ui/components';
import { checkoutMetadata } from '@/app/utils/seo';

export const metadata: Metadata = checkoutMetadata();

const CheckoutPage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
      <Checkout />
    </Suspense>
  );
};

export default CheckoutPage;
