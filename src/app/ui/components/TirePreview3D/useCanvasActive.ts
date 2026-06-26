'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Pauses a WebGL canvas when it is off-screen or its tab is hidden, so an
 * always-rendering scene doesn't burn CPU/battery in the background.
 *
 * Attach `ref` to a wrapper around the <Canvas> and feed `active` into the
 * Canvas `frameloop` (e.g. `frameloop={active ? 'always' : 'never'}`). When it
 * becomes inactive the canvas simply freezes its last frame; it resumes on
 * return to view. The WebGL context is kept alive (not torn down), so resuming
 * is instant and cheap.
 */
export function useCanvasActive() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let inView = true;
    let visible = typeof document !== 'undefined' ? !document.hidden : true;
    const update = () => setActive(inView && visible);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 }
    );
    io.observe(el);

    const onVisibility = () => {
      visible = !document.hidden;
      update();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return { ref, active };
}
