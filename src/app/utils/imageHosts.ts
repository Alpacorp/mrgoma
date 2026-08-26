/**
 * The hosts `next/image` is allowed to optimise, in one place.
 *
 * **`next/image` throws during render for an unconfigured host** — it does not
 * fall back, and `onError` never fires because nothing ever loads. One tire in
 * the catalogue carries an eBay-hosted image, and it takes down every page it
 * appears on: its own detail page answers **500**, and any filtered catalogue
 * view containing it renders the loading skeleton forever instead of results.
 * A buyer asking for new Pirellis sees no tires at all.
 *
 * So the list is shared with `next.config.mjs` rather than written twice, and
 * `ProductImage` checks against it before handing a URL to `next/image`. An
 * unknown host degrades to the placeholder — the same outcome as a missing
 * photo, which half this catalogue has anyway — instead of taking the page down.
 *
 * Adding a host here is not enough on its own: `next.config.mjs` reads this list
 * at build time, so the two cannot drift, but a new host still has to be one we
 * are willing to proxy images from.
 */
export const ALLOWED_IMAGE_HOSTS = ['www.usedtires.online', 'mrgomatires.com'] as const;

/** Whether `next/image` can be given this URL without throwing. */
export function isOptimisableImage(url: string | undefined | null): boolean {
  if (!url) return false;
  if (url === 'N/A' || url === 'null' || url === 'undefined') return false;
  // Relative paths are served by this app and always fine.
  if (url.startsWith('/')) return true;

  try {
    const { hostname, protocol } = new URL(url);
    return protocol === 'https:' && (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}
