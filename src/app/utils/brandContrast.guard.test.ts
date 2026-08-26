import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, found);
    else if (/\.tsx?$/.test(entry)) found.push(full);
  }
  return found;
}

const CSS = readFileSync('src/app/globals.css', 'utf8');

function luminance([r, g, b]: number[]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: number[], b: number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hex(value: string): number[] {
  const m = value.replace('#', '').match(/../g)!;
  return m.map(h => parseInt(h, 16));
}

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const AA = 4.5;

function token(name: string): string {
  const m = CSS.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  expect(m, `--color-${name} is not declared in globals.css`).toBeTruthy();
  return m![1];
}

describe('the brand green carries readable text', () => {
  it('white on green-600 clears AA', () => {
    expect(contrast(WHITE, hex(token('green-600')))).toBeGreaterThanOrEqual(AA);
  });

  it('and nothing pairs dark text with it', () => {
    expect(contrast(BLACK, hex(token('green-600')))).toBeLessThan(AA);

    const offenders = sourceFiles('src')
      .filter(f => !f.includes('.test.'))
      .flatMap(file =>
        readFileSync(file, 'utf8')
          .split('\n')
          .map((line, i) => ({ line, at: `${file}:${i + 1}` }))
          .filter(
            ({ line }) =>
              line.includes('bg-green-600') &&
              /text-(gray|slate|zinc|neutral|stone)-[5-9]00|text-black/.test(line)
          )
          .map(({ at, line }) => `${at}  ${line.trim().slice(0, 70)}`)
      );

    expect(offenders).toEqual([]);
  });

  it('the hover shade is darker still, so the button keeps its feedback', () => {
    expect(luminance(hex(token('green-700')))).toBeLessThan(luminance(hex(token('green-600'))));
    expect(contrast(WHITE, hex(token('green-700')))).toBeGreaterThanOrEqual(AA);
  });

  it('is no longer Tailwind default #00a63e, which measures 3.21:1', () => {
    expect(token('green-600')).not.toBe('#00a63e');
    expect(contrast(WHITE, hex('#00a63e'))).toBeLessThan(AA);
  });
});
