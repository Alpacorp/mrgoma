import { TiresData } from '@/app/interfaces/tires';

/**
 * Transforms raw tire data from the API into a format suitable for the UI
 * @param tire The raw tire data from the API
 * @returns Transformed tire data ready for UI rendering
 */
export function transformTireData(tire: TiresData) {
  return {
    id: tire.TireId,
    name: `(${tire.Code || ''}) | ${tire.Brand || 'Unknown'} | ${tire.Model2 || ''} | ${tire.RealSize || ''}`.trim(),
    color: 'Black',
    href: '#',
    imageSrc:
      tire.Image1 ||
      tire.Image2 ||
      tire.Image3 ||
      tire.Image4 ||
      '/assets/images/generic-tire-image.webp',
    imageAlt: `Tire ${tire.Code}`,
    price: tire.Price?.toString() || '-',
    brand: tire.Brand || 'Unknown',
    brandId: tire.BrandId || 1,
    condition: tire.ProductTypeId === 1 ? 'New' : 'Used',
    features: [
      {
        name: 'Patched',
        value: tire.Patched === '0' ? 'No' : 'Yes',
      },
      {
        name: 'Remaining life',
        value: tire.RemainingLife || '-',
      },
      {
        name: 'Tread depth',
        value: tire.Tread || '-',
      },
      {
        name: 'Run Flat',
        value: tire.KindSaleId === 1 ? 'Yes' : 'No',
      },
    ],
  };
}

/**
 * Creates a paginated response with transformed tire data
 * @param tiresData Raw tire data from the API
 * @param page Current page number
 * @param pageSize Number of items per page
 * @param totalCount Total number of items across all pages
 * @param error Optional error message
 * @returns Paginated response with transformed tire data
 */
export function createPaginatedResponse(
  tiresData: TiresData[],
  page: number,
  pageSize: number,
  totalCount: number,
  error?: string
) {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Transform the data to match the expected UI structure
  const transformedTires = tiresData.map(transformTireData);

  return {
    tires: transformedTires,
    totalCount,
    page,
    pageSize,
    totalPages,
    ...(error && { error }),
  };
}
