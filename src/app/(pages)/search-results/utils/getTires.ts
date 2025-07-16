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

// Cache for storing previous API responses
const responseCache = new Map<string, { data: PaginatedTiresResponse; timestamp: number }>();
const CACHE_TTL = 60000; // Cache time-to-live in milliseconds (1 minute)

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
    // Create a cache key based on the request parameters
    const cacheKey = `tires-${page}-${pageSize}`;

    // Check if we have a cached response that's still valid
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      return cachedResponse.data;
    }

    // Fetch data from the API
    // For server-side requests, we need an absolute URL
    // For client-side requests, we can use a relative URL
    const isServer = typeof window === 'undefined';

    // Use a relative URL for client-side requests
    const url = isServer
      ? `${process.env.API_URL || 'http://localhost:3000'}/api/tires?page=${page}&pageSize=${pageSize}`
      : `/api/tires?page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url, {
      // Use next.js built-in caching instead of completely disabling cache
      cache: isServer ? 'force-cache' : 'default',
      next: { revalidate: 60 }, // Revalidate the data once every 60 seconds
    });

    // Manejar respuestas no exitosas sin lanzar una excepción que se capturará inmediatamente
    if (!response.ok) {
      const errorMessage = `Failed to fetch tires: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      return createPaginatedResponse([], page, pageSize, errorMessage);
    }

    // Parse the response
    const tiresData: TiresData[] = await response.json();

    // Use the shared utility function to create a paginated response
    const result = createPaginatedResponse(tiresData, page, pageSize);

    // Cache the response
    responseCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    // Only log the error, don't throw it
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching tires:', errorMessage);
    return createPaginatedResponse([], page, pageSize, errorMessage);
  }
}
