import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';

/**
 * Guard against a second copy of the store directory appearing anywhere in the
 * codebase.
 *
 * On 2026-08-06 the public assistant's system prompt turned out to hold its own
 * hand-typed list of all seven stores. It had drifted: a phone number for Miami
 * Airport that the site never used, opening hours contradicting the ones
 * confirmed across every store on 2026-07-31, Coral Gables placed in Miami, and
 * seven `share.google` links that had stopped resolving to a Business Profile
 * and redirected to a search for their own token.
 *
 * The reason it went unnoticed for so long is the shape of the mistake: a
 * prompt is a string, so the fix that corrected every store link on 2026-08-04
 * passed straight over it, and no build, type check or lint could care.
 *
 * Two rules, therefore. A store's phone number appears in exactly one file, and
 * a Maps link is never a short link. Both are cheap; both failed silently for
 * months.
 *
 * Excluded: `locationsConfig.ts`, which *is* the source of truth, and test
 * files, which must name these values in order to assert them.
 */
const SOURCE_ROOT = join(process.cwd(), 'src');
const EXEMPT = /(locationsConfig\.ts|\.test\.tsx?|\.spec\.tsx?)$/;

/** Short-link hosts, matched only as real URLs so prose may still name them. */
const SHORT_LINK = /https?:\/\/(share\.google|goo\.gl|maps\.app\.goo\.gl)/;

function walkSource(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkSource(full));
    else if (/\.tsx?$/.test(full) && !EXEMPT.test(full)) out.push(full);
  }
  return out;
}

/** Digits only, so `(305)-278-4632` and `(305) 278-4632` are the same number. */
export function findStorePhones(source: string): string[] {
  const digitsOnly = source.replace(/[()\s.-]/g, '');
  return locationsConfig
    .map(store => store.phone.replace(/\D/g, ''))
    .filter(digits => digitsOnly.includes(digits));
}

describe('store data has one home', () => {
  it('recognises a store phone however it is punctuated', () => {
    expect(findStorePhones('Phone: (305) 278-4632')).toEqual(['3052784632']);
    expect(findStorePhones('tel:+13052784632')).toEqual(['3052784632']);
  });

  it('does not flag an unrelated number', () => {
    // The WhatsApp line is genuinely its own value, not a store's.
    expect(findStorePhones('https://wa.me/14073644016')).toEqual([]);
  });

  it('finds no store phone outside locationsConfig', () => {
    const offenders = walkSource(SOURCE_ROOT)
      .map(file => ({ file, phones: findStorePhones(readFileSync(file, 'utf8')) }))
      .filter(({ phones }) => phones.length > 0);

    expect(offenders).toEqual([]);
  });

  it('finds no short Maps link anywhere in src/', () => {
    const offenders = walkSource(SOURCE_ROOT).filter(file =>
      SHORT_LINK.test(readFileSync(file, 'utf8'))
    );

    expect(offenders).toEqual([]);
  });
});
