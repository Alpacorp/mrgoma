'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { SingleTire } from '@/app/interfaces/tires';
import {
  ProductCarousel,
  TireInformation,
  TireFeatures,
  Terminology,
  Benefits,
} from '@/app/ui/sections';

const Detail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = useMemo(() => searchParams.get('productId'), [searchParams]);

  const [data, setData] = useState<SingleTire | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // error can be a code to render tailored UI: 'MISSING_ID' | 'NOT_FOUND' | string
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!productId) {
        setError('MISSING_ID');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tire?productId=${encodeURIComponent(productId)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!res.ok) {
          // Distinguish didn't found VS other errors
          if (res.status === 404) {
            throw Object.assign(new Error('NOT_FOUND'), { code: 'NOT_FOUND' });
          }
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg?.message || `Failed to load product (${res.status})`);
        }
        const json: SingleTire = await res.json();

        console.log('logale, json:', json);

        setData(json);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.code === 'NOT_FOUND' ? 'NOT_FOUND' : e.message || 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [productId]);

  const LoadingCard = (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
      {/* Left: Gallery skeleton with a stable aspect ratio and thumbnails */}
      <div>
        <div className="relative w-full rounded-lg overflow-hidden aspect-square sm:aspect-[16/10] lg:aspect-[16/9]">
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          <div className="pointer-events-none absolute top-2 left-2 h-7 w-28 rounded-full bg-gray-200/80 shadow-sm" />
          <div className="pointer-events-none absolute top-2 right-2 h-6 w-24 rounded-full bg-gray-200/80 shadow-sm" />
        </div>
        <div className="mx-auto mt-6 w-full max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-4 gap-3">
            <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right: Info skeleton aligned with the final layout */}
      <div className="mt-10 sm:mt-16 lg:mt-0">
        <div className="mb-3">
          {/* Brand logo placeholder */}
          <div className="h-10 w-40 bg-gray-100 rounded animate-pulse mb-3" />
          {/* Title and model lines */}
          <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Price + CTA row */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-36 rounded-md bg-gray-100 animate-pulse shadow-sm" />
        </div>

        {/* Spec chips */}
        <ul className="mt-4 flex flex-wrap gap-2">
          <li className="h-6 w-28 rounded-full bg-gray-100 animate-pulse" />
          <li className="h-6 w-36 rounded-full bg-gray-100 animate-pulse" />
          <li className="h-6 w-32 rounded-full bg-gray-100 animate-pulse" />
          <li className="h-6 w-28 rounded-full bg-gray-100 animate-pulse" />
        </ul>

        {/* Description card */}
        <div className="my-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Features / More Details card */}
        <div className="mt-1">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Accordion header placeholder */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-5 bg-gray-100 rounded-full animate-pulse" />
            </div>
            {/* Accordion content placeholder */}
            <div className="px-4 sm:px-6 py-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <li className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                <li className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
                <li className="h-4 w-3/6 bg-gray-100 rounded animate-pulse" />
                <li className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({
    title,
    message,
    showId,
  }: {
    title: string;
    message: string;
    showId?: boolean;
  }) => (
    <div className="flex flex-col items-center py-16">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-50 text-green-600 mb-4">
        <span className="text-2xl">🛞</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 text-center">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 text-center max-w-xl">{message}</p>
      {showId && <p className="mt-1 text-xs text-gray-500">Requested id: {productId}</p>}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border !border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          ← Go back
        </button>
        <a
          href="/search-results"
          className="rounded-md border border-green-600 px-5 py-2 text-sm text-green-700 hover:bg-green-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          Browse tires
        </a>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return LoadingCard;

    if (error === 'MISSING_ID')
      return (
        <EmptyState
          title="No product selected"
          message="Add a productId to the URL to see its details, or go back to the catalog to choose one."
        />
      );

    if (error === 'NOT_FOUND')
      return (
        <EmptyState
          title="Product not found"
          message="We couldn't find a tire with the provided id. It may have been sold or removed."
          showId
        />
      );

    if (error)
      return (
        <EmptyState
          title="Something went wrong"
          message="An unexpected error occurred while loading this product. Please try again."
          showId
        />
      );

    if (data)
      return (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <ProductCarousel singleTire={data} />
          <div className="mt-10 sm:mt-16 lg:mt-0">
            <TireInformation singleTire={data} />
            <section aria-labelledby="details-heading" className="mt-1">
              <TireFeatures singleTire={data} />
            </section>
          </div>
        </div>
      );

    return null;
  };

  return (
    <div className="bg-white">
      <div className="m-1">
        <button
          type="button"
          onClick={() => router.push('/search-results')}
          className="relative cursor-pointer flex items-center justify-center rounded-md border px-6 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 !border-gray-300 text-gray-700 hover:bg-gray-100"
          title="Back to search results"
        >
          &larr; Back to search results
        </button>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6 lg:max-w-7xl lg:px-8 min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh]">
        {renderContent()}
      </div>
      <section className="bg-[#111828] text-white py-16">
        <Terminology />
      </section>
      <section className="mt-8 mb-8">
        <Benefits />
      </section>
    </div>
  );
};

export default Detail;
