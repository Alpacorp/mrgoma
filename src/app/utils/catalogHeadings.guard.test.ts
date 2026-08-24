import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The catalog pages aggregate stock from every warehouse, so a heading that
 * names one city is wrong for whatever sits in the other.
 *
 * **19 sizes and 8 brands have stock only in Orlando** — `225/60/16` has 30
 * units, all of them there — and their pages read "225/60/16 Tires in Miami" in
 * type the size of a poster. The `<title>` was fixed first and the visible `<h1>`
 * was missed, which is the reason this file exists: the metadata and the heading
 * are written in different places and drifted apart.
 *
 * The rule is per line and per file, deliberately narrow. A repo-wide "never say
 * Miami without Orlando" would flag `Built in Miami.` on the About page, which is
 * a true sentence about where the company started.
 */

const FILES = [
  'src/app/(shop)/tires/size/[size]/page.tsx',
  'src/app/(shop)/tires/container/SearchResults.tsx',
  'src/app/(shop)/tires/brands/[brand]/page.tsx',
];

/** Lines that quote the old wording to explain it are not the wording itself. */
const isComment = (line: string) => /^\s*(\*|\/\/|\{\/\*)/.test(line);

describe('catalog headings name the business, not one of its cities', () => {
  it.each(FILES)('%s never says Miami without Orlando', file => {
    const offenders = readFileSync(join(process.cwd(), file), 'utf8')
      .split('\n')
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(({ line }) => !isComment(line))
      .filter(({ line }) => line.includes('Miami') && !line.includes('Orlando'))
      .map(({ line, number }) => `${file}:${number}  ${line.trim()}`);

    expect(offenders).toEqual([]);
  });
});
