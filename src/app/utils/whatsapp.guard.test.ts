import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { WHATSAPP_NUMBER } from './whatsapp';

/**
 * Guard against a thirteenth copy of the WhatsApp number.
 *
 * On 2026-08-17 the number was written by hand **twelve times across eight
 * files**: the contact page (twice), a guide page, a location page, a service
 * page, the promo banner config (three times), the AI chat's system prompt
 * (twice), the chat's composed messages, and the organization JSON-LD.
 *
 * This is the same failure that `storeData.guard.test.ts` was written for, and
 * it is worth guarding for the same reason: two of the twelve lived inside
 * **template literals** — a prompt and a JSON-LD object — where a stale value is
 * a string, so no build, type check or lint can see it. A number that is right
 * in eleven places and wrong in the twelfth is worse than one that is wrong
 * everywhere, because nobody goes looking.
 *
 * Excluded: `whatsapp.ts`, which *is* the source of truth, and test files, which
 * must name the value in order to assert it.
 *
 * **Not covered on purpose:** `DashboardCartModal` builds `wa.me/?text=` with no
 * recipient, so a staff member picks the customer to send the order to. It holds
 * no number, and giving it one would send every internal order to ourselves.
 */
const SOURCE_ROOT = join(process.cwd(), 'src');
const EXEMPT = /(utils[\\/]whatsapp\.ts|\.test\.tsx?|\.spec\.tsx?)$/;

function walkSource(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkSource(full));
    else if (/\.tsx?$/.test(full) && !EXEMPT.test(full)) out.push(full);
  }
  return out;
}

/** Digits only, so `+1 (407) 364-4016` and `14073644016` are the same number. */
export function containsWhatsAppNumber(source: string): boolean {
  return source.replace(/[()\s.+-]/g, '').includes(WHATSAPP_NUMBER);
}

describe('the WhatsApp number has one home', () => {
  it('recognises the number however it is punctuated', () => {
    expect(containsWhatsAppNumber('https://wa.me/14073644016')).toBe(true);
    expect(containsWhatsAppNumber('tel:+1 (407) 364-4016')).toBe(true);
    expect(containsWhatsAppNumber('telephone: "+14073644016"')).toBe(true);
  });

  it('does not flag an unrelated number', () => {
    // A store line from locationsConfig, which is a different source of truth.
    expect(containsWhatsAppNumber('(305)-278-4632')).toBe(false);
  });

  it('finds no copy of the number outside whatsapp.ts', () => {
    const offenders = walkSource(SOURCE_ROOT).filter(file =>
      containsWhatsAppNumber(readFileSync(file, 'utf8'))
    );

    expect(offenders).toEqual([]);
  });
});
