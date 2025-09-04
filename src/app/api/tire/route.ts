import { NextRequest, NextResponse } from 'next/server';

import { fetchTireById } from '@/repositories/tiresRepository';

export async function GET(req: NextRequest) {
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

    // Build images array from available image URLs
    const images = [record.Image1, record.Image2, record.Image3, record.Image4]
      .filter(Boolean)
      .map((src, idx) => ({
        id: idx + 1,
        name: `Image ${idx + 1}`,
        src: src as string,
        alt: `${record.Brand || 'Brand'} ${record.Model2 || ''} ${record.RealSize || ''}`.trim(),
      }));

    if (images.length === 0) {
      images.push({
        id: 1,
        name: 'Image 1',
        src: '/assets/images/generic-tire-image.webp',
        alt: `${record.Brand || 'Brand'} ${record.Model2 || ''} ${record.RealSize || ''}`.trim(),
      });
    }

    // Map DB record to SingleTire shape expected by UI
    const singleTire = {
      id: String(record.TireId ?? ''),
      status: record.Condition,
      name: `(${record.Code || ''}) | ${record.Brand || 'Unknown'} | ${record.RealSize || ''}`.trim(),
      color: 'Black',
      dot: record.DOT || 'N/A',
      price: record.Price?.toString() || '-',
      brand: record.Brand || 'Unknown',
      brandId: record.BrandId || 1,
      condition: record.ProductTypeId === 1 ? 'New' : 'Used',
      patched: record.Patched === '0' ? 'No' : 'Yes',
      remainingLife: (record.RemainingLife as string) || '-',
      treadDepth: (record.Tread as string) || '-',
      images,
      description: (record.Description as string) || undefined,
      model2: (record.Model2 as string) || undefined,
      details: [
        {
          name: 'More Details',
          items: [
            `Load Index: ${(record.loadIndex as string) || '-'}`,
            `DOT: ${record.DOT || ''}`,
            `Speed Index: ${record.speedIndex || ''}`,
          ],
        },
      ],
    };

    return NextResponse.json(singleTire);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
