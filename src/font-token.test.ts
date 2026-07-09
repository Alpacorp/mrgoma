import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/**
 * Guard for the font-token wiring (feature 006-fonts-cls). Inter is loaded via
 * next/font as `--font-inter`; the Tailwind v4 `sans` token is declared in CSS
 * (`@theme` in globals.css, because v4 has no JS-config auto-load) and
 * must point at that variable so `font-sans` — and the document default — resolve
 * to Inter instead of the system stack. If someone drops the variable, text
 * silently falls back to a system font; this test fails first.
 */
describe('sans font token (globals.css @theme)', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');

  it('declares --font-sans through the Inter CSS variable', () => {
    // Matches: --font-sans: var(--font-inter), ... ;  (whitespace/newlines tolerant)
    expect(css).toMatch(/--font-sans:\s*var\(--font-inter\)/);
  });

  it('keeps a system fallback after the variable', () => {
    const decl = css.match(/--font-sans:[^;]*;/)?.[0] ?? '';
    expect(decl).toContain('sans-serif');
  });
});
