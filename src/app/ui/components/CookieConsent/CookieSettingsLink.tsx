'use client';

import React from 'react';

/**
 * The way back to the cookie decision.
 *
 * Without this, accepting was a one-way door: the choice lasted a year and
 * nothing on the site could undo it. Withdrawing consent has to be as easy as
 * giving it, and the cheapest way to be *exactly* as easy is to reopen the very
 * same banner — same control, same two buttons, no extra page to reach.
 *
 * It is a `<button>`, not a link: it performs an action on this page rather than
 * navigating somewhere. `Footer` is a Server Component, which is why the click
 * handler lives here in its own client module instead of inline over there.
 */
export const CookieSettingsLink: React.FC<{ className?: string }> = ({ className }) => (
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event('cookies:reopen'))}
    className={
      className ??
      'text-gray-300 hover:text-[#9dfb40] transition-colors duration-200 text-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9dfb40] rounded'
    }
  >
    Cookie Preferences
  </button>
);

export default CookieSettingsLink;
