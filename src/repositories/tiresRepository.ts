import { Float, Int, VarChar } from 'mssql';

import { getPool } from '@/connection/db';

type MssqlType = typeof VarChar | typeof Int | typeof Float;
type SqlParam = { name: string; type: MssqlType; value: unknown };

function buildFiltersClause(filters: TireFilters): { clause: string; params: SqlParam[] } {
  let clause = '';
  const params: SqlParam[] = [];

  if (filters.width || filters.sidewall || filters.diameter) {
    if (filters.width && filters.sidewall && filters.diameter) {
      clause += ' AND RealSize = @realSize';
      params.push({ name: 'realSize', type: VarChar, value: `${filters.width}/${filters.sidewall}/${filters.diameter}` });
    } else {
      if (filters.width) {
        clause += ' AND RealSize LIKE @widthPattern';
        params.push({ name: 'widthPattern', type: VarChar, value: `${filters.width}/%` });
      }
      if (filters.sidewall) {
        clause += ' AND RealSize LIKE @sidewallPattern';
        params.push({ name: 'sidewallPattern', type: VarChar, value: `%/${filters.sidewall}/%` });
      }
      if (filters.diameter) {
        clause += ' AND RealSize LIKE @diameterPattern';
        params.push({ name: 'diameterPattern', type: VarChar, value: `%/${filters.diameter}` });
      }
    }
  }

  if (filters.condition && filters.condition.length > 0) {
    const normalized = filters.condition.map(c => c.toLowerCase());
    if (normalized.includes('new') && !normalized.includes('used')) {
      clause += ' AND ProductTypeId = 1';
    } else if (!normalized.includes('new') && normalized.includes('used')) {
      clause += ' AND ProductTypeId <> 1';
    }
  }

  if (filters.patched && filters.patched.length > 0) {
    const normalized = filters.patched.map(p => p.toLowerCase());
    if (normalized.includes('yes') && !normalized.includes('no')) {
      clause += " AND Patched <> '0'";
    } else if (!normalized.includes('yes') && normalized.includes('no')) {
      clause += " AND Patched = '0'";
    }
  }

  if (filters.brands && filters.brands.length > 0) {
    const brandParams = filters.brands.map((_, i) => `@brand${i}`).join(',');
    clause += ` AND Brand IN (${brandParams})`;
    filters.brands.forEach((brand, i) => params.push({ name: `brand${i}`, type: VarChar, value: brand }));
  }

  if (filters.stores && filters.stores.length > 0) {
    const storeParams = filters.stores.map((_, i) => `@store${i}`).join(',');
    clause += ` AND VaultName IN (${storeParams})`;
    filters.stores.forEach((store, i) => params.push({ name: `store${i}`, type: VarChar, value: store }));
  }

  if (filters.kindSale && filters.kindSale.length > 0) {
    const normalized = filters.kindSale.map(k => k.toLowerCase());
    if (normalized.includes('yes') && !normalized.includes('no')) {
      clause += " AND KindSale = 'Yes'";
    } else if (!normalized.includes('yes') && normalized.includes('no')) {
      clause += " AND KindSale = 'No'";
    }
  }

  if (filters.local && filters.local.length > 0) {
    const normalized = filters.local.map(l => l.toLowerCase());
    if (normalized.includes('yes') && !normalized.includes('no')) {
      clause += " AND Local = '1'";
    } else if (!normalized.includes('yes') && normalized.includes('no')) {
      clause += " AND Local = '0'";
    }
  }

  if (typeof filters.minPrice === 'number') {
    clause += ' AND Price >= @minPrice';
    params.push({ name: 'minPrice', type: Int, value: filters.minPrice });
  }
  if (typeof filters.maxPrice === 'number') {
    clause += ' AND Price <= @maxPrice';
    params.push({ name: 'maxPrice', type: Int, value: filters.maxPrice });
  }
  if (typeof filters.minTreadDepth === 'number') {
    clause += ' AND Tread >= @minTreadDepth';
    params.push({ name: 'minTreadDepth', type: Float, value: filters.minTreadDepth });
  }
  if (typeof filters.maxTreadDepth === 'number') {
    clause += ' AND Tread <= @maxTreadDepth';
    params.push({ name: 'maxTreadDepth', type: Float, value: filters.maxTreadDepth });
  }
  if (typeof filters.minRemainingLife === 'number') {
    clause += " AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) >= @minRemainingLife";
    params.push({ name: 'minRemainingLife', type: Int, value: filters.minRemainingLife });
  }
  if (typeof filters.maxRemainingLife === 'number') {
    clause += " AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) <= @maxRemainingLife";
    params.push({ name: 'maxRemainingLife', type: Int, value: filters.maxRemainingLife });
  }

  if (filters.tireCode) {
    clause += ' AND Code = @tireCode';
    params.push({ name: 'tireCode', type: VarChar, value: filters.tireCode });
  }

  return { clause, params };
}

export type DocumentRecord = {
  id?: number;
  ProductTypeId?: number;
  TireId: string;
  Code: string;
  DOT?: string;
  loadIndex?: string;
  Brand?: string;
  Model?: string;
  Model2?: string;
  Description?: string;
  Size?: string;
  Image1?: string;
  Image2?: string;
  Image3?: string;
  Image4?: string;
  Price?: string | number;
  BrandId?: number;
  Condition?: string;
  Patched?: string;
  RemainingLife?: string;
  Status?: string;
  speedIndex?: string;
  Tread?: string;
  RealSize?: string;
  VaultName?: string;
  KindSale?: string;
  KindSaleId?: number;
  Height?: string | number;
  Width?: string | number;
  LoadIndexId?: string | number;
};

export type TireFilters = {
  condition?: string[];
  patched?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minTreadDepth?: number;
  maxTreadDepth?: number;
  minRemainingLife?: number;
  maxRemainingLife?: number;
  sort?: string;
  width?: string; // Ancho del neumático (w)
  sidewall?: string; // Relación de aspecto (s)
  diameter?: string; // Diámetro (d)
  stores?: string[];
  kindSale?: string[];
  local?: string[];
  tireCode?: string;
};

export type TireRangeResult = {
  minPrice: number;
  maxPrice: number;
  minTreadDepth: number;
  maxTreadDepth: number;
  minRemainingLife: number;
  maxRemainingLife: number;
};

export async function fetchTires(
  offset: number,
  pageSize: number,
  filters: TireFilters = {}
): Promise<{ records: DocumentRecord[]; totalCount: number }> {
  return fetchTiresInternal(
    offset,
    pageSize,
    filters,
    "Local = '0' AND Trash = 'false' AND Condition != 'sold' AND RemainingLife >= '50%' AND Price != 0"
  );
}

export async function fetchDashboardTires(
  offset: number,
  pageSize: number,
  filters: TireFilters = {}
): Promise<{ records: DocumentRecord[]; totalCount: number }> {
  return fetchTiresInternal(offset, pageSize, filters, "Trash = 'false'");
}

async function fetchTiresInternal(
  offset: number,
  pageSize: number,
  filters: TireFilters = {},
  baseWhereClause: string
): Promise<{ records: DocumentRecord[]; totalCount: number }> {
  const pool = await getPool();
  const request = pool.request();
  const countRequest = pool.request();

  request.input('offset', Int, offset).input('pageSize', Int, pageSize);
  countRequest.input('offset', Int, offset).input('pageSize', Int, pageSize);

  const { clause, params } = buildFiltersClause(filters);
  const whereClause = baseWhereClause + clause;
  for (const p of params) {
    request.input(p.name, p.type, p.value);
    countRequest.input(p.name, p.type, p.value);
  }

  const baseQuery = `FROM dbo.View_Tires WHERE ${whereClause}`;

  let orderBy = 'ModificationDate DESC';

  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        orderBy = 'Price ASC';
        break;
      case 'price-desc':
        orderBy = 'Price DESC';
        break;
    }
  }

  const dataQuery = `SELECT * ${baseQuery} ORDER BY ${orderBy} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;
  const countQuery = `SELECT COUNT(*) AS totalCount ${baseQuery}`;

  const [dataResult, countResult] = await Promise.all([
    request.query(dataQuery),
    countRequest.query(countQuery),
  ]);

  const records = dataResult.recordset as DocumentRecord[];
  const totalCount = countResult.recordset[0]?.totalCount as number;

  return { records, totalCount };
}

export async function fetchTireRanges(): Promise<TireRangeResult> {
  return fetchTireRangesInternal(
    "Local = '0' AND Trash = 'false' AND Condition != 'sold' AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) >= 50 AND Price != 0"
  );
}

export async function fetchDashboardRanges(): Promise<TireRangeResult> {
  return fetchTireRangesInternal("Trash = 'false'");
}

async function fetchTireRangesInternal(baseWhereClause: string): Promise<TireRangeResult> {
  const pool = await getPool();

  const query = `SELECT
      MIN(Price) AS minPrice,
      MAX(Price) AS maxPrice,
      MIN(TRY_CAST(Tread AS float)) AS minTreadDepth,
      MAX(TRY_CAST(Tread AS float)) AS maxTreadDepth,
      MIN(TRY_CAST(REPLACE(RemainingLife, '%', '') AS int)) AS minRemainingLife,
      MAX(TRY_CAST(REPLACE(RemainingLife, '%', '') AS int)) AS maxRemainingLife
    FROM dbo.View_Tires
    WHERE ${baseWhereClause}`;

  const result = await pool.request().query(query);

  return result.recordset[0] as TireRangeResult;
}

export async function fetchBrands(filters: TireFilters = {}): Promise<string[]> {
  return fetchBrandsInternal(
    filters,
    "Local = '0' AND Trash = 'false' AND Condition != 'sold' AND RemainingLife >= '50%' AND Price != 0"
  );
}

export async function fetchDashboardBrands(filters: TireFilters = {}): Promise<string[]> {
  return fetchBrandsInternal(filters, "Trash = 'false'");
}

async function fetchBrandsInternal(
  filters: TireFilters = {},
  baseWhereClause: string
): Promise<string[]> {
  const pool = await getPool();
  const request = pool.request();

  const { clause, params } = buildFiltersClause(filters);
  const whereClause = baseWhereClause + clause;
  for (const p of params) {
    request.input(p.name, p.type, p.value);
  }

  const query = `SELECT DISTINCT Brand
    FROM dbo.View_Tires
    WHERE ${whereClause} AND Brand IS NOT NULL AND Brand <> ''
    ORDER BY Brand`;

  const result = await request.query(query);
  return result.recordset.map(row => row.Brand as string);
}

export async function fetchDashboardStores(): Promise<string[]> {
  const pool = await getPool();
  const query = `SELECT DISTINCT VaultName
    FROM dbo.View_Tires
    WHERE Trash = 'false' AND VaultName IS NOT NULL AND VaultName <> ''
    ORDER BY VaultName DESC`;
  const result = await pool.request().query(query);
  return result.recordset.map(row => row.VaultName as string);
}

export async function fetchTireById(tireId: string): Promise<DocumentRecord | null> {
  const pool = await getPool();
  const request = pool.request();
  request.input('tireId', VarChar, tireId);

  const query = `SELECT TOP 1 * FROM dbo.View_Tires WHERE TireId = @tireId`;

  const result = await request.query(query);
  const record = (result.recordset && result.recordset[0]) as DocumentRecord | undefined;
  return record || null;
}

export async function fetchTiresByIds(tireIds: string[]): Promise<DocumentRecord[]> {
  if (tireIds.length === 0) return [];

  const unique = Array.from(new Set(tireIds.map(id => id.trim()).filter(Boolean)));
  const pool = await getPool();
  const request = pool.request();

  const params = unique.map((id, idx) => {
    request.input(`tid${idx}`, VarChar, id);
    return `@tid${idx}`;
  });

  const result = await request.query(
    `SELECT * FROM dbo.View_Tires WHERE TireId IN (${params.join(',')})`
  );
  return (result.recordset as DocumentRecord[]) ?? [];
}

export async function fetchActiveTireIds(
  limit: number = 2000
): Promise<Array<{ id: string; modified?: Date; brand?: string; size?: string }>> {
  const pool = await getPool();
  const request = pool.request();
  // SQL Server allows TOP (@limit) with a variable
  request.input('limit', Int, limit);
  const query = `SELECT TOP (@limit) TireId, ModificationDate, Brand, RealSize
                 FROM dbo.View_Tires
                 WHERE Local = '0' AND Trash = 'false' AND Condition != 'sold' AND Price != 0
                 ORDER BY ModificationDate DESC`;
  const result = await request.query(query);
  return (result.recordset || []).map((row: { TireId: string; ModificationDate?: Date; Brand?: string; RealSize?: string }) => ({
    id: String(row.TireId),
    modified: row.ModificationDate,
    brand: row.Brand || undefined,
    size: row.RealSize || undefined,
  }));
}

export async function setTiresConditionIdToSoldByIds(
  tireIds: Array<string | number>,
  conditionId: number = 7
): Promise<{ updated: number }> {
  if (!Array.isArray(tireIds) || tireIds.length === 0) return { updated: 0 };

  const unique = Array.from(new Set(tireIds.map(id => String(id).trim()).filter(Boolean)));
  if (unique.length === 0) return { updated: 0 };

  const pool = await getPool();
  const request = pool.request();

  // Bind parameters for IN clause
  const params: string[] = [];
  unique.forEach((id, idx) => {
    const param = `id${idx}`;
    params.push(`@${param}`);
    request.input(param, VarChar, id);
  });

  request.input('condId', Int, conditionId);

  const sql = `UPDATE dbo.Tires SET ConditionId = @condId, Trash = 1 WHERE TireId IN (${params.join(', ')})`;
  const result = await request.query(sql);

  const rows = result.rowsAffected.reduce((acc, n) => acc + n, 0);

  return { updated: rows || 0 };
}
