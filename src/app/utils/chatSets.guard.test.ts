import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * `chatSets.ts` is imported by the tire page's client panel (044). A value
 * import from the repository or the connection would ship `@/connection/db` to
 * the browser — the barrel trap 041 hit. Types are erased and are fine.
 */
describe('chatSets.ts stays client-safe', () => {
  const src = readFileSync(join(__dirname, 'chatSets.ts'), 'utf8');
  const imports = src.match(/^import[\s\S]*?from\s+'[^']+';/gm) ?? [];

  it('imports only types from repositories, and nothing from the connection', () => {
    for (const statement of imports) {
      if (/from '@\/repositories\//.test(statement)) {
        expect(statement).toMatch(/^import type /);
      }
      expect(statement).not.toMatch(/@\/connection\//);
      expect(statement).not.toMatch(/'mssql'|'next\/cache'/);
    }
  });
});
