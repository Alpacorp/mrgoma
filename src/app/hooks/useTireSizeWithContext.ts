import { useContext } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { useTireSize } from '@/app/hooks/useTireSize';
import { TireSize } from '@/app/ui/interfaces/tireSize';

/**
 * Enhanced version of useTireSize that also updates the SelectedFiltersContext
 * @param initialSize Initial tire size
 * @returns Object containing tire size state and functions to update it
 */
export const useTireSizeWithContext = (
  initialSize: TireSize = { width: '', sidewall: '', diameter: '' }
) => {
  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const {
    tireSize,
    updateTireSize: baseUpdateTireSize,
    handleFilterChange: baseHandleFilterChange,
    removeFilter: baseRemoveFilter,
    isComplete,
  } = useTireSize(initialSize);

  const handleFilterChange = (value: string, type: keyof TireSize) => {
    baseHandleFilterChange(value, type);
    setSelectedFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const removeFilter = (type: keyof TireSize) => {
    baseRemoveFilter(type);
    setSelectedFilters(prev => ({
      ...prev,
      [type]: '',
    }));
  };

  const updateTireSize = (newSize: TireSize) => {
    baseUpdateTireSize(newSize);
    setSelectedFilters({
      ...newSize,
    });
  };

  return {
    tireSize,
    updateTireSize,
    handleFilterChange,
    removeFilter,
    isComplete,
  };
};
