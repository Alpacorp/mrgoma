'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * CookieConsent
 * - Shows a fixed banner at the bottom until the user accepts or declines.
 * - Accept: persists consent using both localStorage and a cookie (cookiesAccepted=true; max-age=1 year) and never shows again.
 * - Decline: does NOT set a persistent "false" cookie; instead hides the banner and schedules a re-show after 30 days using localStorage.
 * - Safe for SSR: only reads window APIs in effects.
 * - Improved UX: slide-up animation, compact layout, clear actions, consistent policy link.
 */
export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false); // for entrance animation

  // Constants
  const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
  const DECLINE_DAYS = 1; // Re-show after 1 day
  const DECLINE_MS = DECLINE_DAYS * 24 * 60 * 60 * 1000;
  const DECLINE_LS_KEY = 'cookieConsentDeclineUntil';

  const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`;
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      // If previously accepted in either storage/cookie, never show again
      const acceptedLS =
        typeof window !== 'undefined' ? window.localStorage.getItem('cookiesAccepted') : null;

      const cookieValue =
        typeof document !== 'undefined'
          ? document.cookie
              .split(';')
              .map(c => c.trim())
              .find(c => c.startsWith('cookiesAccepted='))
          : null;
      const acceptedCookie = cookieValue ? cookieValue.split('=')[1] : null;

      if (acceptedLS === 'true' || acceptedCookie === 'true') {
        setVisible(false);
        return;
      }

      // If a user declined, check if the re-show timer has expired
      const declinedUntilStr =
        typeof window !== 'undefined' ? window.localStorage.getItem(DECLINE_LS_KEY) : null;
      const declinedUntil = declinedUntilStr ? Number(declinedUntilStr) : 0;

      if (declinedUntil && Date.now() < declinedUntil) {
        // Still within the quiet period -> keep hidden
        setVisible(false);
        return;
      }

      // Otherwise show the banner
      setVisible(true);
      // trigger entrance animation next tick
      setTimeout(() => setMounted(true), 0);
    } catch {
      // If any error, default to showing the banner
      setVisible(true);
      setTimeout(() => setMounted(true), 0);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('cookiesAccepted', 'true');
        window.localStorage.removeItem(DECLINE_LS_KEY);
        try {
          window.dispatchEvent(new Event('cookies:accepted'));
        } catch {
          // ignore
        }
      }
      setCookie('cookiesAccepted', 'true', ONE_YEAR_SECONDS);
    } catch {
      // ignore
    }
    setVisible(false);
  }, []);

  const decline = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const until = Date.now() + DECLINE_MS;
        window.localStorage.setItem(DECLINE_LS_KEY, String(until));
        try {
          window.dispatchEvent(new Event('cookies:declined'));
        } catch {
          // ignore
        }
      }
      // Do not persist a long-lived "false" cookie; rely on a timed localStorage re-show
    } catch {
      // ignore
    }
    setVisible(false);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        // Treat ESC as decline (non-disruptive and reversible via settings page if added later)
        decline();
      }
    },
    [decline]
  );

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      onKeyDown={onKeyDown}
      className={`fixed inset-x-0 bottom-0 z-[9999] transition-transform duration-300 ease-out motion-reduce:transition-none ${mounted ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 sm:py-3 lg:px-8">
        <div className="rounded-lg bg-black/95 text-white shadow-xl ring-1 ring-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/75">
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#9dfb40]/15 text-[#9dfb40]"
              >
                {/* Cookie icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2a1 1 0 0 1 1 1 2 2 0 0 0 2 2 1 1 0 1 1 0 2 2 2 0 0 0 2 2 1 1 0 1 1 0 2 2 2 0 0 0 2 2 8 8 0 1 1-8-11zM9 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-1 5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm5 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2-6a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
                </svg>
              </span>
              <p id="cookie-consent-desc" className="text-sm leading-6 text-gray-200">
                We use cookies to improve your experience and analyze site traffic. By continuing,
                you agree to our{' '}
                <Link
                  href="/legal-policies#privacy"
                  className="underline text-[#4da6ff] hover:text-[#7bb8ff]"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={decline}
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40"
                aria-label="Decline non-essential cookies"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={accept}
                className="inline-flex items-center justify-center rounded-md bg-[#9dfb40] px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-[#85d936] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#9dfb40]"
                aria-label="Accept cookies"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
