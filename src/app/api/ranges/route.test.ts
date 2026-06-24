import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

// unstable_cache just runs the wrapped fn straight through in tests.
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchTireRanges: vi.fn() }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { fetchTireRanges } from '@/repositories/tiresRepository';

import { GET } from './route';

const mockRanges = fetchTireRanges as unknown as Mock;

beforeEach(() => mockRanges.mockReset());

describe('GET /api/ranges', () => {
  it('returns the ranges as JSON', async () => {
    mockRanges.mockResolvedValue({ minPrice: 10, maxPrice: 500 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ minPrice: 10, maxPrice: 500 });
  });
});
