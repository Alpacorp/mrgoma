import { useState } from 'react';

import { TireSize } from '@/app/ui/interfaces/tireSize';

/**
 * Custom hook for managing tire sizes
 * @param initialSize Initial tire size
 * @returns Object containing tire size state and functions to update it
 */
export const useTireSize = (initialSize: TireSize = { width: '', sidewall: '', diameter: '' }) => {
  const [tireSize, setTireSize] = useState<TireSize>(initialSize);

  // Update tire size when props change
  const updateTireSize = (newSize: TireSize) => {
    setTireSize(newSize);
  };

  // Handle filter change
  const handleFilterChange = (value: string, type: keyof TireSize) => {
    setTireSize(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Remove filter
  const removeFilter = (type: keyof TireSize) => {
    setTireSize(prev => ({
      ...prev,
      [type]: '',
    }));
  };

  // Check if all fields are selected
  const isComplete = () => {
    return Boolean(tireSize.width && tireSize.sidewall && tireSize.diameter);
  };

  return {
    tireSize,
    updateTireSize,
    handleFilterChange,
    removeFilter,
    isComplete,
  };
};
