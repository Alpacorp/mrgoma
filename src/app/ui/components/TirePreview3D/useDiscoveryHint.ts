'use client';

import { useEffect, useState } from 'react';

/** Shared key for the 3D-selector onboarding nudge: discovering the feature in
 *  either the mobile button or the desktop canvas stops the cue everywhere. */
export const TIRE_3D_HINT_KEY = 'mg_3d_discovered';

/**
 * One-time onboarding nudge. Returns whether a subtle attention cue should be
 * shown (only until the user has discovered the feature once) plus a `dismiss`
 * callback that marks it seen so it never nags on later visits.
 *
 * SSR-safe: starts hidden and decides after mount, so the cue can't flash
 * during hydration. localStorage failures (private mode, blocked storage) are
 * swallowed — the worst case is simply showing/omitting the hint.
 */
export function useDiscoveryHint(key: string) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(key)) setShow(true);
    } catch {
      /* storage unavailable — skip the nudge */
    }
  }, [key]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(key, '1');
    } catch {
      /* no-op */
    }
  };

  return { show, dismiss };
}
