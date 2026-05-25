import type { Metadata } from 'next';

import InstantQuote from '@/app/(shop)/instant-quote/container/InstantQoute/InstantQoute';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InstantQuotePage() {
  return <InstantQuote />;
}
