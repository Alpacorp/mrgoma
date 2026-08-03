/**
 * The site answers on both `mrgomatires.com` and `www.mrgomatires.com`, and
 * until now neither redirected to the other: two origins served the same app.
 *
 * That is not merely untidy. An origin is the boundary for cookies and for web
 * app identity, so the two hosts were two different installs and two different
 * sessions — sign in on one and the session does not exist on the other, and
 * `NEXTAUTH_URL` can only ever name one of them. It is why the staff portal
 * stopped letting people in until they were moved to the `www` address by hand.
 *
 * So one host wins and the other permanently redirects to it. The winner is
 * derived from the same env vars `getSiteUrl()` reads, so the redirect can never
 * disagree with the canonical tags and the sitemap. Only the exact sibling host
 * is matched, which leaves preview deployments and localhost alone.
 *
 * Two things to keep in step, both because this file is loaded before any TS is
 * compiled and so cannot import from `src/app/utils/seo.ts`:
 *
 *  - The literal below must equal `getSiteUrl()`'s own fallback. Neither is
 *    meant to be load-bearing; they are, whenever the env var is unset.
 *  - `NEXT_PUBLIC_BASE_URL` is deliberately NOT read here. Despite the similar
 *    name it answers a different question — where Stripe returns to and which
 *    origins `/api/instant-quote` accepts — and the two are only equal today by
 *    coincidence.
 */
const CANONICAL_HOST = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.mrgomatires.com'
).host;
const ALTERNATE_HOST = CANONICAL_HOST.startsWith('www.')
  ? CANONICAL_HOST.slice('www.'.length)
  : `www.${CANONICAL_HOST}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: ALTERNATE_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    qualities: [75],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.usedtires.online',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'mrgomatires.com',
        port: '',
      },
    ],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;
