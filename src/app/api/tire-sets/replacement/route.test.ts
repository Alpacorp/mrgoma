import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SetUnit } from '@/app/utils/tireSets';

const h = vi.hoisted(() => ({
  record: null as Record<string, unknown> | null,
  candidates: [] as SetUnit[],
  candidateCalls: 0,
}));

vi.mock('next/cache', () => {
  // A tiny stand-in for the data cache, keyed by arguments, so "served from
  // cache" is observable.
  return {
    unstable_cache: (fn: (...a: string[]) => Promise<unknown>) => {
      const memo = new Map<string, Promise<unknown>>();
      return (...args: string[]) => {
        const key = JSON.stringify(args);
        if (!memo.has(key)) memo.set(key, fn(...args));
        return memo.get(key);
      };
    },
  };
});
vi.mock('@/repositories/tiresRepository', () => ({ fetchTireById: async () => h.record }));
vi.mock('@/repositories/tireSetsRepository', async () => {
  const real = await vi.importActual<typeof import('@/repositories/tireSetsRepository')>(
    '@/repositories/tireSetsRepository'
  );
  return {
    setGroupOf: real.setGroupOf,
    fetchSetCandidatesFresh: async () => {
      h.candidateCalls++;
      return h.candidates;
    },
  };
});
vi.mock('@/connection/db', () => ({ getPool: async () => ({}) }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

const { GET } = await import('./route');

const req = (qs: string) =>
  ({
    url: `https://x.test/api/tire-sets/replacement?${qs}`,
    headers: new Headers(),
  }) as unknown as NextRequest;

const unit = (id: string, tread: number, over: Partial<SetUnit> = {}): SetUnit => ({
  id,
  price: 100,
  tread,
  patched: false,
  condition: 'Used',
  city: 'Miami',
  ...over,
});

beforeEach(() => {
  h.record = {
    TireId: '10',
    Brand: 'MICHELIN',
    Model2: 'DEFENDER',
    RealSize: '225/65/17',
    Price: 100,
    Tread: '9.0',
    Patched: '0',
    ProductTypeId: 2,
    VaultName: 'Hialeah',
  };
  h.candidates = [];
  h.candidateCalls = 0;
});

describe('GET /api/tire-sets/replacement', () => {
  it('returns the best compatible tire for the ones kept (AC11)', async () => {
    h.candidates = [unit('11', 9), unit('12', 9), unit('20', 9, { patched: true }), unit('21', 9)];
    const res = await GET(req('sold=10&keep=11,12'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.replacement.id).toBe('21');
    expect(body.product).toEqual({ brand: 'MICHELIN', model2: 'DEFENDER', size: '225/65/17' });
  });

  it('offers a replacement from the other city (047, AC4)', async () => {
    h.candidates = [unit('13', 9), unit('40', 9, { city: 'Orlando' })];
    const body = await (await GET(req('sold=10&keep=13'))).json();
    expect(body.replacement).toMatchObject({ id: '40', city: 'Orlando' });
  });

  it('returns null when nothing fits', async () => {
    h.candidates = [unit('11', 9), unit('30', 5)];
    const body = await (await GET(req('sold=10&keep=11'))).json();
    expect(body.replacement).toBeNull();
  });

  it('rejects malformed input with 400', async () => {
    expect((await GET(req('sold=abc'))).status).toBe(400);
    expect((await GET(req('sold=1&keep=1,2,3,4'))).status).toBe(400);
    expect((await GET(req('sold=1&keep=x'))).status).toBe(400);
  });

  it('answers 404 for an unknown tire', async () => {
    h.record = null;
    expect((await GET(req('sold=999'))).status).toBe(404);
  });

  it('serves a repeated request from the cache', async () => {
    h.candidates = [unit('12', 9), unit('21', 9)];
    await GET(req('sold=10&keep=12'));
    await GET(req('sold=10&keep=12'));
    expect(h.candidateCalls).toBe(1);
  });

  it('never returns warehouse names', async () => {
    h.candidates = [unit('11', 9), unit('21', 9)];
    const text = await (await GET(req('sold=10&keep=11'))).text();
    expect(text).not.toContain('Hialeah');
  });
});
