'use client';

import React from 'react';

import { SelectDropdown } from '@/app/ui/components';

import { FilterOption } from '../data/tireOptions';
import { TireFilters } from '../hooks/useTireSearch';

interface SelectDropdownAdapterProps {
  label: string;
  options: FilterOption[];
  type: keyof TireFilters;
  selectedFilters: TireFilters;
  onFilterChangeAction: (value: string, type: keyof TireFilters) => void;
  isCollapsed?: boolean;
  showDefaultText?: boolean;
  disabled?: boolean;
}

/**
 * Adapter component for SelectDropdown
 * Converts between the TireFilters format and the format expected by SelectDropdown
 */
export const SelectDropdownAdapter: React.FC<SelectDropdownAdapterProps> = ({
  label,
  options,
  type,
  selectedFilters,
  onFilterChangeAction,
  isCollapsed = false,
  showDefaultText = true,
  disabled = false,
}) => {
  // Map our tire filter types to the types expected by SelectDropdown
  const mapTypeToSelectDropdownType = (
    type: keyof TireFilters
  ): 'width' | 'sidewall' | 'diameter' => {
    if (type === 'w' || type === 'rw') return 'width';
    if (type === 's' || type === 'rs') return 'sidewall';
    return 'diameter';
  };

  // Create an adapter for the selectedFilters object
  const adaptedSelectedFilters = {
    width: type === 'w' ? selectedFilters.w : type === 'rw' ? selectedFilters.rw : '',
    sidewall: type === 's' ? selectedFilters.s : type === 'rs' ? selectedFilters.rs : '',
    diameter: type === 'd' ? selectedFilters.d : type === 'rd' ? selectedFilters.rd : '',
  };

  // Create an adapter for the handleFilterChange function
  const adaptedHandleFilterChange = (
    value: string,
    dropdownType: 'width' | 'sidewall' | 'diameter',
    position?: 'all' | 'rear'
  ) => {
    onFilterChangeAction(value, type);
  };

  // Create the field object expected by SelectDropdown
  const field = {
    type: mapTypeToSelectDropdownType(type),
    label,
    options,
  };

  return (
    <SelectDropdown
      field={field}
      selectedFilters={adaptedSelectedFilters}
      handleFilterChange={adaptedHandleFilterChange}
      position={type.startsWith('r') ? 'rear' : 'all'}
      isCollapsed={isCollapsed}
      showDefaultText={showDefaultText}
      disabled={disabled}
    />
  );
};
