/**
 * Pagination utilities
 */

// Constants for pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
export const VALID_PAGE_SIZES = [5, 10, 15, 20, 25, 50, 100];
export const MAX_PAGE_SIZE = 100; // Absolute maximum limit

/**
 * Validates and sanitizes the page size
 * @param pageSize - The requested page size
 * @returns The validated page size
 */
export function validatePageSize(pageSize: number): number {
  // If the value is in the array of valid values, use it
  if (VALID_PAGE_SIZES.includes(pageSize)) {
    return pageSize;
  }

  // If the value is out of range, limit it to the closest value
  if (pageSize < VALID_PAGE_SIZES[0]) {
    return VALID_PAGE_SIZES[0]; // Minimum
  }

  if (pageSize > MAX_PAGE_SIZE) {
    return MAX_PAGE_SIZE; // Absolute maximum
  }

  // Find the closest valid value
  return VALID_PAGE_SIZES.reduce((prev, curr) =>
    Math.abs(curr - pageSize) < Math.abs(prev - pageSize) ? curr : prev
  );
}

/**
 * Filter valid page sizes based on the total number of records
 * @param totalCount - Total number of records
 * @returns Array of valid page sizes
 */
export function getAvailablePageSizes(totalCount: number): number[] {
  return VALID_PAGE_SIZES.filter(size => size <= Math.min(totalCount, MAX_PAGE_SIZE));
}
