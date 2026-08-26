import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/**
 * A skeleton is a promise about the shape of what is coming. When the two
 * disagree the page jumps at the exact moment the buyer starts reading it.
 *
 * `TireResults` dropped `mx-auto max-w-3xl` when the filter rail freed the
 * results column to take the width the rail leaves — 768 px to 944 px. The
 * skeleton kept it, so every load drew narrow, centred placeholders and then
 * replaced them with wider cards shifted left. Nothing failed; it just looked
 * broken for half a second.
 *
 * Compared as strings rather than measured, because neither renders at a real
 * width in jsdom — and the defect was a class name, which is exactly what a
 * string comparison catches.
 */

const WRAPPER = /<div className="([^"]*)">/;

function wrapperClasses(file: string, after: string): string {
  const source = readFileSync(file, 'utf8');
  const from = source.indexOf(after);
  expect(from, `"${after}" not found in ${file} — update this guard`).toBeGreaterThan(-1);
  const match = source.slice(from).match(WRAPPER);
  expect(match, `no wrapper <div> after "${after}" in ${file}`).toBeTruthy();
  return match![1].split(/\s+/).sort().join(' ');
}

describe('the skeleton is the shape of the results', () => {
  it('both list wrappers carry the same classes', () => {
    const results = wrapperClasses(
      'src/app/ui/components/TireResults/TireResults.tsx',
      'const TireResults'
    );
    const skeleton = wrapperClasses(
      'src/app/ui/components/TireCardSkeleton/TireCardSkeleton.tsx',
      'export const ResultsSkeleton'
    );

    expect(skeleton).toBe(results);
  });

  it('and neither caps the column any more', () => {
    for (const file of [
      'src/app/ui/components/TireResults/TireResults.tsx',
      'src/app/ui/components/TireCardSkeleton/TireCardSkeleton.tsx',
    ]) {
      const source = readFileSync(file, 'utf8');
      const code = source
        .split('\n')
        .filter(line => !/^\s*(\*|\/\/|\{\/\*)/.test(line))
        .join('\n');
      expect(code).not.toContain('max-w-3xl');
    }
  });
});
