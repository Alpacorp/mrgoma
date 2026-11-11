'use client';

import { useEffect, useState } from 'react';

import Header from '@/app/ui/sections/Header/Header';
// import TopHeader from '@/app/ui/sections/TopHeader/TopHeader';
// TopHeader is hidden until we have unique content to show there.
// To re-enable: uncomment the import, the state/effect, and the div below.

/**
 * Two thresholds, not one (2026-11-10). The header is 24 px shorter when
 * compact, and it sits in the flow: crossing a single 12 px threshold resized
 * it, the browser's scroll anchoring moved the page by those 24 px, which
 * crossed the threshold back — the header grew and shrank in a loop near the
 * top. The gap between the two (36 px) is larger than the size change, so one
 * resize can never undo itself.
 */
const COMPACT_AFTER = 40;
const EXPAND_BELOW = 4;

const StickyHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(prev => (prev ? window.scrollY > EXPAND_BELOW : window.scrollY > COMPACT_AFTER));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {/* TopHeader — hidden until we have unique content for this bar
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
        }`}
      >
        <TopHeader />
      </div>
      */}
      <Header compact={scrolled} />
    </div>
  );
};

export default StickyHeader;
