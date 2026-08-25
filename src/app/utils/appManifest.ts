import type { MetadataRoute } from 'next';

/**
 * The two web app manifests, and the one icon list they share.
 *
 * There are two installable apps on this origin: the storefront (`/`) and the
 * staff portal (`/login`, added to the phone home screen by the crew). They
 * differ only in name and entry point, so the icons live here once — the icon
 * list was previously retyped in `manifest.ts` and in a static
 * `public/login-manifest.json`, and one of the two is exactly the kind of thing
 * that drifts.
 *
 * Both icons and sizes are load-bearing. The earlier list declared a single
 * entry with `sizes: 'any'` pointing at `desk-logo.png` — a 513x512 lockup whose
 * ink filled only a 513x90 band. `sizes: 'any'` is meaningful for SVG, not for a
 * raster icon: it gives a browser nothing to match against when it picks an
 * install icon, and browsers that found no usable icon fell back to drawing a
 * generated letter tile. Hence explicit pixel sizes on real square art.
 */

/**
 * Declared sizes must match the files in `public/icons/` — `appManifest.test.ts`
 * reads the PNG headers and fails if they drift. Regenerate with
 * `npm run icons:generate`.
 *
 * 192 and 512 are the pair an installable manifest is expected to offer. The
 * `maskable` entry is a separate drawing with its mark pulled inside the safe
 * circle, because Android crops adaptive icons to an arbitrary shape; serving
 * the full-bleed art as maskable would clip the outer chevrons.
 */
export const APP_ICONS: MetadataRoute.Manifest['icons'] = [
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

/** The 180x180 iOS home-screen icon, linked from the document head. */
export const APPLE_TOUCH_ICON = '/icons/apple-touch-icon.png';

const SHARED = {
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#16a34a',
  icons: APP_ICONS,
} as const satisfies Partial<MetadataRoute.Manifest>;

/** The public storefront, installed from the home page. */
export function storefrontManifest(): MetadataRoute.Manifest {
  return {
    name: 'MrGoma Tires',
    short_name: 'MrGoma',
    description: 'New and used tires in Miami & Orlando – MrGoma Tires',
    start_url: '/',
    scope: '/',
    ...SHARED,
  };
}

/**
 * The staff portal. `scope` is stated rather than left to default: it would
 * resolve to `/` either way, but the app opens on `/login` and then lives on
 * `/dashboard`, so a scope that stopped at the entry point would push the crew
 * out to the browser one tap after signing in.
 */
export function staffManifest(): MetadataRoute.Manifest {
  return {
    name: 'MrGoma Staff Portal',
    short_name: 'MrGoma Staff',
    description: 'Portal de colaboradores – MrGoma Tires',
    start_url: '/login',
    scope: '/',
    ...SHARED,
  };
}
