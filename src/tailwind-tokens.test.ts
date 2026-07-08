import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Guards for feature 007 (Tailwind v4 token reconciliation):
 *
 * 1. `green-primary` is fully retired. Tailwind v4 silently DROPS unknown color
 *    utilities (a stray `green-primary` renders with no color and does NOT fail
 *    the build), so a source scan is the real safety net.
 * 2. The `slide-in-right` animation and the `xs` breakpoint live in globals.css
 *    `@theme` (the config file is ignored by v4).
 */

const SRC = 'src';

/** All .ts/.tsx files under src, excluding test files (which name the token). */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('brand green reconciliation', () => {
  it('has no lingering green-primary utility in source', () => {
    const offenders = sourceFiles(SRC).filter(f => readFileSync(f, 'utf8').includes('green-primary'));
    expect(offenders).toEqual([]);
  });
});

describe('migrated @theme tokens (globals.css)', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');

  it('declares the xs breakpoint', () => {
    expect(css).toMatch(/--breakpoint-xs:\s*350px/);
  });

  it('declares the slide-in-right animation and its keyframes', () => {
    expect(css).toMatch(/--animate-slide-in-right:\s*slide-in-right/);
    expect(css).toMatch(/@keyframes\s+slide-in-right/);
  });
});
