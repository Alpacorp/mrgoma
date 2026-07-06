import type { SingleTire } from '@/app/interfaces/tires';
import type { DocumentRecord } from '@/repositories/tiresRepository';

/**
 * Single source of truth mapping a DB tire record to the `SingleTire` shape the
 * UI consumes. Used by BOTH the server page fetch (`tires/[slug]/page.tsx`) and
 * the `/api/tire` route handler (checkout re-validation), so the two never drift.
 */
export function mapTireRecordToSingleTire(record: DocumentRecord): SingleTire {
  const alt =
    `${record.Brand || 'Brand'} ${record.Model2 || ''} ${record.RealSize || ''}`.trim();

  const images = [record.Image1, record.Image2, record.Image3, record.Image4]
    .filter(Boolean)
    .map((src, idx) => ({
      id: idx + 1,
      name: `Image ${idx + 1}`,
      src: src as string,
      alt,
    }));

  if (images.length === 0) {
    images.push({
      id: 1,
      name: 'Image 1',
      src: '/assets/images/generic-tire-image.webp',
      alt,
    });
  }

  return {
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
    remainingLife: record.RemainingLife || '-',
    treadDepth: record.Tread || '-',
    size: record.RealSize || undefined,
    loadIndex: record.loadIndex || undefined,
    speedIndex: record.speedIndex || undefined,
    model2: record.Model2 || undefined,
    runFlat: record.KindSaleId === 1 ? 'Yes' : record.KindSale || 'No',
    description: record.Description || undefined,
    images,
    details: [
      {
        name: 'More Details',
        items: [
          `Load Index: ${record.loadIndex || '-'}`,
          `DOT: ${record.DOT || ''}`,
          `Speed Index: ${record.speedIndex || ''}`,
        ],
      },
    ],
  };
}
