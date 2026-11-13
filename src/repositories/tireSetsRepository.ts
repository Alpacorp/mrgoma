import { unstable_cache } from 'next/cache';

import { NVarChar } from 'mssql';

import type { SingleTire } from '@/app/interfaces/tires';
import { ORLANDO_VAULTS, storeCity } from '@/app/utils/storeCity';
import {
  parseTread,
  SET_PAGE_CANDIDATES,
  type SetUnit,
  type TireCity,
} from '@/app/utils/tireSets';
import { logQuery } from '@/connection/queryLogger';
import { STOREFRONT_SELLABLE_WHERE } from '@/repositories/feedQuery';

/**
 * Compatible tires for a set (feature 041).
 *
 * A set's members share brand, model, size, run-flat type and condition class.
 * Those five values are the **group**; every tire of a group sees the same
 * candidates, which is why the cache is keyed by the group and not by tire id —
 * the hundred pages of a hundred-unit group share one query.
 *
 * The city is **not** part of a set's group (feature 047, D1: the owner moves
 * tires between Miami and Orlando). A group may still carry a city to count
 * the tires of one city — 043's "N like this in {city}" — and then the query
 * filters by it.
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
  /** Only to count one city's tires (043); sets never pass it (047). */
  city?: TireCity;
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
  };
}

/** Stable cache key for a group. Two tires of one group → one key. */
export function setGroupKey(g: SetGroup): string {
  return [
    g.brand,
    g.model2,
    g.size,
    g.runFlat ? 'rf' : 'std',
    g.isNew ? 'new' : 'used',
    g.city ?? 'any',
  ]
    .map(part => part.toLowerCase())
    .join('|');
}

const SET_COLUMNS =
  'TireId, Code, Price, Tread, RemainingLife, Patched, DOT, Image1, ProductTypeId, VaultName';

/** Most units a set block ever needs; the biggest groups exceed 100. */
export const MAX_CANDIDATES = SET_PAGE_CANDIDATES;

const ORLANDO_LIST = ORLANDO_VAULTS.map(v => `'${v}'`).join(', ');

/**
 * The SQL for a group. Pure and exported so a test can assert it binds every
 * value and, given a city, filters by it the same way `storeCity` reads it
 * (unknown vaults count as Miami). Without a city, both cities (047).
 */
export function buildSetCandidatesQuery(g: SetGroup): string {
  const city =
    g.city === 'Orlando'
      ? ` AND VaultName IN (${ORLANDO_LIST})`
      : g.city === 'Miami'
        ? ` AND (VaultName IS NULL OR VaultName NOT IN (${ORLANDO_LIST}))`
        : '';
  const runFlat = g.runFlat ? 'KindSaleId = 1' : 'ISNULL(KindSaleId, 0) <> 1';
  const condition = g.isNew ? 'ProductTypeId = 1' : 'ISNULL(ProductTypeId, 0) <> 1';
  return (
    `SELECT TOP ${MAX_CANDIDATES} ${SET_COLUMNS} FROM dbo.View_Tires ` +
    `WHERE ${STOREFRONT_SELLABLE_WHERE} ` +
    `AND Brand = @brand AND Model2 = @model2 AND RealSize = @size ` +
    `AND ${runFlat} AND ${condition}${city} ` +
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

/* ── Feature 044: every sellable unit of one size, for the AI chat ─────────── */

/** A unit of a size, with the group fields the chat groups by. No warehouse. */
export type SizeUnit = SetUnit & { brand: string; model2: string; runFlat: boolean };

/** The largest size had 266 sellable units on 2026-11-10 (290 sizes, 6,754 units). */
export const MAX_SIZE_UNITS = 400;

/** Pure and exported for the test: binds `@size`, never reads `Location`. */
export function buildSizeUnitsQuery(): string {
  return (
    `SELECT TOP ${MAX_SIZE_UNITS} Brand, Model2, KindSaleId, ${SET_COLUMNS} ` +
    `FROM dbo.View_Tires WHERE ${STOREFRONT_SELLABLE_WHERE} AND RealSize = @size ` +
    `ORDER BY TRY_CAST(Tread AS float) DESC, Price ASC`
  );
}

type SizeRow = SetRow & { Brand?: string; Model2?: string; KindSaleId?: number };

export function toSizeUnit(row: SizeRow): SizeUnit {
  return {
    ...toSetUnit(row),
    brand: (row.Brand ?? '').trim(),
    model2: (row.Model2 ?? '').trim(),
    runFlat: row.KindSaleId === 1,
  };
}

/** Every sellable unit of a size (`w/s/d`, as `RealSize`), uncached. */
export async function fetchSizeUnitsFresh(size: string): Promise<SizeUnit[]> {
  const { getPool } = await import('@/connection/db');
  const pool = await getPool();
  const request = pool.request();
  request.input('size', NVarChar, size);
  const result = await logQuery('tireSets.sizeUnits', () => request.query(buildSizeUnitsQuery()));
  return ((result.recordset as SizeRow[]) ?? []).map(toSizeUnit);
}

/**
 * Cached by size for 120 s: every chat asking for one size shares one query —
 * the pool of 10 connections has saturated under bot traffic before.
 */
const cachedSizeUnits = unstable_cache(
  async (size: string) => fetchSizeUnitsFresh(size),
  ['tire-size-units'],
  { revalidate: 120, tags: ['tire-sets'] }
);

export function getCachedSizeUnits(size: string): Promise<SizeUnit[]> {
  return cachedSizeUnits(size);
}
