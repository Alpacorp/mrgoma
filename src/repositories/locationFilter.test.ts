import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The shelf filter, verified over the SQL we send.
 *
 * These tests run against a stubbed pool, so they assert what we **ask** the
 * database, not what it answers. That distinction is the point: the defect being
 * guarded against is a query that looks right and quietly matches too much.
 */

const h = vi.hoisted(() => ({
  queries: [] as string[],
  inputs: [] as { name: string; value: unknown }[],
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
          return { recordset: [{ totalCount: 0 }] };
        },
      };
      return req;
    },
  }),
}));

vi.mock('@/connection/queryLogger', () => ({
  logQuery: async <T>(_label: string, run: () => Promise<T>) => run(),
}));

const { fetchDashboardTires } = await import('@/repositories/tiresRepository');

const dataQuery = () => h.queries.find(q => q.startsWith('SELECT *')) ?? '';

beforeEach(() => {
  h.queries = [];
  h.inputs = [];
});

describe('filtering by shelf code', () => {
  /**
   * AC5b — the assertion that matters.
   *
   * `+690A+` exists in both Hialeah and 441. A flat `AND Location IN ('+690A+')`
   * reads perfectly and returns both stores' shelves. Only a clause that keeps
   * the store in the **same conjunction** as the code is correct, so that is what
   * is asserted — the store name and the code must be bound together, not merely
   * both present somewhere in the query.
   */
  it('keeps each code in the same conjunction as its store', async () => {
    await fetchDashboardTires(0, 20, {
      locations: [{ store: 'Hialeah', code: '+690A+' }],
    });

    expect(dataQuery()).toContain('(VaultName = @locStore0 AND Location = @locCode0)');
    expect(dataQuery()).not.toMatch(/Location IN \(/);

    expect(h.inputs).toContainEqual({ name: 'locStore0', value: 'Hialeah' });
    expect(h.inputs).toContainEqual({ name: 'locCode0', value: '+690A+' });
  });

  it('ORs several pairs together, each self-contained', async () => {
    await fetchDashboardTires(0, 20, {
      locations: [
        { store: 'Hialeah', code: '+690A+' },
        { store: '441', code: '+690A+' },
      ],
    });

    expect(dataQuery()).toContain(
      '(VaultName = @locStore0 AND Location = @locCode0) OR (VaultName = @locStore1 AND Location = @locCode1)'
    );
    expect(h.inputs).toContainEqual({ name: 'locStore1', value: '441' });
  });

  it('binds the code rather than interpolating it', async () => {
    await fetchDashboardTires(0, 20, {
      locations: [{ store: 'Hialeah', code: "'; DROP TABLE View_Tires --" }],
    });

    expect(dataQuery()).not.toContain('DROP TABLE');
    expect(h.inputs).toContainEqual({
      name: 'locCode0',
      value: "'; DROP TABLE View_Tires --",
    });
  });

  it('leaves the query untouched when no shelf is selected', async () => {
    await fetchDashboardTires(0, 20, { stores: ['Hialeah'] });

    expect(dataQuery()).not.toContain('locCode0');
    expect(dataQuery()).toContain('VaultName IN (@store0)');
  });

  // The awkward real values: braces, angle brackets, colons, doubled quotes.
  it('carries the catalog’s stranger codes through unchanged', async () => {
    for (const code of ['{IN}', ':410D:', '< >', "''651B ''", '112i (a)']) {
      h.inputs = [];
      await fetchDashboardTires(0, 20, { locations: [{ store: 'Hialeah', code }] });
      expect(h.inputs).toContainEqual({ name: 'locCode0', value: code });
    }
  });
});
