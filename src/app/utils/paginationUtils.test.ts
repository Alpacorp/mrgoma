import { describe, expect, it } from 'vitest';

import {
  MAX_PAGE_SIZE,
  VALID_PAGE_SIZES,
  getAvailablePageSizes,
  validatePageSize,
} from './paginationUtils';

describe('validatePageSize', () => {
  it('returns valid sizes unchanged', () => {
    expect(validatePageSize(10)).toBe(10);
    expect(validatePageSize(50)).toBe(50);
  });

  it('clamps values below the minimum to the smallest valid size', () => {
    expect(validatePageSize(0)).toBe(VALID_PAGE_SIZES[0]);
    expect(validatePageSize(1)).toBe(5);
  });

  it('clamps values above the maximum', () => {
    expect(validatePageSize(1000)).toBe(MAX_PAGE_SIZE);
  });

  it('snaps in-range values to the closest valid size', () => {
    expect(validatePageSize(12)).toBe(10);
    expect(validatePageSize(13)).toBe(15);
  });
});

describe('getAvailablePageSizes', () => {
  it('returns only the sizes that do not exceed the total count', () => {
    expect(getAvailablePageSizes(12)).toEqual([5, 10]);
    expect(getAvailablePageSizes(3)).toEqual([]);
  });

  it('caps the list at MAX_PAGE_SIZE', () => {
    expect(getAvailablePageSizes(99999)).toEqual(VALID_PAGE_SIZES);
  });
});
