import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { RETIRED_EVENTS } from './analyticsEvents';

/**
 * Guard against the retired analytics names coming back (feature 015).
 *
 * `place_order` and `quote_submit` were retired on 2026-08-04 because they fired
 * on a button press rather than on an outcome: every abandoned payment and every
 * rejected form counted as a conversion. They were replaced by
 * `add_shipping_info` (intent), `purchase` (server-side, settled payment),
 * `whatsapp_order_sent` and `generate_lead`.
 *
 * Reintroducing either name is worse than adding a new bad one, because the
 * dashboards still hold history under those labels: a name that meant "order
 * placed" before that date and "checkout started" after it silently corrupts
 * every comparison drawn across the boundary. Cheaper to fail here.
 *
 * Excluded: `analyticsEvents.ts`, which *is* the list, and test files, which
 * have to name them in order to assert their absence.
 */
const SOURCE_ROOT = join(process.cwd(), 'src');
const EXEMPT = /(analyticsEvents\.ts|\.test\.tsx?|\.spec\.tsx?)$/;

/** Return the retired names that appear as quoted string literals in `source`. */
export function findRetiredEventNames(source: string): string[] {
  return RETIRED_EVENTS.filter(name => new RegExp(`["'\`]${name}["'\`]`).test(source));
}

function walkSource(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkSource(full));
    else if (/\.tsx?$/.test(full) && !EXEMPT.test(full)) out.push(full);
  }
  return out;
}

describe('retired analytics event names (feature 015)', () => {
  it('flags a retired name wherever it is quoted', () => {
    expect(findRetiredEventNames('data-track="place_order"')).toEqual(['place_order']);
    expect(findRetiredEventNames("track('quote_submit')")).toEqual(['quote_submit']);
  });

  it('does not flag the replacements', () => {
    expect(findRetiredEventNames('data-track="add_shipping_info"')).toEqual([]);
    expect(findRetiredEventNames("action: 'generate_lead'")).toEqual([]);
  });

  it('finds no retired name anywhere in src/', () => {
    const offenders = walkSource(SOURCE_ROOT)
      .map(file => ({ file, names: findRetiredEventNames(readFileSync(file, 'utf8')) }))
      .filter(({ names }) => names.length > 0);

    expect(offenders).toEqual([]);
  });
});
