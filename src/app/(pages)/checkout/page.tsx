import { NextPage } from 'next';
import { Suspense } from 'react';

import Checkout from '@/app/(pages)/checkout/container/Checkout/Checkout';
import { LoadingScreen } from '@/app/ui/components';

const CheckoutPage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
      <Checkout />
    </Suspense>
  );
};

export default CheckoutPage;
