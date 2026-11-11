'use client';

import { useEffect } from 'react';

/**
 * Opens a page at its top (2026-11-10).
 *
 * Coming back to a tire already in the router cache, Next.js re-reveals the
 * cached page and measures it before it has a box; it then decides there is
 * nothing to scroll, and the page keeps the catalog's scroll position — the
 * shopper lands at the footer. Reproduced in 2 of 3 tries from a scrolled
 * `/tires`.
 *
 * Back/forward is left alone: there the browser (and Next) restore the
 * position the shopper had, which is what they expect.
 */
let lastPopState = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    lastPopState = Date.now();
  });
}

const ScrollToTopOnOpen = ({ id }: { id: string }) => {
  useEffect(() => {
    if (Date.now() - lastPopState < 1000) return;
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);
  return null;
};

export default ScrollToTopOnOpen;
