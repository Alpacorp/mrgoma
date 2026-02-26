import { Suspense } from 'react';

import Dashboard from '@/app/(shop)/dashboard/container/Dashboard';
import { LoadingScreen } from '@/app/ui/components';

const Page = () => {
  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen">
      <Suspense fallback={<LoadingScreen message="Loading Dashboard..." />}>
        <Dashboard />
      </Suspense>
    </div>
  );
};

export default Page;
