import { Int } from 'mssql';

import { getPool } from '@/connection/db';

export type DocumentRecord = {
  id: number;
  TireId: string;
  Code: string;
};

export async function fetchTires(offset: number, pageSize: number): Promise<DocumentRecord[]> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('offset', Int, offset)
    .input('pageSize', Int, pageSize)
    .query(
      "SELECT * FROM dbo.View_Tires WHERE Local = '0' AND Trash = 'false' AND RemainingLife > '70%' ORDER BY ModificationDate DESC OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY"
    );
  return result.recordset as DocumentRecord[];
}
