import { beforeEach, describe, expect, it, vi } from 'vitest';

// fetchTireRanges is a plain function (not a vi.fn) whose behaviour we swap via
// `h.impl`. A vi.fn that throws is re-reported by Vitest as an unhandled error
// even when the route catches it, so a plain throwing function is used instead.
const h = vi.hoisted(() => ({
  impl: (() => ({ minPrice: 10, maxPrice: 500 })) as () => unknown,
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchTireRanges: () => h.impl() }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

import { GET } from './route';

const req = new Request('http://localhost/api/ranges') as never;

beforeEach(() => {
  h.impl = () => ({ minPrice: 10, maxPrice: 500 });
});

describe('GET /api/ranges', () => {
  it('returns the ranges as JSON', async () => {
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ minPrice: 10, maxPrice: 500 });
  });

  it('returns a generic 500 (no err.message leak) when the repository throws', async () => {
    h.impl = () => {
      throw new Error('db down connection=secret');
    };
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Failed to fetch tire ranges');
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
