'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  readGuess,
  resolveCity,
  writeGuess,
  type ResolvedCity,
  type VisitorCityName,
} from '@/app/utils/visitorCity';

/**
 * The visitor's estimated city, for the tire page link and checkout's nearest
 * store (feature 043).
 *
 * **Lazy.** Nothing is read or fetched until a component calls
 * `useVisitorCity()` — pages that never use it (most of them, and the sellers'
 * dashboard) never call `/api/visitor-city`. Then: the stored estimate (1 day)
 * → one request to the API.
 */

type Value = ResolvedCity & { status: 'pending' | 'ready' };

type Internal = { value: Value; request: () => void };

const Ctx = createContext<Internal | null>(null);

const NONE: ResolvedCity = { city: null, nearestStoreId: null };

export function VisitorCityProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<ResolvedCity>(NONE);
  const [status, setStatus] = useState<'pending' | 'ready'>('pending');
  const [wanted, setWanted] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!wanted || started.current) return;
    started.current = true;
    const stored = readGuess();
    if (stored) {
      setResolved(resolveCity(stored));
      setStatus('ready');
      return;
    }
    let alive = true;
    fetch('/api/visitor-city')
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((data: { city?: VisitorCityName | null; nearestStoreId?: string | null } | null) => {
        const city = data?.city === 'Miami' || data?.city === 'Orlando' ? data.city : null;
        writeGuess(city, data?.nearestStoreId ?? null);
        if (!alive) return;
        setResolved(resolveCity(readGuess()));
        setStatus('ready');
      });
    return () => {
      alive = false;
    };
  }, [wanted]);

  const request = useCallback(() => setWanted(true), []);

  const internal = useMemo<Internal>(
    () => ({ value: { ...resolved, status }, request }),
    [resolved, status, request]
  );

  return <Ctx.Provider value={internal}>{children}</Ctx.Provider>;
}

/** The visitor's estimated city. Calling it is what starts the lookup. */
export function useVisitorCity(): Value {
  const ctx = useContext(Ctx);
  const request = ctx?.request;
  useEffect(() => {
    request?.();
  }, [request]);
  // Outside the provider (isolated tests, error pages): no city, nothing to do.
  return ctx?.value ?? { ...NONE, status: 'ready' };
}
