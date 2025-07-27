'use client';

import { Suspense } from 'react';

import { LoadingScreen } from '@/app/ui/components';

import SearchResults from './container/search-results/search-results';

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen message="Cargando resultados..." />}>
      <SearchResults />
    </Suspense>
  );
}
