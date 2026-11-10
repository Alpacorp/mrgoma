import { unstable_cache } from 'next/cache';

import { NVarChar } from 'mssql';

import type { SingleTire } from '@/app/interfaces/tires';
import { ORLANDO_VAULTS, storeCity } from '@/app/utils/storeCity';
import { parseTread, type SetUnit, type TireCity } from '@/app/utils/tireSets';
import { logQuery } from '@/connection/queryLogger';
import { STOREFRONT_SELLABLE_WHERE } from '@/repositories/feedQuery';

/**
 * Compatible tires for a set (feature 041).
 *
 * A set's members share brand, model, size, run-flat type, condition class and
 * city. Those six values are the **group**; every tire of a group sees the same
 * candidates, which is why the cache is keyed by the group and not by tire id —
 * the hundred pages of a hundred-unit group share one query.
 *
 * Only whitelisted columns are read. `VaultName` is read to derive the city and
 * is never returned; `Location` (the shelf code) is not read at all.
 */

export type SetGroup = {
  brand: string;
  model2: string;
  size: string;
  runFlat: boolean;
  isNew: boolean;
  city: TireCity;
};

/** The group a tire belongs to, or `null` when it cannot form sets (no model). */
export function setGroupOf(tire: SingleTire): SetGroup | null {
  const model2 = (tire.model2 ?? '').trim();
  const size = (tire.size ?? '').trim();
  const brand = (tire.brand ?? '').trim();
  // A blank model would group different models of a brand and size together.
  if (!model2 || !size || !brand || brand === 'Unknown') return null;
  return {
    brand,
    model2,
    size,
    runFlat: tire.runFlat === 'Yes',
    isNew: tire.condition === 'New',
    city: tire.city ?? 'Miami',
  };
}

/** Stable cache key for a group. Two tires of one group → one key. */
export function setGroupKey(g: SetGroup): string {
  return [g.brand, g.model2, g.size, g.runFlat ? 'rf' : 'std', g.isNew ? 'new' : 'used', g.city]
    .map(part => part.toLowerCase())
    .join('|');
}

const SET_COLUMNS =
  'TireId, Code, Price, Tread, RemainingLife, Patched, DOT, Image1, ProductTypeId, VaultName';

/** Most units a set block ever needs; the biggest groups exceed 100. */
const MAX_CANDIDATES = 60;

const ORLANDO_LIST = ORLANDO_VAULTS.map(v => `'${v}'`).join(', ');

/**
 * The SQL for a group. Pure and exported so a test can assert it binds every
 * value and filters by city the same way `storeCity` reads it (unknown vaults
 * count as Miami).
 */
export function buildSetCandidatesQuery(g: SetGroup): string {
  const city =
    g.city === 'Orlando'
      ? `VaultName IN (${ORLANDO_LIST})`
      : `(VaultName IS NULL OR VaultName NOT IN (${ORLANDO_LIST}))`;
  const runFlat = g.runFlat ? 'KindSaleId = 1' : 'ISNULL(KindSaleId, 0) <> 1';
  const condition = g.isNew ? 'ProductTypeId = 1' : 'ISNULL(ProductTypeId, 0) <> 1';
  return (
    `SELECT TOP ${MAX_CANDIDATES} ${SET_COLUMNS} FROM dbo.View_Tires ` +
    `WHERE ${STOREFRONT_SELLABLE_WHERE} ` +
    `AND Brand = @brand AND Model2 = @model2 AND RealSize = @size ` +
    `AND ${runFlat} AND ${condition} AND ${city} ` +
    `ORDER BY TRY_CAST(Tread AS float) DESC, Price ASC`
  );
}

type SetRow = {
  TireId: string | number;
  Code?: string;
  Price?: string | number;
  Tread?: string;
  RemainingLife?: string;
  Patched?: string;
  DOT?: string;
  Image1?: string | null;
  ProductTypeId?: number;
  VaultName?: string;
};

/** A row as the set builder sees it — city only, no warehouse, no shelf. */
export function toSetUnit(row: SetRow): SetUnit {
  const price = typeof row.Price === 'string' ? parseFloat(row.Price) : Number(row.Price);
  return {
    id: String(row.TireId),
    code: row.Code || undefined,
    price: Number.isFinite(price) ? price : 0,
    tread: parseTread(row.Tread),
    life: row.RemainingLife || undefined,
    patched: row.Patched !== '0',
    dot: row.DOT || undefined,
    image: row.Image1 || null,
    condition: row.ProductTypeId === 1 ? 'New' : 'Used',
    city: storeCity(row.VaultName),
  };
}

/** Every sellable unit of a group, uncached. */
export async function fetchSetCandidatesFresh(g: SetGroup): Promise<SetUnit[]> {
  // Loaded on demand: `@/connection/db` requires the DB env vars at import time,
  // and this module is reachable from the detail page's component barrel, which
  // many client tests import without a database (feature 041).
  const { getPool } = await import('@/connection/db');
  const pool = await getPool();
  const request = pool.request();
  request.input('brand', NVarChar, g.brand);
  request.input('model2', NVarChar, g.model2);
  request.input('size', NVarChar, g.size);
  const result = await logQuery('tireSets.candidates', () =>
    request.query(buildSetCandidatesQuery(g))
  );
  return ((result.recordset as SetRow[]) ?? []).map(toSetUnit);
}

/**
 * Cached by group for 60 s. Staleness is absorbed downstream: checkout
 * re-checks availability and offers a replacement for a tire that sold.
 */
const cachedByKey = unstable_cache(
  async (_key: string, g: SetGroup) => fetchSetCandidatesFresh(g),
  ['tire-set-candidates'],
  { revalidate: 60, tags: ['tire-sets'] }
);

export function getCachedSetCandidates(g: SetGroup): Promise<SetUnit[]> {
  return cachedByKey(setGroupKey(g), g);
}
