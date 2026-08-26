import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * `aria-pressed` describes a toggle **button**. A filter that navigates is a
 * link, and its applied state is `aria-current`. Putting `aria-pressed` on an
 * `<a>` is an invalid ARIA attribute — axe reports it, and a screen reader is
 * told the element is a button that it then cannot operate as one.
 *
 * `/tires` emitted **254 of them on a single page**: the attribute was rendered
 * from `aria-pressed={isActive}`, which also emits `aria-pressed="false"` for
 * every unselected chip, so 114 brands and every rim size each carried one. The
 * same fault reached `/tires/new`, `/tires/used` and every brand landing page,
 * because they share `BrowseFilters`.
 *
 * Stated over the whole of `src/app` rather than over the new rail: the point is
 * that the attribute does not come back anywhere, including in the components
 * this feature deliberately leaves in place.
 */

const ATTRIBUTE = /aria-pressed/;

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, found);
    else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) found.push(full);
  }
  return found;
}

/** A line that quotes the attribute to explain it is not the attribute. */
const isComment = (line: string) => /^\s*(\*|\/\/|\{\/\*)/.test(line);

describe('no link is dressed up as a button', () => {
  it('aria-pressed appears nowhere under src/app', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles('src/app')) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (!isComment(line) && ATTRIBUTE.test(line)) {
            offenders.push(`${file}:${index + 1}  ${line.trim()}`);
          }
        });
    }

    expect(offenders).toEqual([]);
  });
});
