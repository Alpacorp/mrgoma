import { NextRequest, NextResponse } from 'next/server';

import { poolPromise } from '@/connection/db';

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
    const pool = await poolPromise;
    const result = await pool
      .request()
      // .query(
      //   `SELECT * FROM dbo.View_Tires ORDER BY TireId DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSizeInt} ROWS ONLY`
      // );
      // .query(`SELECT * FROM dbo.View_Tires WHERE Code = '569927'`);
      .query(
        `SELECT * FROM dbo.View_Tires WHERE Local = '0' AND Trash = 'false' AND RemainingLife > '70%' ORDER BY TireId OFFSET ${offset} ROWS FETCH NEXT ${pageSizeInt} ROWS ONLY`
      );

    const records: DocumentRecord[] = result.recordset;
    return NextResponse.json(records);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
