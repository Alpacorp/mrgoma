import type { OpeningHours } from '@/app/(shop)/locations/locationsConfig';

/**
 * The one place opening hours are turned into words.
 *
 * `locationsConfig` stores hours in 24h spans because schema.org wants them
 * that way, so every surface that shows them to a person has to render them —
 * and until 2026-08-06 three surfaces did it independently: the contact page
 * held a hand-typed table of all seven days, each store's own page printed
 * "Mon–Sat: 8:00 AM – 6:00 PM" as literal text, and the assistant's prompt had
 * a third copy.
 *
 * They agreed by luck rather than construction. Change an hour in the config
 * and the JSON-LD Google reads would move while the two pages a customer
 * actually reads stayed behind — structured data and visible text contradicting
 * each other, which is worse than either being wrong alone.
 */

export const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayName = (typeof DAY_ORDER)[number];

const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

/** `"08:00"` → `"8:00 AM"`. */
export function formatTime(hhmm: string): string {
  const [rawHour, rawMinute] = hhmm.split(':');
  const hour = Number(rawHour);
  const minute = rawMinute ?? '00';
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

/** `"8:00 AM – 6:00 PM"` — the canonical span, spaced as the pages show it. */
export function formatSpan(span: OpeningHours): string {
  return `${formatTime(span.opens)} – ${formatTime(span.closes)}`;
}

/**
 * `['Monday' … 'Saturday']` → `"Mon–Sat"`, collapsing only a genuine run of
 * consecutive days. A gap is listed out instead, because "Mon–Sat" for a shop
 * shut on Wednesday sends someone to a locked door.
 */
export function formatDays(days: string[]): string {
  const abbreviated = days.map(d => DAY_ABBR[d] ?? d);
  if (abbreviated.length < 3) return abbreviated.join(', ');

  const indices = days.map(d => DAY_ORDER.indexOf(d as DayName));
  const isRun =
    indices.every(i => i >= 0) && indices.every((n, i) => i === 0 || n === indices[i - 1] + 1);

  return isRun
    ? `${abbreviated[0]}–${abbreviated[abbreviated.length - 1]}`
    : abbreviated.join(', ');
}

/** `"Mon–Sat: 8:00 AM – 6:00 PM | Sun: 10:00 AM – 4:00 PM"`. */
export function formatHours(hours: OpeningHours[]): string {
  return hours.map(span => `${formatDays(span.days)}: ${formatSpan(span)}`).join(' | ');
}

/**
 * One row per day of the week, in order, for a table that lists all seven.
 *
 * A day no span covers is reported as `Closed` rather than omitted: a missing
 * row reads as an oversight, while an explicit "Closed" answers the question
 * the visitor came with.
 */
export function weeklyHours(hours: OpeningHours[]): { day: DayName; time: string }[] {
  return DAY_ORDER.map(day => {
    const span = hours.find(h => h.days.includes(day));
    return { day, time: span ? formatSpan(span) : 'Closed' };
  });
}
