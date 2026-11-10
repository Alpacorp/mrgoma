import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SingleTire } from '@/app/interfaces/tires';

const h = vi.hoisted(() => ({
  queries: [] as string[],
  inputs: [] as { name: string; value: unknown }[],
  recordset: [] as Record<string, unknown>[],
}));

vi.mock('@/connection/db', () => ({
  getPool: async () => ({
    request: () => {
      const req = {
        input(name: string, _type: unknown, value: unknown) {
          h.inputs.push({ name, value });
          return req;
        },
        async query(sql: string) {
          h.queries.push(sql);
          return { recordset: h.recordset };
        },
      };
      return req;
    },
  }),
}));

vi.mock('@/connection/queryLogger', () => ({
  logQuery: async <T>(_label: string, run: () => Promise<T>) => run(),
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));

const { buildSetCandidatesQuery, fetchSetCandidatesFresh, setGroupKey, setGroupOf, toSetUnit } =
  await import('./tireSetsRepository');
const { STOREFRONT_SELLABLE_WHERE } = await import('./feedQuery');

const tire = (over: Partial<SingleTire> = {}): SingleTire =>
  ({
    id: '1',
    name: '(1) | MICHELIN | 225/65/17',
    brand: 'MICHELIN',
    model2: 'DEFENDER',
    size: '225/65/17',
    runFlat: 'No',
    condition: 'Used',
    city: 'Miami',
    ...over,
  }) as SingleTire;

beforeEach(() => {
  h.queries = [];
  h.inputs = [];
  h.recordset = [];
});

describe('setGroupOf / setGroupKey', () => {
  it('gives two tires of one group the same key', () => {
    const a = setGroupOf(tire({ id: '1' }));
    const b = setGroupOf(tire({ id: '2' }));
    expect(a && b && setGroupKey(a)).toBe(b && setGroupKey(b));
  });

  it('separates by city, run-flat and condition', () => {
    const base = setGroupKey(setGroupOf(tire())!);
    expect(setGroupKey(setGroupOf(tire({ city: 'Orlando' }))!)).not.toBe(base);
    expect(setGroupKey(setGroupOf(tire({ runFlat: 'Yes' }))!)).not.toBe(base);
    expect(setGroupKey(setGroupOf(tire({ condition: 'New' }))!)).not.toBe(base);
  });

  it('refuses tires without a model (they would mix models)', () => {
    expect(setGroupOf(tire({ model2: '' }))).toBeNull();
    expect(setGroupOf(tire({ model2: undefined }))).toBeNull();
  });
});

describe('buildSetCandidatesQuery', () => {
  const g = setGroupOf(tire())!;

  it('uses the shared sellable rule and binds brand, model and size', () => {
    const sql = buildSetCandidatesQuery(g);
    expect(sql).toContain(STOREFRONT_SELLABLE_WHERE);
    expect(sql).toContain('Brand = @brand AND Model2 = @model2 AND RealSize = @size');
    expect(sql).not.toContain('MICHELIN');
    expect(sql).not.toContain('DEFENDER');
  });

  it('never reads the shelf code', () => {
    expect(buildSetCandidatesQuery(g)).not.toMatch(/\bLocation\b/);
  });

  it('filters Orlando by its vaults and Miami as everything else (AC14)', () => {
    expect(buildSetCandidatesQuery({ ...g, city: 'Orlando' })).toContain(
      "VaultName IN ('Clifton', 'Semoran', 'Orlando')"
    );
    expect(buildSetCandidatesQuery(g)).toContain(
      "VaultName NOT IN ('Clifton', 'Semoran', 'Orlando')"
    );
  });

  it('matches run-flat type and condition class', () => {
    expect(buildSetCandidatesQuery({ ...g, runFlat: true })).toContain('KindSaleId = 1');
    expect(buildSetCandidatesQuery(g)).toContain('ISNULL(KindSaleId, 0) <> 1');
    expect(buildSetCandidatesQuery({ ...g, isNew: true })).toContain('ProductTypeId = 1');
  });
});

describe('fetchSetCandidatesFresh / toSetUnit', () => {
  it('binds the inputs and maps rows to city-only units', async () => {
    h.recordset = [
      {
        TireId: 42,
        Code: 'X1',
        Price: '120.5',
        Tread: '9.0',
        RemainingLife: '88%',
        Patched: '1',
        DOT: '1222',
        Image1: null,
        ProductTypeId: 2,
        VaultName: 'Semoran',
      },
    ];
    const units = await fetchSetCandidatesFresh(setGroupOf(tire())!);
    expect(h.inputs.map(i => i.name)).toEqual(['brand', 'model2', 'size']);
    expect(units).toEqual([
      {
        id: '42',
        code: 'X1',
        price: 120.5,
        tread: 9,
        life: '88%',
        patched: true,
        dot: '1222',
        image: null,
        condition: 'Used',
        city: 'Orlando',
      },
    ]);
    expect(JSON.stringify(units)).not.toContain('Semoran');
  });

  it('reads a missing tread as null', () => {
    expect(toSetUnit({ TireId: 1, Tread: '-' }).tread).toBeNull();
  });
});
