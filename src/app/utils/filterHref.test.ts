import { describe, expect, it } from 'vitest';

import {
  FILTER_PARAMS,
  activeFilterCount,
  addValue,
  clearAll,
  hasValue,
  removeValue,
  setParam,
  setRange,
  toggleParam,
  toggleValue,
} from './filterHref';

/**
 * The heaviest tests in this feature, because this is the one module whose bugs
 * are invisible. A link that silently drops another filter looks exactly like a
 * link that works — the page renders, the results are plausible, and the only
 * symptom is that the buyer's other choice is gone.
 *
 * So these are written over relationships, not over example strings: toggling
 * twice must return the original, removing one must not touch the rest, and no
 * parameter this module does not know about may ever disappear.
 */

describe('adding and removing one value', () => {
  it('adds to an empty query', () => {
    expect(addValue('', 'brands', 'PIRELLI')).toBe('?brands=PIRELLI');
  });

  it('adds alongside an existing value rather than replacing it', () => {
    expect(addValue('?brands=PIRELLI', 'brands', 'MICHELIN')).toBe('?brands=PIRELLI%2CMICHELIN');
  });

  it('does not add the same value twice', () => {
    expect(addValue('?brands=PIRELLI', 'brands', 'PIRELLI')).toBe('?brands=PIRELLI');
  });

  it('drops the parameter entirely when its last value goes', () => {
    expect(removeValue('?brands=PIRELLI', 'brands', 'PIRELLI')).toBe('');
  });

  it('leaves the other values in place', () => {
    expect(removeValue('?brands=PIRELLI,MICHELIN', 'brands', 'PIRELLI')).toBe('?brands=MICHELIN');
  });
});

/**
 * The property that matters most: **one filter must never disturb another.**
 */
describe('other filters survive', () => {
  const busy =
    '?brands=PIRELLI&condition=used&d=20&minPrice=100&maxPrice=149&sort=price-asc&view=table';

  it.each(FILTER_PARAMS.filter(p => p !== 'brands'))('changing brands does not touch %s', param => {
    const before = new URLSearchParams(busy.slice(1)).get(param);
    const after = new URLSearchParams(addValue(busy, 'brands', 'MICHELIN').slice(1)).get(param);
    expect(after).toBe(before);
  });

  it('keeps how the buyer is reading the list', () => {
    for (const href of [
      addValue(busy, 'brands', 'MICHELIN'),
      removeValue(busy, 'brands', 'PIRELLI'),
      setParam(busy, 'd', '21'),
      setRange(busy, 'minPrice', 'maxPrice', 300, undefined),
    ]) {
      const after = new URLSearchParams(href.slice(1));
      expect(after.get('view')).toBe('table');
      expect(after.get('sort')).toBe('price-asc');
    }
  });

  it('never drops a parameter it has never heard of', () => {
    const withStranger = '?brands=PIRELLI&utm_source=newsletter&pageSize=50';
    const after = new URLSearchParams(addValue(withStranger, 'condition', 'used').slice(1));
    expect(after.get('utm_source')).toBe('newsletter');
    expect(after.get('pageSize')).toBe('50');
  });
});

describe('toggling is its own inverse', () => {
  it.each([
    ['', 'brands', 'PIRELLI'],
    ['?condition=used', 'brands', 'PIRELLI'],
    ['?brands=PIRELLI,MICHELIN&d=20', 'brands', 'MICHELIN'],
    ['?d=20&sort=price-asc', 'condition', 'used'],
  ])('twice from %s returns the original', (search, param, value) => {
    const once = toggleValue(search, param, value);
    const twice = toggleValue(once, param, value);
    // Compare as parameter sets: this module sorts, the fixture may not.
    expect([...new URLSearchParams(twice.slice(1))].sort()).toEqual(
      [...new URLSearchParams(search.slice(1))].sort()
    );
  });

  it('holds for single-valued parameters too', () => {
    const once = toggleParam('?brands=PIRELLI', 'd', '20');
    expect(once).toContain('d=20');
    expect(toggleParam(once, 'd', '20')).toBe('?brands=PIRELLI');
  });
});

/**
 * A buyer on page 7 of a 12-page result who narrows to something with 2 pages
 * must not be shown an empty page. Any change to the filters starts again.
 */
describe('changing a filter returns to the first page', () => {
  it.each([
    ['adding', (s: string) => addValue(s, 'brands', 'PIRELLI')],
    ['removing', (s: string) => removeValue(s, 'condition', 'used')],
    ['setting a value', (s: string) => setParam(s, 'd', '20')],
    ['setting a range', (s: string) => setRange(s, 'minPrice', 'maxPrice', 100, 149)],
    ['clearing', (s: string) => clearAll(s)],
  ])('%s', (_name, act) => {
    expect(act('?page=7&condition=used')).not.toContain('page=');
  });

  it('but a page number on its own is not a filter', () => {
    // Deleting the parameter says "page 1" to buildTireFilters, and keeps the
    // canonical URL of a filtered view free of a parameter that adds nothing.
    expect(new URLSearchParams(addValue('?page=7', 'brands', 'PIRELLI').slice(1)).has('page')).toBe(
      false
    );
  });
});

describe('ranges are set as one filter, not two', () => {
  it('writes both ends together', () => {
    expect(setRange('', 'minPrice', 'maxPrice', 100, 149)).toBe('?maxPrice=149&minPrice=100');
  });

  it('leaves an open end open rather than writing a zero', () => {
    expect(setRange('', 'minPrice', 'maxPrice', undefined, 99)).toBe('?maxPrice=99');
    expect(setRange('', 'minPrice', 'maxPrice', 300, undefined)).toBe('?minPrice=300');
  });

  it('clears both ends at once', () => {
    expect(
      setRange('?minPrice=100&maxPrice=149&d=20', 'minPrice', 'maxPrice', undefined, undefined)
    ).toBe('?d=20');
  });
});

describe('clearAll', () => {
  it('removes every filter', () => {
    const busy =
      '?brands=PIRELLI&condition=used&d=20&w=225&s=50&minPrice=100&maxPrice=149&code=1234';
    expect(clearAll(busy)).toBe('');
  });

  it('keeps how the buyer is reading the list', () => {
    expect(clearAll('?brands=PIRELLI&view=table&sort=price-asc&pageSize=50')).toBe(
      '?pageSize=50&sort=price-asc&view=table'
    );
  });
});

describe('activeFilterCount', () => {
  it('counts nothing on a bare catalogue', () => {
    expect(activeFilterCount('')).toBe(0);
    expect(activeFilterCount('?view=table&sort=price-asc&page=3')).toBe(0);
  });

  it('counts each value of a multi-valued filter', () => {
    expect(activeFilterCount('?brands=PIRELLI,MICHELIN')).toBe(2);
  });

  it('counts a whole size as its parts, which is how it is removed', () => {
    expect(activeFilterCount('?w=225&s=50&d=19')).toBe(3);
  });

  it('counts a price band once, not once per bound', () => {
    // Both bounds are one filter and one chip. This test was written asserting
    // 2, passed, and was wrong: a collapsed control saying "2 filters" would be
    // describing the implementation rather than the buyer's single choice.
    expect(activeFilterCount('?minPrice=100&maxPrice=149')).toBe(1);
    expect(activeFilterCount('?minPrice=300')).toBe(1);
    expect(activeFilterCount('?maxPrice=99')).toBe(1);
  });

  it('counts a band and a brand as two things', () => {
    expect(activeFilterCount('?minPrice=100&maxPrice=149&brands=PIRELLI')).toBe(2);
  });

  it('counts each range group separately', () => {
    expect(activeFilterCount('?minPrice=100&maxPrice=149&minRemainingLife=90')).toBe(2);
  });
});

describe('hasValue', () => {
  it('finds a value inside a set', () => {
    expect(hasValue('?brands=PIRELLI,MICHELIN', 'brands', 'MICHELIN')).toBe(true);
    expect(hasValue('?brands=PIRELLI', 'brands', 'MICHELIN')).toBe(false);
    expect(hasValue('', 'brands', 'PIRELLI')).toBe(false);
  });

  it('does not match a value that is merely a prefix of another', () => {
    expect(hasValue('?brands=PIRELLI PZERO', 'brands', 'PIRELLI')).toBe(false);
  });
});

/**
 * The catalogue stores brands in capitals and the rail writes them that way —
 * but the AI chat emits what a person typed. Ask it for Michelin and the URL
 * says `brands=Michelin`.
 *
 * Compared exactly, the results filtered correctly while the rail showed
 * Michelin **unticked**, and clicking it appended a second spelling. The page
 * and its own controls disagreed about what was applied, and both were showing
 * the buyer something true.
 */
describe('a value is the same value however it is spelled in the URL', () => {
  it('recognises a differently-cased value as applied', () => {
    expect(hasValue('?brands=Michelin', 'brands', 'MICHELIN')).toBe(true);
    expect(hasValue('?brands=MICHELIN', 'brands', 'Michelin')).toBe(true);
    expect(hasValue('?condition=Used', 'condition', 'used')).toBe(true);
  });

  it('does not append a second spelling of a filter already applied', () => {
    expect(addValue('?brands=Michelin', 'brands', 'MICHELIN')).toBe('?brands=Michelin');
  });

  it('removes it whichever way it was written', () => {
    expect(removeValue('?brands=Michelin', 'brands', 'MICHELIN')).toBe('');
    expect(removeValue('?brands=Michelin,PIRELLI', 'brands', 'michelin')).toBe('?brands=PIRELLI');
  });

  it('toggling off a chat-set filter clears it rather than doubling it', () => {
    expect(toggleValue('?brands=Michelin', 'brands', 'MICHELIN')).toBe('');
  });

  it('still tells two different values apart', () => {
    expect(hasValue('?brands=MICHELIN', 'brands', 'PIRELLI')).toBe(false);
  });
});
