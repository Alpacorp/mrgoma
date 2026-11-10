'use client';

import { useEffect, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

import { GA_ID, hasConsent } from '@/app/utils/consent';
import { GA_DEBUG, GA_READY_EVENT, pageview } from '@/app/utils/gtag';

// `hasConsent` used to be reimplemented here. Two readings of the same rule is
// how they start to disagree, and disagreeing about consent means either
// tracking someone who said no or losing someone who said yes.

const GoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    setConsentGranted(hasConsent());
    const onAccepted = () => setConsentGranted(true);
    const onDeclined = () => setConsentGranted(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cookiesAccepted') {
        setConsentGranted(e.newValue === 'true');
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('cookies:accepted', onAccepted as EventListener);
      window.addEventListener('cookies:declined', onDeclined as EventListener);
      window.addEventListener('storage', onStorage as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cookies:accepted', onAccepted as EventListener);
        window.removeEventListener('cookies:declined', onDeclined as EventListener);
        window.removeEventListener('storage', onStorage as EventListener);
      }
    };
  }, []);

  useEffect(() => {
    if (!GA_ID || !consentGranted) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname || '/';
    pageview(url);
  }, [pathname, searchParams, consentGranted]);

  if (!GA_ID || !consentGranted) return null;

  // `ga-init` ends by dispatching `ga:ready`, which flushes the events
  // `gtag.ts` held while gtag was not defined yet — `view_item` on a landing
  // page, `purchase` on the return from Stripe. It must stay after `config`,
  // so those events reach the configured property and not a void.
  // `debug_mode` is omitted, never `false`, in production: GA4 treats any value
  // as on (feature 040).

  return (
    <>
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,${GA_DEBUG ? `\n            debug_mode: true,` : ''}
          });
          window.dispatchEvent(new Event('${GA_READY_EVENT}'));
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
