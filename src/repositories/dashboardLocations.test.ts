import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `Location` is the shelf code a tire sits on, and it only means something
 * inside its store: `IN`, `stkCesar`, `+690A+`, `+692A+`, `+706D+`, `[183B]` and
 * `+IN+` each exist in more than one. So this returns **pairs**, never bare
 * codes — a caller handed a loose `+690A+` cannot build a correct filter from it.
 */

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

const { fetchDashboardLocations } = await import('@/repositories/tiresRepository');

beforeEach(() => {
  h.queries = [];
  h.inputs = [];
  h.recordset = [];
});

describe('fetchDashboardLocations', () => {
  /**
   * AC4b. Unscoped the catalog holds 675 codes, and the filter that consumes
   * this is disabled with no store selected — so there is nothing to ask for and
   * asking anyway would be a query per keystroke of an empty selection.
   */
  it('asks the database nothing when no store is selected', async () => {
    expect(await fetchDashboardLocations([])).toEqual([]);
    expect(await fetchDashboardLocations(['', '   '])).toEqual([]);
    expect(h.queries).toEqual([]);
  });

  // AC3
  it('returns each code paired with the store it belongs to', async () => {
    h.recordset = [
      { VaultName: 'Hialeah', Location: '+690A+' },
      { VaultName: '441', Location: '+690A+' },
      { VaultName: 'Hialeah', Location: '-507D-' },
    ];

    expect(await fetchDashboardLocations(['Hialeah', '441'])).toEqual([
      { store: 'Hialeah', code: '+690A+' },
      { store: '441', code: '+690A+' },
      { store: 'Hialeah', code: '-507D-' },
    ]);
  });

  it('binds every store name instead of interpolating it', async () => {
    await fetchDashboardLocations(['Coral Gables', "O'Brien"]);

    expect(h.inputs).toEqual([
      { name: 'store0', value: 'Coral Gables' },
      { name: 'store1', value: "O'Brien" },
    ]);
    expect(h.queries[0]).toContain('@store0');
    expect(h.queries[0]).not.toContain('Coral Gables');
  });

  it('de-duplicates the stores it was given', async () => {
    await fetchDashboardLocations(['Hialeah', 'Hialeah', ' Hialeah ']);
    expect(h.inputs).toEqual([{ name: 'store0', value: 'Hialeah' }]);
  });

  // 1.057 units carry no code; offering a blank option would filter to nothing.
  it('excludes blank codes in the query, as the stores query already does', async () => {
    await fetchDashboardLocations(['Hialeah']);
    expect(h.queries[0]).toContain("LTRIM(RTRIM(Location)) <> ''");
    expect(h.queries[0]).toContain('Location IS NOT NULL');
  });

  /**
   * Not trimmed on the way out. Nothing in the catalog has edge whitespace
   * today, but `buildFiltersClause` compares these values with `=`, so trimming
   * here is how an option would stop matching the rows it names.
   */
  it('returns the code exactly as stored', async () => {
    h.recordset = [{ VaultName: 'Hialeah', Location: "''651B ''" }];
    const [only] = await fetchDashboardLocations(['Hialeah']);
    expect(only.code).toBe("''651B ''");
  });
});
