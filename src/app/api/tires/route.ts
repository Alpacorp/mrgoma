import { NextRequest, NextResponse } from 'next/server';

import { getPool } from '@/connection/db';
import { logger } from '@/utils/logger';

export type DocumentRecord = {
  id: number;
  TireId: string;
  Code: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '10';

  const pageInt = parseInt(page, 10);
  const pageSizeInt = parseInt(pageSize, 10);

  const offset = (pageInt - 1) * pageSizeInt;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT * FROM dbo.View_Tires WHERE Local = '0' AND Trash = 'false' AND RemainingLife > '70%' ORDER BY ModificationDate DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSizeInt} ROWS ONLY`
      );

    const records: DocumentRecord[] = result.recordset;
    return NextResponse.json(records);
  } catch (err: any) {
    logger.error('Failed to fetch tires', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
