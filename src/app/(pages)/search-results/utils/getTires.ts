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

// Cache para almacenar respuestas de API
// Este cache en memoria es efectivo para desarrollo local
const responseCache = new Map<string, { data: PaginatedTiresResponse; timestamp: number }>();
const CACHE_TTL = 60000; // Cache time-to-live in milliseconds (1 minute)

/**
 * Gestiona el caché del lado del cliente usando localStorage
 * Esta solución funciona bien en entornos serverless como Vercel
 */
const clientCache = {
  get: (key: string) => {
    try {
      // Verificar si estamos en el cliente
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(`tires-cache-${key}`);
        if (item) {
          const parsed = JSON.parse(item);
          // Verificar si el caché ha expirado
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            return parsed.data;
          }
          // Caché expirado, eliminar
          localStorage.removeItem(`tires-cache-${key}`);
        }
      }
      return null;
    } catch (e) {
      console.error('Error accessing client cache:', e);
      return null;
    }
  },
  set: (key: string, data: PaginatedTiresResponse) => {
    try {
      // Verificar si estamos en el cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `tires-cache-${key}`,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      }
    } catch (e) {
      console.error('Error setting client cache:', e);
    }
  }
};

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
    const isServer = typeof window === 'undefined';

    // Si estamos en el servidor, usar el caché en memoria
    if (isServer) {
      const cachedResponse = responseCache.get(cacheKey);
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
        return cachedResponse.data;
      }
    } 
    // Si estamos en el cliente, intentar usar el caché del cliente
    else {
      const clientCachedData = clientCache.get(cacheKey);
      if (clientCachedData) {
        return clientCachedData;
      }
    }

    // Fetch data from the API
    // For server-side requests, we need an absolute URL
    // For client-side requests, we can use a relative URL
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

    // Cache the response basado en el entorno
    if (isServer) {
      responseCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
    } else {
      clientCache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    // Only log the error, don't throw it
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching tires:', errorMessage);
    return createPaginatedResponse([], page, pageSize, errorMessage);
  }
}
