export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Minimal typings for the global gtag function
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: any[]) => void;
  }
}

export const pageview = (url: string) => {
  try {
    if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('config', GA_ID, {
      page_path: url,
    });
  } catch {
    // no-op
  }
};

export type GaEventParams = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  params?: Record<string, any>;
};

export const event = ({ action, category, label, value, params }: GaEventParams) => {
  try {
    if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      ...params,
    });
  } catch {
    // no-op
  }
};
