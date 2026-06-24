import { describe, expect, it } from 'vitest';

import { useGenerateFixedPagination } from './useGeneratePagination';

// Despite the "use" name this is a pure function (no React state), so it's
// tested directly without renderHook.
describe('useGenerateFixedPagination', () => {
  it('returns every page when the total fits in the visible window', () => {
    expect(useGenerateFixedPagination(1, 3, 5)).toEqual([1, 2, 3]);
  });

  it('adds a trailing ellipsis and last page near the start', () => {
    expect(useGenerateFixedPagination(1, 10, 5)).toEqual([1, 2, 3, 4, 5, '...', 10]);
  });

  it('adds a leading ellipsis near the end', () => {
    expect(useGenerateFixedPagination(10, 10, 5)).toEqual([1, '...', 6, 7, 8, 9, 10]);
  });

  it('adds both ellipses in the middle', () => {
    expect(useGenerateFixedPagination(5, 10, 5)).toEqual([1, '...', 3, 4, 5, 6, 7, '...', 10]);
  });
});
