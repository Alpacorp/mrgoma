import type { SingleTire } from '@/app/interfaces/tires';
import { storeCity } from '@/app/utils/storeCity';
import { brandName, modelName } from '@/app/utils/tireNaming';
import type { DocumentRecord } from '@/repositories/tiresRepository';

/**
 * Single source of truth mapping a DB tire record to the `SingleTire` shape the
 * UI consumes. Used by BOTH the server page fetch (`tires/[slug]/page.tsx`) and
 * the `/api/tire` route handler (checkout re-validation), so the two never drift.
 */
export function mapTireRecordToSingleTire(record: DocumentRecord): SingleTire {
  /**
   * Alt text is read aloud and indexed by Google Images, so the brand is written
   * for a reader rather than as the catalog stores it.
   *
   * This also reaches two `data-track-label` attributes — the tire card and the
   * image zoom — so those event labels change spelling from 2026-08-24. Kept
   * rather than worked around: the label is free text with one value per tire,
   * nothing aggregates on it, and an event that reads back what the person
   * actually saw is the more useful record. What stays untouched is `brand` and
   * `name` on the tire itself, which the cart and checkout re-validation match on.
   */
  const alt =
    `${brandName(record.Brand) || 'Brand'} ${modelName(record.Model2)} ${record.RealSize || ''}`.trim();

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
    // The stock code as its own field, not only folded into `name`. It is what
    // staff search by, so anything quoting a tire back to them needs it whole.
    code: record.Code || undefined,
    status: record.Condition,
    name: `(${record.Code || ''}) | ${record.Brand || 'Unknown'} | ${record.RealSize || ''}`.trim(),
    color: 'Black',
    dot: record.DOT || 'N/A',
    price: record.Price?.toString() || '-',
    brand: record.Brand || 'Unknown',
    brandId: record.BrandId || 1,
    condition: record.ProductTypeId === 1 ? 'New' : 'Used',
    patched: record.Patched === '0' ? 'No' : 'Yes',
    // The city, never `VaultName`. The internal warehouse name is deliberately
    // kept off every public surface; what a buyer needs is where the tire is.
    city: storeCity(record.VaultName),
    remainingLife: record.RemainingLife || '-',
    treadDepth: record.Tread || '-',
    size: record.RealSize || undefined,
    loadIndex: record.loadIndex || undefined,
    speedIndex: record.speedIndex || undefined,
    model2: record.Model2 || undefined,
    runFlat: record.KindSaleId === 1 ? 'Yes' : record.KindSale || 'No',
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
