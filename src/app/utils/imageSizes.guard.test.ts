import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Guard against the "16-width srcset" cost regression (feature 013).
 *
 * When a `next/image` `sizes` value contains no `vw` unit, Next cannot map it to
 * `deviceSizes` and falls back to emitting the full width list — every fixed-size
 * logo/thumbnail then bills many image transformations instead of ~2. Fixed-size
 * images must express their size via `width`/`height` and omit `sizes` (which
 * yields a 2-entry 1x/2x srcset). Any remaining `sizes` literal on a `next/image`
 * must therefore be responsive (contain a `vw` unit).
 *
 * The HTML favicon `<link rel="icon" sizes="any">` is not a `next/image` and is
 * excluded.
 */
const SIZES_LITERAL = /sizes\s*=\s*"([^"]*)"/g;

/** Return the `sizes` literals in `source` that would trigger a full-width srcset. */
export function findNonResponsiveSizes(source: string): string[] {
  // Only files that actually render next/image are relevant.
  if (!source.includes('next/image')) return [];
  const offenders: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = SIZES_LITERAL.exec(source)) !== null) {
    const value = m[1];
    if (value === 'any') continue; // <link rel="icon" sizes="any">, not an <Image>
    if (!/\d\s*vw/.test(value)) offenders.push(value);
  }
  return offenders;
}

function walkTsx(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkTsx(full));
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('next/image sizes guard (feature 013)', () => {
  it('every next/image `sizes` literal is responsive (declares a vw unit)', () => {
    const srcRoot = join(process.cwd(), 'src');
    const offenders: string[] = [];
    for (const file of walkTsx(srcRoot)) {
      const source = readFileSync(file, 'utf8');
      for (const value of findNonResponsiveSizes(source)) {
        offenders.push(`${file.replace(srcRoot, 'src')}: sizes="${value}"`);
      }
    }
    // A non-empty list means a fixed-size image would emit the full-width srcset.
    expect(offenders).toEqual([]);
  });

  it('matcher flags a fixed-px sizes and accepts a responsive one', () => {
    const withImage = (jsx: string) => `import Image from 'next/image';\n${jsx}`;
    expect(findNonResponsiveSizes(withImage('<Image sizes="185px" />'))).toEqual(['185px']);
    expect(
      findNonResponsiveSizes(withImage('<Image sizes="(max-width: 768px) 160px, 200px" />'))
    ).toEqual(['(max-width: 768px) 160px, 200px']);
    expect(
      findNonResponsiveSizes(withImage('<Image sizes="(max-width: 640px) 100vw, 600px" />'))
    ).toEqual([]);
    expect(findNonResponsiveSizes(withImage('<Image sizes="100vw" />'))).toEqual([]);
  });

  it('ignores the favicon `sizes="any"` and files without next/image', () => {
    expect(
      findNonResponsiveSizes(`import Image from 'next/image';\n<link rel="icon" sizes="any" />`)
    ).toEqual([]);
    expect(findNonResponsiveSizes('<link rel="icon" sizes="any" />')).toEqual([]);
  });
});
