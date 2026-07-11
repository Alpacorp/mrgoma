import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Swappable plain function (a throwing vi.fn is re-reported by Vitest even when
// caught); `h.calls` captures the args passed to fetchTireSizes.
const h = vi.hoisted(() => ({
  impl: (() => []) as (...a: unknown[]) => unknown,
  calls: [] as unknown[][],
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/dimensionsRepository', () => ({
  fetchTireSizes: (...args: unknown[]) => {
    h.calls.push(args);
    return h.impl(...args);
  },
}));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

import { GET } from './route';

const req = (url: string) => ({ url }) as unknown as NextRequest;

beforeEach(() => {
  h.impl = () => [];
  h.calls = [];
});

describe('GET /api/dimensions/sizes', () => {
  it('ignores a non-numeric height (no NaN to the query, no 500)', async () => {
    const res = await GET(req('http://x/api/dimensions/sizes?height=abc'));
    expect(res.status).toBe(200);
    // fetchTireSizes(height, width) — garbage height coerced to undefined
    expect(h.calls[0]).toEqual([undefined, undefined]);
  });

  it('passes valid numeric params through', async () => {
    await GET(req('http://x/api/dimensions/sizes?height=205&width=55'));
    expect(h.calls[0]).toEqual([205, 55]);
  });

  it('returns a generic 500 (no err.message) on failure', async () => {
    h.impl = () => {
      throw new Error('boom secret');
    };
    const res = await GET(req('http://x/api/dimensions/sizes'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Failed to fetch tire sizes');
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
