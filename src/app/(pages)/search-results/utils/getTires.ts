import { TiresData, TransformedTire } from '@/app/interfaces/tires';
import { createPaginatedResponse } from '@/app/utils/transformTireData';

interface PaginatedTiresResponse {
  tires: TransformedTire[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string; // Optional error message
}

/**
 * Fetches tires data from the API with pagination
 * @param page Current page number
 * @param pageSize Number of items per page
 * @returns Promise with paginated tires data
 */
export async function getTires(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedTiresResponse> {
  try {
    // Fetch data from the API
    // Ensure we have an absolute URL for server-side requests
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    console.log('logale, baseUrl:', baseUrl);

    const response = await fetch(`${baseUrl}/api/tires?page=${page}&pageSize=${pageSize}`, {
      cache: 'no-store', // Disable caching to always get fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tires: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const tiresData: TiresData[] = await response.json();

    // Use the shared utility function to create a paginated response
    return createPaginatedResponse(tiresData, page, pageSize);
  } catch (error) {
    // Only log the error, don't throw it
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching tires:', errorMessage);
    return createPaginatedResponse([], page, pageSize, errorMessage);
  }
}
