'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

// Define types for the tire filters
export interface TireFilters {
  w: string;
  s: string;
  d: string;
  rw: string;
  rs: string;
  rd: string;
}

/**
 * Custom hook to manage tire search functionality
 * Handles URL parameters and tire selection state
 */
export const useTireSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [selectedFilters, setSelectedFilters] = useState<TireFilters>({
    w: searchParams.get('w') || '',
    s: searchParams.get('s') || '',
    d: searchParams.get('d') || '',
    rw: searchParams.get('rw') || '',
    rs: searchParams.get('rs') || '',
    rd: searchParams.get('rd') || '',
  });

  // Check if rear tires are selected
  const hasRearTires = searchParams.has('rw');

  /**
   * Update a single filter value and update the URL
   */
  const handleFilterChange = useCallback((value: string, type: keyof TireFilters) => {
    const newFilters = {
      ...selectedFilters,
      [type]: value,
    };
    setSelectedFilters(newFilters);

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/search-results?${params.toString()}`);
  }, [selectedFilters, searchParams, router]);

  /**
   * Remove rear tire parameters from the URL
   */
  const removeRearTires = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('rw');
    params.delete('rs');
    params.delete('rd');

    setSelectedFilters(prev => ({
      ...prev,
      rw: '',
      rs: '',
      rd: '',
    }));

    router.push(`/search-results?${params.toString()}`);
  }, [searchParams, router]);

  /**
   * Add empty rear tire parameters to the URL
   */
  const addRearTires = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('rw', '');
    params.set('rs', '');
    params.set('rd', '');

    setSelectedFilters(prev => ({
      ...prev,
      rw: '',
      rs: '',
      rd: '',
    }));

    router.push(`/search-results?${params.toString()}`);
  }, [searchParams, router]);

  return {
    selectedFilters,
    hasRearTires,
    handleFilterChange,
    removeRearTires,
    addRearTires,
  };
};
