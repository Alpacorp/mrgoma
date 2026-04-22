'use client';

import { useEffect, useState } from 'react';

import Header from '@/app/ui/sections/Header/Header';
// import TopHeader from '@/app/ui/sections/TopHeader/TopHeader';
// TopHeader is hidden until we have unique content to show there.
// To re-enable: uncomment the import, the state/effect, and the div below.

const SCROLL_THRESHOLD = 12;

const StickyHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
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
