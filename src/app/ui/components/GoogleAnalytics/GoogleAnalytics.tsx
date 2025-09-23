'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import { GA_ID, pageview } from '@/app/utils/gtag';

const hasConsent = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const ls = window.localStorage.getItem('cookiesAccepted') === 'true';
    const cookieValue =
      typeof document !== 'undefined'
        ? document.cookie
            .split(';')
            .map(c => c.trim())
            .find(c => c.startsWith('cookiesAccepted='))
        : null;
    const cookie = cookieValue ? cookieValue.split('=')[1] === 'true' : false;
    return ls || cookie;
  } catch {
    return false;
  }
};

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
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
