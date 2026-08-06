import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';
import { formatHours } from '@/app/utils/storeHours';

/**
 * The store directory the public assistant reads from, derived from
 * `locationsConfig` — the same data the website itself renders.
 *
 * It used to be typed out a second time inside the system prompt, and the two
 * copies drifted, as two copies do. By 2026-08-06 the assistant was telling
 * customers a phone number for Miami Airport that the site did not use, quoting
 * opening hours that contradicted the ones confirmed across all seven stores on
 * 2026-07-31, placing Coral Gables in Miami, and handing out seven
 * `share.google` short links that no longer resolved to a Business Profile at
 * all — they redirected to a search for the link's own token.
 *
 * None of that could fail a build. A prompt is a string, so the fix that
 * corrected the store links on 2026-08-04 swept straight past it.
 *
 * So the prompt now asks the config for this section rather than restating it.
 */
export function buildStoreDirectory(): string {
  return locationsConfig
    .map(loc =>
      [
        `**MrGoma Tires – ${loc.name}**`,
        `Address: ${loc.address}`,
        `Phone: ${loc.phone}`,
        // Emitted alongside the printed phone so the assistant never has to
        // strip punctuation itself to build the `tel:` link the store card asks
        // for — a step it could get wrong, on the one number a customer dials.
        `Call: ${loc.tel}`,
        `Hours: ${formatHours(loc.hours)}`,
        `Maps: ${loc.mapLink}`,
        `Areas served: ${loc.neighborhoods.join(', ')}`,
      ].join('\n')
    )
    .join('\n\n');
}
