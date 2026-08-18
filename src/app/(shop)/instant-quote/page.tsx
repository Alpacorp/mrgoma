import type { Metadata } from 'next';

import InstantQuote from '@/app/(shop)/instant-quote/container/InstantQoute/InstantQoute';
import { instantQuoteMetadata } from '@/app/utils/seo';

export const metadata: Metadata = instantQuoteMetadata();

export default function InstantQuotePage() {
  return <InstantQuote />;
}
