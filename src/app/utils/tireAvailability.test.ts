import { describe, expect, it } from 'vitest';

import { isRemoved, isSoldStatus, isTrashed, schemaAvailability } from './tireAvailability';

describe('tireAvailability (045)', () => {
  it.each([
    ['sold', true],
    [' Sold ', true],
    ['SOLD', true],
    ['available', false],
    ['', false],
    [undefined, false],
    [null, false],
  ])('isSoldStatus(%p) is %p', (status, expected) => {
    expect(isSoldStatus(status)).toBe(expected);
  });

  it.each([
    [true, true],
    [1, true],
    ['true', true],
    ['1', true],
    [false, false],
    [0, false],
    ['false', false],
    [undefined, false],
  ])('isTrashed(Trash: %p) is %p', (trash, expected) => {
    expect(isTrashed({ Trash: trash })).toBe(expected);
  });

  it('tells Google a sold tire is SoldOut and any other InStock (AC1)', () => {
    expect(schemaAvailability('sold')).toBe('SoldOut');
    expect(schemaAvailability('available')).toBe('InStock');
  });

  it('hides only trashed tires that never sold — selling also trashes (AC3)', () => {
    expect(isRemoved({ Trash: true, Condition: 'sold' })).toBe(false);
    expect(isRemoved({ Trash: true, Condition: 'none' })).toBe(true);
    expect(isRemoved({ Trash: false, Condition: 'none' })).toBe(false);
    expect(isRemoved(null)).toBe(false);
  });
});
