'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';

import { useIdleReady } from '../TirePreview3D/useIdleReady';
import { isWebglAvailable } from '../TirePreview3D/webgl';

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const parseTread = (s?: string): number | null => {
  const n = parseFloat(String(s ?? ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const parseLife = (s?: string): number | null => {
  const n = parseInt(String(s ?? '').replace('%', ''), 10);
  return Number.isFinite(n) ? clamp(n, 0, 100) : null;
};

const SceneSkeleton = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin" />
  </div>
);

// three.js loads only when this component mounts on a capable device.
const TreadScene = dynamic(() => import('./TreadScene'), { ssr: false, loading: () => <SceneSkeleton /> });

const Fallback2D = ({ current, newUnits }: { current: number; newUnits: number }) => (
  <div className="flex h-full items-end justify-center gap-3 p-8">
    {[0, 1, 2, 3].map(i => (
      <div key={i} className="relative flex w-7 items-end" style={{ height: '80%' }}>
        <div className="absolute inset-x-0 top-0 rounded-t border-2 border-dashed border-green-400" style={{ height: '100%' }} />
        <div
          className="w-full rounded-t bg-neutral-700"
          style={{ height: `${clamp((current / newUnits) * 100, 6, 100)}%` }}
        />
      </div>
    ))}
  </div>
);

interface TreadWearExplorerProps {
  singleTire: {
    treadDepth?: string;
    remainingLife?: string;
  };
}

/**
 * 3D Tread & Wear Explorer for the product detail page. Shows the tire's
 * remaining tread (solid blocks) against the new-tire level (green outline), so
 * a customer can see at a glance how much tread is left. Driven by the real
 * `treadDepth` and `remainingLife` values; clearly labelled as a visual aid.
 */
const TreadWearExplorer: FC<TreadWearExplorerProps> = ({ singleTire }) => {
  const tread = parseTread(singleTire.treadDepth);
  const life = parseLife(singleTire.remainingLife);

  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Defer mounting the three.js canvas until the browser is idle (shared hook).
  const idleReady = useIdleReady();

  useEffect(() => {
    setEnabled(isWebglAvailable());
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const onMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    m.addEventListener('change', onMotion);
    return () => m.removeEventListener('change', onMotion);
  }, []);

  const current = tread ?? 8;
  const newUnits = useMemo(() => {
    if (life && life > 0) return clamp(current / (life / 100), current, 14);
    return Math.max(current, 10);
  }, [current, life]);

  // Nothing meaningful to show without tread/life data.
  if (tread == null && life == null) return null;

  const lifePct = life ?? 100;
  const lifeColor = lifePct >= 70 ? '#22c55e' : lifePct >= 40 ? '#f59e0b' : '#ef4444';
  const status = lifePct >= 70 ? 'Like new' : lifePct >= 40 ? 'Good' : 'Worn';
  const newApprox = Math.round(newUnits);

  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h3 id="tread-wear-heading" className="text-lg font-bold text-gray-900">
        Tread &amp; Wear
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {tread != null
          ? `This tire has ${singleTire.treadDepth}/32" of tread — about ${lifePct}% of a new tire (≈ ${newApprox}/32").`
          : 'How much tread this tire has left.'}
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {/* 3D tread blocks */}
        <div className="relative h-64 overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100">
          {enabled ? (
            idleReady ? (
              <div className="absolute inset-0" aria-hidden="true">
                <TreadScene currentUnits={current} newUnits={newUnits} reducedMotion={reducedMotion} />
              </div>
            ) : (
              <SceneSkeleton />
            )
          ) : (
            <Fallback2D current={current} newUnits={newUnits} />
          )}
          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg bg-white/80 px-2 py-1.5 text-[11px] backdrop-blur">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-neutral-700" /> Current tread
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-green-500" /> New-tire level
            </span>
          </div>
        </div>

        {/* Data panel */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-end gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tread depth</p>
              <p className="text-3xl font-black text-gray-900">
                {tread != null ? `${singleTire.treadDepth}/32"` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Remaining</p>
              <p className="text-3xl font-black" style={{ color: lifeColor }}>
                {life != null ? `${life}%` : '—'}
              </p>
            </div>
          </div>

          {life != null && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Worn</span>
                <span className="font-semibold" style={{ color: lifeColor }}>
                  {status}
                </span>
                <span>New</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${lifePct}%`, background: lifeColor }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-snug text-gray-400">
        Visual aid for tread depth and wear. The model is an approximation — it does not exactly
        reflect this tire&apos;s condition, measurements or physical aspects.
      </p>
    </div>
  );
};

export default TreadWearExplorer;
