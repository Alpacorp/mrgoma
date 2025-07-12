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
    // For server-side requests, we need an absolute URL
    // For client-side requests, we can use a relative URL
    const isServer = typeof window === 'undefined';

    // Use a relative URL for client-side requests
    const url = isServer
      ? `${process.env.API_URL || 'http://localhost:3000'}/api/tires?page=${page}&pageSize=${pageSize}`
      : `/api/tires?page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url, {
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
