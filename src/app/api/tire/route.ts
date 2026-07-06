import { NextRequest, NextResponse } from 'next/server';

import { withLogging } from '@/app/api/_lib/withLogging';
import { mapTireRecordToSingleTire } from '@/repositories/mapTireRecordToSingleTire';
import { fetchTireById } from '@/repositories/tiresRepository';

export const GET = withLogging('tire.GET', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ message: 'Missing productId parameter' }, { status: 400 });
  }

  try {
    const record = await fetchTireById(productId);

    if (!record) {
      return NextResponse.json({ message: 'Tire not found' }, { status: 404 });
    }

    // Shared mapper — same shape the server page render uses, so they never drift.
    return NextResponse.json(mapTireRecordToSingleTire(record));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
});
