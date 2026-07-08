'use client';

import { useEffect, useState } from 'react';

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Returns `false`, then `true` once the browser is idle after mount. Used to
 * defer mounting heavy work (e.g. the three.js canvas) past hydration so it does
 * not block the page becoming interactive on load.
 *
 * Uses `requestIdleCallback` (with a `timeout` so it still fires on a busy page)
 * and falls back to a short `setTimeout` when `requestIdleCallback` is
 * unavailable (older Safari). SSR-safe: `window` is only read inside the effect.
 */
export function useIdleReady(timeout = 2000): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;

    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout });
      return () => w.cancelIdleCallback?.(id);
    }

    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, [timeout]);

  return ready;
}
