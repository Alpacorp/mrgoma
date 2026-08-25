import React from 'react';

/**
 * No `metadata` here on purpose.
 *
 * It used to export `title: 'Checkout - MrGoma Tires'` and
 * `description: 'Your Trusted Tire Shop in Miami …'` — a title that named the
 * brand twice once the root template appended it, and a description naming only
 * Miami. Both were dead: `page.tsx` exports `checkoutMetadata()`, and a page's
 * metadata wins over its layout's. `021` moved the real copy into `seo.ts` and
 * left this behind.
 */
export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
