import Link from 'next/link';
import React from 'react';

import { LocationIcon, EnvelopeIcon } from '@/app/ui/icons';

/**
 * Thin top header bar displayed above the main Header.
 * Left side: link to a Locations section on home.
 * Right side: mailto Contact Us link opening in a new tab.
 */
const TopHeader: React.FC = () => {
  return (
    <div className="w-full bg-black border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-2 text-sm text-white flex items-center justify-between">
        {/* Left: Locations link */}
        <Link
          href="/#locations"
          className="inline-flex items-center gap-2 text-white/90 hover:text-[#65D01E] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Find a Store Near You - Go to Locations section"
        >
          <LocationIcon className="h-4 w-4 text-[#65D01E]" />
          <span>Find a Store Near You</span>
        </Link>
        {/* Right: Contact Us mailto */}
        <Link
          href="mailto:info@mrgomatires.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white/90 hover:text-[#65D01E] underline underline-offset-4 decoration-white/20 hover:decoration-[#65D01E] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Contact Us via email"
        >
          <EnvelopeIcon className="h-4 w-4 text-[#65D01E]" />
          <span>Contact Us</span>
        </Link>
      </div>
    </div>
  );
};

export default TopHeader;
