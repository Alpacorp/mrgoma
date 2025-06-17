import { useContext } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { useTireSize } from '@/app/hooks/useTireSize';
import { TireSize } from '@/app/ui/interfaces/tireSize';

type TirePosition = 'front' | 'rear';
type FilterPosition = 'all' | 'rear';

/**
 * Enhanced version of useTireSize that also updates the SelectedFiltersContext
 * @param position The position of the tire (front or rear)
 * @param initialSize Initial tire size
 * @returns Object containing tire size state and functions to update it
 */
export const useTireSizeWithContext = (
  position: TirePosition,
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
      [position]: {
        ...prev[position],
        [type]: value,
      },
    }));
  };

  const removeFilter = (type: keyof TireSize) => {
    baseRemoveFilter(type);
    setSelectedFilters(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        [type]: '',
      },
    }));
  };

  const updateTireSize = (newSize: TireSize) => {
    baseUpdateTireSize(newSize);
    setSelectedFilters(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        ...newSize,
      },
    }));
  };

  return {
    tireSize,
    updateTireSize,
    handleFilterChange,
    removeFilter,
    isComplete,
  };
};

/**
 * Utility function to handle filter changes for both front and rear tires
 * @param frontHandleFilterChange Function to handle filter changes for front tires
 * @param rearHandleFilterChange Function to handle filter changes for rear tires
 * @param value The value to set
 * @param type The type of filter (width, sidewall, diameter)
 * @param position The position (all for front, rear for rear)
 */
export const handleFilterAllChange = (
  frontHandleFilterChange: (value: string, type: keyof TireSize) => void,
  rearHandleFilterChange: (value: string, type: keyof TireSize) => void,
  value: string,
  type: keyof TireSize,
  position: FilterPosition
) => {
  if (position === 'all') {
    frontHandleFilterChange(value, type);
  } else {
    rearHandleFilterChange(value, type);
  }
};

/**
 * Utility function to remove filters for both front and rear tires
 * @param frontRemoveFilter Function to remove filter for front tires
 * @param rearRemoveFilter Function to remove filter for rear tires
 * @param type The type of filter to remove (width, sidewall, diameter)
 * @param position The position (all for front, rear for rear)
 */
export const removeFilterAll = (
  frontRemoveFilter: (type: keyof TireSize) => void,
  rearRemoveFilter: (type: keyof TireSize) => void,
  type: keyof TireSize,
  position: FilterPosition
) => {
  if (position === 'all') {
    frontRemoveFilter(type);
  } else {
    rearRemoveFilter(type);
  }
};
