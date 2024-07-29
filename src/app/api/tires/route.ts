import { poolPromise } from '@/connection/db';
import { NextRequest, NextResponse } from 'next/server';

export type DocumentRecord = {
  id: number;
  TireId: string;
  Code: string;
  // Añade más campos según la estructura de tu tabla
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '10';

  // Convertir a enteros
  const pageInt = parseInt(page, 10);
  const pageSizeInt = parseInt(pageSize, 10);

  // Calcular el desplazamiento
  const offset = (pageInt - 1) * pageSizeInt;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT * FROM dbo.Tires ORDER BY TireId OFFSET ${offset} ROWS FETCH NEXT ${pageSizeInt} ROWS ONLY`
      );

    const records: DocumentRecord[] = result.recordset;
    return NextResponse.json(records);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
