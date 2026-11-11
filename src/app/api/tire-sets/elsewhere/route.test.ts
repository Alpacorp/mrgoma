import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SetUnit } from '@/app/utils/tireSets';

const h = vi.hoisted(() => ({
  record: null as Record<string, unknown> | null,
  candidates: [] as SetUnit[],
  groups: [] as Array<{ city: string }>,
  fail: false,
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchTireById: async () => h.record }));
vi.mock('@/repositories/tireSetsRepository', async () => {
  const real = await vi.importActual<typeof import('@/repositories/tireSetsRepository')>(
    '@/repositories/tireSetsRepository'
  );
  return {
    setGroupOf: real.setGroupOf,
    getCachedSetCandidates: async (g: { city: string }) => {
      if (h.fail) throw new Error('db down');
      h.groups.push(g);
      return h.candidates;
    },
  };
});
vi.mock('@/connection/db', () => ({ getPool: async () => ({}) }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

const { GET } = await import('./route');

let ip = 0;
const req = (qs: string) =>
  ({
    url: `https://x.test/api/tire-sets/elsewhere?${qs}`,
    headers: new Headers({ 'x-forwarded-for': `10.1.0.${++ip % 250}` }),
  }) as unknown as NextRequest;

const unit = (id: string, tread: number | null, over: Partial<SetUnit> = {}): SetUnit => ({
  id,
  price: 100,
  tread,
  patched: false,
  condition: 'Used',
  city: 'Miami',
  ...over,
});

beforeEach(() => {
  // An Orlando tire, 9/32.
  h.record = {
    TireId: '10',
    Brand: 'MICHELIN',
    Model2: 'DEFENDER',
    RealSize: '225/65/17',
    Price: 100,
    Tread: '9.0',
    Patched: '0',
    ProductTypeId: 2,
    VaultName: 'Clifton',
  };
  h.candidates = [];
  h.groups = [];
  h.fail = false;
});

describe('GET /api/tire-sets/elsewhere', () => {
  it('counts tires like this in the other city at any tread and links the closest (AC4)', async () => {
    h.candidates = [
      unit('1', 4),
      unit('2', 8.5, { patched: true }),
      unit('3', 8.5, { price: 150 }),
      unit('4', null),
    ];
    const res = await GET(req('id=10&city=Miami'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 4, href: '/tires/3-michelin-225-65-17' });
    expect(h.groups[0].city).toBe('Miami');
    expect(res.headers.get('Cache-Control')).toBe('s-maxage=60');
  });

  it('says nothing when the city has none (AC5)', async () => {
    expect(await (await GET(req('id=10&city=Miami'))).json()).toEqual({ count: 0 });
  });

  it('rejects bad input and the tire’s own city', async () => {
    expect((await GET(req('id=abc&city=Miami'))).status).toBe(400);
    expect((await GET(req('id=10&city=Tampa'))).status).toBe(400);
    expect((await GET(req('id=10&city=Orlando'))).status).toBe(400);
  });

  it('is 404 for an unknown tire and silent on a database failure', async () => {
    h.record = null;
    expect((await GET(req('id=10&city=Miami'))).status).toBe(404);
    h.record = { TireId: '10', Brand: 'X', Model2: 'Y', RealSize: '1/2/3', VaultName: 'Clifton' };
    h.fail = true;
    expect(await (await GET(req('id=10&city=Miami'))).json()).toEqual({ count: 0 });
  });
});
