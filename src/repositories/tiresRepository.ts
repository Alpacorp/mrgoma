import { Int, VarChar, Float } from 'mssql';

import { getPool } from '@/connection/db';

export type DocumentRecord = {
  id?: number;
  TireId: string;
  Code: string;
  Brand?: string;
  Model?: string;
  Size?: string;
  Image1?: string;
  Price?: string | number;
  BrandId?: number;
  Condition?: string;
  Patched?: string;
  RemainingLife?: string;
  Tread?: string;
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
  const pool = await getPool();
  const request = pool.request();
  const countRequest = pool.request();
  request.input('offset', Int, offset).input('pageSize', Int, pageSize);
  // Apply same inputs to countRequest so both queries use identical parameters
  countRequest.input('offset', Int, offset).input('pageSize', Int, pageSize);

  let whereClause =
    "Local = '0' AND Trash = 'false' AND Condition != 'sold' AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) > 70 AND Price != 0";

  if (filters.condition && filters.condition.length > 0) {
    const normalized = filters.condition.map(c => c.toLowerCase());
    const includeNew = normalized.includes('new');
    const includeUsed = normalized.includes('used');

    if (includeNew && !includeUsed) {
      whereClause += ' AND ProductTypeId = 1';
    } else if (!includeNew && includeUsed) {
      whereClause += ' AND ProductTypeId <> 1';
    }
  }

  if (filters.patched && filters.patched.length > 0) {
    const normalized = filters.patched.map(p => p.toLowerCase());
    const includeYes = normalized.includes('yes');
    const includeNo = normalized.includes('no');

    if (includeYes && !includeNo) {
      whereClause += " AND Patched <> '0'";
    } else if (!includeYes && includeNo) {
      whereClause += " AND Patched = '0'";
    }
  }

  if (filters.brands && filters.brands.length > 0) {
    const brandParams = filters.brands.map((_, idx) => `@brand${idx}`).join(',');
    whereClause += ` AND Brand IN (${brandParams})`;
    filters.brands.forEach((brand, idx) => {
      request.input(`brand${idx}`, VarChar, brand);
      countRequest.input(`brand${idx}`, VarChar, brand);
    });
  }

  if (typeof filters.minPrice === 'number') {
    whereClause += ' AND Price >= @minPrice';
    request.input('minPrice', Int, filters.minPrice);
    countRequest.input('minPrice', Int, filters.minPrice);
  }

  if (typeof filters.maxPrice === 'number') {
    whereClause += ' AND Price <= @maxPrice';
    request.input('maxPrice', Int, filters.maxPrice);
    countRequest.input('maxPrice', Int, filters.maxPrice);
  }

  if (typeof filters.minTreadDepth === 'number') {
    whereClause += ' AND TRY_CAST(Tread AS float) >= @minTreadDepth';
    request.input('minTreadDepth', Float, filters.minTreadDepth);
    countRequest.input('minTreadDepth', Float, filters.minTreadDepth);
  }

  if (typeof filters.maxTreadDepth === 'number') {
    whereClause += ' AND TRY_CAST(Tread AS float) <= @maxTreadDepth';
    request.input('maxTreadDepth', Float, filters.maxTreadDepth);
    countRequest.input('maxTreadDepth', Float, filters.maxTreadDepth);
  }

  if (typeof filters.minRemainingLife === 'number') {
    whereClause +=
      " AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) >= @minRemainingLife";
    request.input('minRemainingLife', Int, filters.minRemainingLife);
    countRequest.input('minRemainingLife', Int, filters.minRemainingLife);
  }

  if (typeof filters.maxRemainingLife === 'number') {
    whereClause +=
      " AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) <= @maxRemainingLife";
    request.input('maxRemainingLife', Int, filters.maxRemainingLife);
    countRequest.input('maxRemainingLife', Int, filters.maxRemainingLife);
  }

  const baseQuery = `FROM dbo.View_Tires WHERE ${whereClause}`;
  const dataQuery = `SELECT * ${baseQuery} ORDER BY ModificationDate DESC OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;
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
  const pool = await getPool();

  const query = `SELECT
      MIN(Price) AS minPrice,
      MAX(Price) AS maxPrice,
      MIN(TRY_CAST(Tread AS float)) AS minTreadDepth,
      MAX(TRY_CAST(Tread AS float)) AS maxTreadDepth,
      MIN(TRY_CAST(REPLACE(RemainingLife, '%', '') AS int)) AS minRemainingLife,
      MAX(TRY_CAST(REPLACE(RemainingLife, '%', '') AS int)) AS maxRemainingLife
    FROM dbo.View_Tires
    WHERE Local = '0' AND Trash = 'false' AND Condition != 'sold' AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) > 70 AND Price != 0`;

  const result = await pool.request().query(query);
  return result.recordset[0] as TireRangeResult;
}

export async function fetchBrands(): Promise<string[]> {
  const pool = await getPool();

  const query = `SELECT DISTINCT Brand
    FROM dbo.View_Tires
    WHERE Local = '0' AND Trash = 'false' AND Condition != 'sold'
      AND TRY_CAST(REPLACE(RemainingLife, '%', '') AS int) > 70
      AND Price != 0 AND Brand IS NOT NULL AND Brand <> ''
    ORDER BY Brand`;

  const result = await pool.request().query(query);
  return result.recordset.map(row => row.Brand as string);
}
