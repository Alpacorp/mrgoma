import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/**
 * Sorting reaches SQL as an `ORDER BY`, so it is asserted against the source: it
 * is the one filter whose mistakes are invisible in the result count. A wrong
 * order returns exactly the right number of tires, in the wrong sequence.
 */
const SOURCE = readFileSync('src/repositories/tiresRepository.ts', 'utf8');
const UI = readFileSync('src/app/ui/components/ResultsHeader/ResultsHeader.tsx', 'utf8');

const OPTIONS = ['price-asc', 'price-desc', 'life-desc', 'newest'];

describe('sorting', () => {
  it.each(OPTIONS)('%s is understood by the query builder', option => {
    expect(SOURCE).toContain(`case '${option}':`);
  });

  it.each(OPTIONS)('%s is offered in the UI', option => {
    expect(UI).toContain(`value="${option}"`);
  });

  /**
   * `RemainingLife` is stored as text — `'99%'`, `'9%'`. Compared as text, `'9%'`
   * sorts above `'80%'`, so "most tread left" would put the worst tires first
   * while looking entirely plausible.
   */
  it('orders remaining life numerically, not as text', () => {
    expect(SOURCE).toContain(
      "case 'life-desc':\n        orderBy = \"TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) DESC"
    );
    expect(SOURCE).not.toContain("orderBy = 'RemainingLife DESC'");
  });

  /**
   * Rows sharing a sort value can come back in a different order on each
   * request, which makes a tire appear on two pages or on none while paging.
   */
  it('breaks ties on a unique column, so paging is stable', () => {
    for (const option of ['life-desc', 'newest']) {
      const branch = SOURCE.slice(SOURCE.indexOf(`case '${option}':`));
      expect(branch.slice(0, 200)).toContain('TireId DESC');
    }
  });

  it('offers nothing the query builder cannot honour', () => {
    const offered = [...UI.matchAll(/<option value="([^"]+)"/g)].map(m => m[1]);
    for (const option of offered) {
      expect(SOURCE, `the UI offers "${option}" and the query ignores it`).toContain(
        `case '${option}':`
      );
    }
  });
});
