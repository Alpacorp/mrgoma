import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// A vi.fn that throws/rejects is re-reported by Vitest as an unhandled error even
// when the route catches it, so a swappable plain function (`h.impl`) is used.
const h = vi.hoisted(() => ({ impl: (() => ['Michelin', 'Pirelli']) as () => unknown }));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchBrands: () => h.impl() }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

import { GET } from './route';

const req = (url: string) => ({ url }) as unknown as NextRequest;

beforeEach(() => {
  h.impl = () => ['Michelin', 'Pirelli'];
});

describe('GET /api/brands', () => {
  it('returns the brand list on success', async () => {
    const res = await GET(req('http://x/api/brands'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(['Michelin', 'Pirelli']);
  });

  it('returns a generic 500 (no err.message) on failure', async () => {
    h.impl = () => {
      throw new Error('DB secret leaked');
    };
    const res = await GET(req('http://x/api/brands'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Failed to fetch brands');
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
