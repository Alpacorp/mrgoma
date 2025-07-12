import { Int } from 'mssql';

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

export async function fetchTires(offset: number, pageSize: number): Promise<DocumentRecord[]> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('offset', Int, offset)
    .input('pageSize', Int, pageSize)
    .query(
      "SELECT * FROM dbo.View_Tires WHERE Local = '0' AND Trash = 'false' AND Condition != 'sold' AND RemainingLife > '70%' AND Price != 0 ORDER BY ModificationDate DESC OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY"
    );
  return result.recordset as DocumentRecord[];
}
