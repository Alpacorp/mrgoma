'use client';

import { FC, useContext, useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { ArrowsToRight } from '@/app/ui/icons';

import TireDisplay from '../TireDisplay/TireDisplay';

const Skeleton = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="h-20 w-20 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin" />
  </div>
);

// three.js is heavy (~150 KB gzip): load it only when this component mounts on a
// capable desktop, never on the server or in the main bundle.
const TireScene = dynamic(() => import('./TireScene'), { ssr: false, loading: () => <Skeleton /> });

const isWebglAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/**
 * Live 3D preview of the tire size selected in the home search. The model's
 * proportions update with Width / Sidewall / Diameter so customers can SEE what
 * a size code means. Falls back to the static <TireDisplay> when WebGL is
 * unavailable, and only mounts the canvas on desktop (≥ md) for performance.
 */
const TirePreview3D: FC = () => {
  const { selectedFilters } = useContext(SelectedFiltersContext);

  // null = still detecting; true/false = decision made (avoids SSR/hydration flash).
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluate = () => setEnabled(desktop.matches && isWebglAvailable());
    const onMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    evaluate();
    setReducedMotion(motion.matches);
    desktop.addEventListener('change', evaluate);
    motion.addEventListener('change', onMotion);
    return () => {
      desktop.removeEventListener('change', evaluate);
      motion.removeEventListener('change', onMotion);
    };
  }, []);

  // Until we know, or when WebGL/desktop isn't available, use the static diagram.
  if (enabled === null) return <Skeleton />;
  if (!enabled) return <TireDisplay />;

  const size = {
    width: selectedFilters.width,
    aspect: selectedFilters.sidewall,
    diameter: selectedFilters.diameter,
  };
  const allSelected = selectedFilters.width && selectedFilters.sidewall && selectedFilters.diameter;

  return (
    <div className="relative w-full h-full">
      {/* Decorative canvas (transparent — the white card shows through). The
          dropdowns + the badge below carry the meaning. */}
      <div className="absolute inset-0" aria-hidden="true">
        <TireScene size={size} reducedMotion={reducedMotion} />
      </div>

      {/* Size badge — kept accessible and readable over the model. */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 bg-neutral-800/90 rounded-full shadow-xl">
        <ArrowsToRight className="w-8" />
        <span
          className={`text-sm font-medium ${allSelected ? 'text-green-400' : 'text-white/75'}`}
        >
          {selectedFilters.width || '000'}/{selectedFilters.sidewall || '00'}/
          {selectedFilters.diameter || '00'}
        </span>
      </div>
    </div>
  );
};

export default TirePreview3D;
