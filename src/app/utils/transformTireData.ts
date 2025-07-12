import { TiresData } from '@/app/interfaces/tires';

/**
 * Transforms raw tire data from the API into a format suitable for the UI
 * @param tire The raw tire data from the API
 * @returns Transformed tire data ready for UI rendering
 */
export function transformTireData(tire: TiresData) {
  return {
    id: tire.TireId,
    name: `${tire.Brand || 'Unknown'} ${tire.Model2 || ''} ${tire.RealSize || ''}`,
    color: 'Black',
    href: '#',
    imageSrc: tire.Image1 || 'https://www.usedtires.online/LOTS/PEM/LOTP1346WH/images/DSC0554.JPG',
    imageAlt: `Tire ${tire.TireId}`,
    price: tire.Price?.toString() || '140',
    brand: tire.Brand || 'Unknown',
    brandId: tire.BrandId || 1,
    condition: tire.ProductTypeId === 1 ? 'New' : 'Used',
    features: [
      {
        name: 'Patched',
        value: tire.Patched === '0' ? 'No' : 'Yes',
        icon: null,
      },
      {
        name: 'Remaining life',
        value: tire.RemainingLife || '90%',
        icon: null,
      },
      {
        name: 'Tread depth',
        value: tire.Tread || '10.0/32',
        icon: null,
      },
      {
        name: 'Run Flat',
        value: 'No',
        icon: null,
      },
    ],
  };
}

/**
 * Creates a paginated response with transformed tire data
 * @param tiresData Raw tire data from the API
 * @param page Current page number
 * @param pageSize Number of items per page
 * @param error Optional error message
 * @returns Paginated response with transformed tire data
 */
export function createPaginatedResponse(
  tiresData: TiresData[],
  page: number,
  pageSize: number,
  error?: string
) {
  // For now, we'll assume a fixed total count
  // In a real implementation, this would come from the API
  const totalCount = 500;
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
