import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * `VaultName` is the **store**. `Location` is the shelf code within a store.
 *
 * The dashboard used to show the first under the name of the second — in three
 * separate files, while a fourth line in the very same component already called
 * it `Store: ${row.VaultName}`. Two names for one field, drifting apart, and
 * nothing to notice.
 *
 * The rule is deliberately at **line level** rather than "no label says
 * Location". After `026` the word is legitimate: it names the new filter and the
 * new column, both of which show the real `Location` column. A guard that simply
 * forbade the string would fail on correct code.
 *
 * Every one of the four defects was a single line pairing the two:
 *
 *   { accessorKey: 'VaultName', header: 'Location' }
 *   { label: 'Location', value: row.VaultName }
 *
 * which is exactly what this catches.
 */

const UI = join(process.cwd(), 'src', 'app', 'ui');

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe('the dashboard never calls a store a location', () => {
  it('has no source line mentioning both VaultName and Location', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(UI)) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (line.includes('VaultName') && line.includes('Location')) {
            offenders.push(`${file.replace(process.cwd(), '')}:${index + 1}  ${line.trim()}`);
          }
        });
    }

    expect(offenders).toEqual([]);
  });
});
