import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Shelf codes describe the inside of a warehouse, so this route sits behind the
 * same session check as every other `/api/dashboard/*` endpoint.
 */

const h = vi.hoisted(() => ({
  session: { user: { name: 'seller' } } as unknown,
  calledWith: null as string[] | null,
}));

vi.mock('@/app/utils/authOptions', () => ({ auth: async () => h.session }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));
vi.mock('@/repositories/tiresRepository', () => ({
  fetchDashboardLocations: async (stores: string[]) => {
    h.calledWith = stores;
    return stores.flatMap(store => [{ store, code: '+703C+' }]);
  },
}));

const { GET } = await import('./route');

const call = (url: string) => GET({ url, method: 'GET' } as NextRequest, undefined);

beforeEach(() => {
  h.session = { user: { name: 'seller' } };
  h.calledWith = null;
});

describe('GET /api/dashboard/locations', () => {
  // AC8
  it('refuses without a session', async () => {
    h.session = null;
    const res = await call('http://localhost/api/dashboard/locations?stores=Hialeah');

    expect(res.status).toBe(401);
    expect(h.calledWith).toBeNull();
  });

  it('passes the requested stores through', async () => {
    const res = await call('http://localhost/api/dashboard/locations?stores=Hialeah,441');

    expect(res.status).toBe(200);
    expect(h.calledWith).toEqual(['Hialeah', '441']);
    expect(await res.json()).toEqual([
      { store: 'Hialeah', code: '+703C+' },
      { store: '441', code: '+703C+' },
    ]);
  });

  /**
   * Absent `stores`, the answer is an empty list rather than every code we have.
   * The unscoped list is 675 values, and a code without its store cannot be
   * filtered on correctly anyway.
   */
  it('answers with nothing when no store was named', async () => {
    const res = await call('http://localhost/api/dashboard/locations');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(h.calledWith).toEqual([]);
  });

  it('survives a store name with a space or an ampersand', async () => {
    await call(
      `http://localhost/api/dashboard/locations?stores=${encodeURIComponent('Coral Gables,B&B')}`
    );
    expect(h.calledWith).toEqual(['Coral Gables', 'B&B']);
  });
});
