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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!productId) {
        setError('No se proporcionó el ID del producto.');
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

        console.log('logale, res:', res);

        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg?.message || `Error al cargar el producto (${res.status})`);
        }
        const json: SingleTire = await res.json();

        console.log('logale, json:', json);

        setData(json);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message || 'Error desconocido al cargar el producto');
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [productId]);

  return (
    <div className="bg-white">
      <div className="m-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="relative cursor-pointer flex items-center justify-center rounded-md border px-6 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 !border-gray-300 text-gray-700 hover:bg-gray-100"
          title="Back to search results"
        >
          &larr; Back to search results
        </button>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {loading && <div className="text-center py-16">Cargando detalles del producto...</div>}
        {!loading && error && <div className="text-center py-16 text-red-600">{error}</div>}
        {!loading && !error && data && (
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            <ProductCarousel singleTire={data} />
            <div className="mt-10 sm:mt-16 lg:mt-0">
              <TireInformation singleTire={data} />
              <section aria-labelledby="details-heading" className="mt-12 lg:px-8">
                <TireFeatures singleTire={data} />
              </section>
            </div>
          </div>
        )}
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
