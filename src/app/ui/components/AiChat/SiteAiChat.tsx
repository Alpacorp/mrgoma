'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Lazy-load the chat bundle so it stays out of the initial payload on every page.
const AiChat = dynamic(() => import('@/app/ui/components/AiChat/AiChat'), { ssr: false });

// Internal areas that shouldn't show the public assistant: /dashboard mounts its
// own authenticated assistant, /login has none.
const HIDDEN_PREFIXES = ['/dashboard', '/login'];

const PUBLIC_EXAMPLE_QUERIES = [
  '205/55/16 nuevas Michelin',
  'used Michelin aro 17',
  'usadas menos de $50',
  '¿qué diferencia hay entre nueva y usada?',
  '195/65/15 with more than 50% life',
  'Pirelli',
  'used tires under $80',
];

/**
 * Site-wide public AI assistant launcher. Mounted once in the root layout so it
 * appears on every storefront page, talking to the public (unauthenticated)
 * endpoint and sending users to the public /tires listing. Hidden on internal
 * admin areas.
 */
export default function SiteAiChat() {
  const pathname = usePathname();

  const isHidden =
    !!pathname && HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));
  if (isHidden) return null;

  return (
    <AiChat
      apiEndpoint="/api/tires/ai-chat"
      redirectBasePath="tires"
      exampleQueries={PUBLIC_EXAMPLE_QUERIES}
    />
  );
}
