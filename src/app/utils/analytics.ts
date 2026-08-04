import { track } from '@vercel/analytics';

import { event as gaEvent, type GaEventParams } from '@/app/utils/gtag';

/**
 * Send one interaction to both analytics platforms.
 *
 * GA4 is the primary source of truth but sees only a fraction of reality: it is
 * blocked by ad-blockers and gated behind the cookie banner, and measurement in
 * August 2026 put it at roughly one visitor in five. Vercel Web Analytics is
 * first-party and cookie-free, so it runs ungated and gives a second, fuller
 * reading of the same click. The gap between the two counts is itself the
 * measurement — see `spec/features/015-vercel-event-tracking/spec.md`.
 *
 * Callers keep using the declarative `data-track` markup; `InteractionTracker`
 * routes every one of them through here. Import `trackEvent` directly only when
 * the moment worth recording is not a click — a resolved request, say.
 */

/** What Vercel Web Analytics stores. Nested objects are not supported. */
type AllowedPropertyValue = string | number | boolean | null;

export type VercelEventProps = Record<string, AllowedPropertyValue>;

const isAllowed = (v: unknown): v is AllowedPropertyValue =>
  v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

/**
 * Force a value into something Vercel will store.
 *
 * Vercel silently *drops* properties it dislikes in production, which would make
 * a bad property invisible rather than loud. Converting here instead means the
 * data always arrives in a shape we chose and can test.
 */
const coerce = (v: unknown): AllowedPropertyValue => {
  if (isAllowed(v)) return v;
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    // Circular structures throw; a lossy label beats losing the property.
    return String(v);
  }
};

/**
 * Flatten a GA-shaped event into Vercel's flat property bag.
 *
 * GA's payload uses `event_category` / `event_label`; Vercel gets the plain
 * names. Event *names* stay identical across both platforms so a number in one
 * dashboard can be compared against the other without a translation table.
 */
export function toVercelProps({
  category,
  label,
  value,
  params,
}: GaEventParams): VercelEventProps | undefined {
  const props: VercelEventProps = {};

  if (category !== undefined) props.category = coerce(category);
  if (label !== undefined) props.label = coerce(label);
  if (value !== undefined) props.value = coerce(value);

  for (const [key, val] of Object.entries(params ?? {})) {
    if (val === undefined) continue;
    props[key] = coerce(val);
  }

  return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Report `e` to GA4 and to Vercel Web Analytics.
 *
 * The two sends are isolated from each other: a platform that is blocked,
 * unconfigured or throwing must not take the other down with it, because the
 * whole point of the second reading is that it survives what stops the first.
 */
export function trackEvent(e: GaEventParams): void {
  // A stray import from a Server Component must not throw: Vercel's `track`
  // raises off-browser in development, and there is nothing useful to send.
  if (typeof window === 'undefined') return;

  try {
    gaEvent(e);
  } catch {
    // no-op
  }

  try {
    track(e.action, toVercelProps(e));
  } catch {
    // no-op
  }
}
