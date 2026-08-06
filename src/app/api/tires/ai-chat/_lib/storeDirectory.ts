import { locationsConfig, type OpeningHours } from '@/app/(shop)/locations/locationsConfig';

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

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

/** `"08:00"` → `"8:00 AM"`. The config stores 24h because schema.org wants it. */
export function formatTime(hhmm: string): string {
  const [rawHour, rawMinute] = hhmm.split(':');
  const hour = Number(rawHour);
  const minute = rawMinute ?? '00';
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

/**
 * `['Monday', … 'Saturday']` → `"Mon–Sat"`, collapsing only a genuine run of
 * consecutive days. A gap is listed instead, because "Mon–Sat" for a shop shut
 * on Wednesday would send someone to a closed door.
 */
export function formatDays(days: string[]): string {
  const abbreviated = days.map(d => DAY_ABBR[d] ?? d);
  if (abbreviated.length < 3) return abbreviated.join(', ');

  const indices = days.map(d => DAY_ORDER.indexOf(d as (typeof DAY_ORDER)[number]));
  const isRun =
    indices.every(i => i >= 0) && indices.every((n, i) => i === 0 || n === indices[i - 1] + 1);

  return isRun
    ? `${abbreviated[0]}–${abbreviated[abbreviated.length - 1]}`
    : abbreviated.join(', ');
}

/** `"Mon–Sat: 8:00 AM–6:00 PM | Sun: 10:00 AM–4:00 PM"`. */
export function formatHours(hours: OpeningHours[]): string {
  return hours
    .map(span => `${formatDays(span.days)}: ${formatTime(span.opens)}–${formatTime(span.closes)}`)
    .join(' | ');
}

/**
 * The `## STORE LOCATIONS` block, ready to interpolate into the system prompt.
 *
 * `Call` is emitted alongside the printed phone so the assistant never has to
 * strip punctuation itself to build the `tel:` link the store card asks for —
 * a step it could get wrong, on the one number a customer actually dials.
 */
export function buildStoreDirectory(): string {
  return locationsConfig
    .map(loc =>
      [
        `**MrGoma Tires – ${loc.name}**`,
        `Address: ${loc.address}`,
        `Phone: ${loc.phone}`,
        `Call: ${loc.tel}`,
        `Hours: ${formatHours(loc.hours)}`,
        `Maps: ${loc.mapLink}`,
        `Areas served: ${loc.neighborhoods.join(', ')}`,
      ].join('\n')
    )
    .join('\n\n');
}
