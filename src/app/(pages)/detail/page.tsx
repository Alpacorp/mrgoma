import { NextPage } from 'next';
import { Suspense } from 'react';

import Detail from '@/app/(pages)/detail/container/Detail/Detail';
import { LoadingScreen } from '@/app/ui/components';

const DetailPage: NextPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading results ..." />}>
      <Detail />
    </Suspense>
  );
};

export default DetailPage;
