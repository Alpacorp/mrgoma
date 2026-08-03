import { staffManifest } from '@/app/utils/appManifest';

/**
 * The staff portal's web app manifest.
 *
 * Next's `app/manifest.ts` convention only covers one manifest per app, and
 * this origin installs two (see `appManifest.ts`), so the second is served
 * here. It used to be a static `public/login-manifest.json`; moving it to a
 * route keeps its icon list in the same module as the storefront's, and lets it
 * carry `application/manifest+json` — files under `public/` are typed from
 * their extension and went out as `application/json`.
 *
 * The path is unchanged, so home screens that already hold this app keep
 * resolving it. It takes no request-time input, so it prerenders.
 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(staffManifest(), null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
