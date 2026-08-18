import type { SingleTire } from '@/app/interfaces/tires';

import { absUrl } from './seo';
import { buildTireSlug } from './tireSlug';

/**
 * What a buyer's WhatsApp message says before they type anything.
 *
 * The message is the only context the person answering gets. Without it the
 * first three exchanges go on re-establishing what the customer was already
 * looking at — which tire, what size, what price did the site show you — while
 * the buyer waits. Everything here is on the page they are standing on.
 *
 * **Pure on purpose.** `SingleTire` in, a string out: no React, no DOM, no
 * environment. That is what lets the acceptance criteria be unit tests instead
 * of manual clicks, and it follows the precedent `buildNoResultsMessage` set for
 * the assistant's server-composed copy.
 */

/** Long enough to identify a tire, short enough to read on a phone. */
const MAX_NAME = 90;

/**
 * The record's "no value" marker is a literal dash.
 *
 * `mapTireRecordToSingleTire` writes `'-'` — not `null`, not `''` — for a
 * missing `remainingLife`, `treadDepth`, `dot` or `price`. A falsiness check is
 * therefore **true** for a missing value, and would put `Tread: -` in front of a
 * customer. TypeScript cannot see this; only this helper stands between the two.
 */
function present(value?: string): boolean {
  const v = value?.trim();
  return Boolean(v && v !== '-');
}

function trim(name: string): string {
  return name.length > MAX_NAME ? `${name.slice(0, MAX_NAME - 1).trimEnd()}…` : name;
}

/**
 * The tire as a person would say it: brand, then model.
 *
 * Deliberately not `tire.name`, which is the storage format
 * `(CODE) | BRAND | SIZE` — three facts joined by pipes, already stated
 * separately in the message.
 */
function describe(tire: SingleTire): string {
  const parts = [tire.brand, tire.model2].filter(part => present(part));
  return trim(parts.join(' ') || 'this tire');
}

function size(tire: SingleTire): string | null {
  if (present(tire.size)) return tire.size!.trim();
  // Older records carry the size only in the composed name.
  const parts = tire.name?.split(' | ') ?? [];
  const last = parts.length >= 2 ? parts[parts.length - 1]?.trim() : undefined;
  return present(last) ? last! : null;
}

function link(tire: SingleTire): string {
  const slug = buildTireSlug(String(tire.id), tire.brand ?? '', size(tire) ?? '');
  return absUrl(`/tires/${slug}`);
}

/** `Used · 80% life · 8/32" tread · Patched` — only the parts that exist. */
function condition(tire: SingleTire): string | null {
  const isNew = tire.condition?.trim().toLowerCase() === 'new';
  const parts: string[] = [];

  if (present(tire.condition)) parts.push(tire.condition.trim());

  // Life and tread describe wear. On a new tire they are noise at best and
  // faintly alarming at worst, so they are omitted rather than shown as 100%.
  if (!isNew) {
    if (present(tire.remainingLife)) parts.push(`${tire.remainingLife.trim()} life`);
    // The column holds a bare number (`8.0`); the unit lives in the UI. Said
    // without it, "8.0 tread" means nothing to a buyer. `/32"` is how the rest
    // of the site writes it — TreadWearExplorer and generateTireDescription both
    // append it to the same raw value.
    if (present(tire.treadDepth)) parts.push(`${tire.treadDepth.trim()}/32" tread`);
    // Only worth saying when true: "Patched: No" invites a question nobody asked.
    if (tire.patched?.trim().toLowerCase() === 'yes') parts.push('Patched');
  }

  return parts.length ? parts.join(' · ') : null;
}

function price(tire: SingleTire): string | null {
  if (!present(tire.price)) return null;
  const value = Number(tire.price);
  if (!Number.isFinite(value) || value <= 0) return null;
  return `$${value.toLocaleString('en-US')}`;
}

function label(tire: SingleTire): string {
  const code = present(tire.code) ? `#${tire.code!.trim()} — ` : '';
  return `${code}${describe(tire)}`;
}

/**
 * The message for a tire that is still available.
 *
 * The stock code leads because it is the only string that identifies the tire
 * exactly, and it is what the person answering will search for.
 */
function availableEnquiry(tire: SingleTire): string {
  const lines = ["Hi MrGoma, I'm interested in this tire:", '', label(tire)];

  const s = size(tire);
  if (s) lines.push(`Size: ${s}`);

  const c = condition(tire);
  if (c) lines.push(`Condition: ${c}`);

  // Said as what it is — what the page displayed — not as a quote.
  const p = price(tire);
  if (p) lines.push(`Price shown: ${p}`);

  lines.push(link(tire));
  return lines.join('\n');
}

/**
 * The message for a tire that is already sold.
 *
 * A sold tire is the best moment to ask for another one like it — today the
 * customer sees "Not available" and leaves with nothing. The wording states the
 * fact **before** asking anything, so it can never read as interest in buying
 * this one.
 */
function soldEnquiry(tire: SingleTire): string {
  const s = size(tire);
  const lines = [
    'Hi MrGoma, I saw this tire is already sold:',
    '',
    s ? `${label(tire)} (${s})` : label(tire),
    '',
    s ? `Do you have another one in ${s}?` : 'Do you have another one like it?',
    link(tire),
  ];
  return lines.join('\n');
}

export function isSoldTire(tire: SingleTire): boolean {
  return typeof tire.status === 'string' && tire.status.trim().toLowerCase() === 'sold';
}

export function buildTireEnquiry(tire: SingleTire): string {
  return isSoldTire(tire) ? soldEnquiry(tire) : availableEnquiry(tire);
}
