import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Guard against opening hours being written out by hand again.
 *
 * Until 2026-08-06 three surfaces rendered them independently — the contact
 * page, each store's own page, and the assistant's system prompt — and they
 * agreed only by luck. Changing an hour in `locationsConfig` would have moved
 * the JSON-LD that Google reads while leaving the visible text behind, so the
 * structured data and the page would have contradicted each other. That is
 * worse than either being wrong on its own, because each looks authoritative.
 *
 * A rendered clock time (`8:00 AM`) is the tell. It cannot come from the config,
 * which stores 24h spans — so wherever one appears in source, somebody has
 * retyped an hour that `storeHours.ts` already knows how to say.
 *
 * Excluded: `storeHours.ts`, which does the rendering, and test files, which
 * must write the expected output in order to assert it.
 */
const SOURCE_ROOT = join(process.cwd(), 'src');
const EXEMPT = /(storeHours\.ts|\.test\.tsx?|\.spec\.tsx?)$/;

/** `8:00 AM`, `10:00 PM` — a time already formatted for a reader. */
const RENDERED_TIME = /\b\d{1,2}:\d{2}\s*(AM|PM)\b/;

function walkSource(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkSource(full));
    else if (/\.tsx?$/.test(full) && !EXEMPT.test(full)) out.push(full);
  }
  return out;
}

describe('opening hours have one home', () => {
  it('recognises a hand-written time', () => {
    expect(RENDERED_TIME.test('Mon–Sat: 8:00 AM – 6:00 PM')).toBe(true);
    expect(RENDERED_TIME.test("{ day: 'Sunday', time: '10:00 AM – 4:00 PM' }")).toBe(true);
  });

  it('ignores the 24h spans the config legitimately holds', () => {
    expect(RENDERED_TIME.test("{ opens: '08:00', closes: '18:00' }")).toBe(false);
  });

  it('finds no rendered time anywhere in src/', () => {
    const offenders = walkSource(SOURCE_ROOT).filter(file =>
      RENDERED_TIME.test(readFileSync(file, 'utf8'))
    );

    expect(offenders).toEqual([]);
  });
});
