'use client';

import { CarFront } from 'lucide-react';
import React from 'react';

import { tireDiameterOptions, tireSidewallOptions, tireWidthOptions } from '../data/tireOptions';
import { TireFilters } from '../hooks/useTireSearch';

import { SelectDropdownAdapter } from './SelectDropdownAdapter';

interface TireSelectorProps {
  selectedFilters: TireFilters;
  onFilterChangeAction: (value: string, type: keyof TireFilters) => void;
  isCompact?: boolean;
}

/**
 * TireSelector component for selecting tire dimensions
 */
export const TireSelector: React.FC<TireSelectorProps> = ({
  selectedFilters,
  onFilterChangeAction,
  isCompact = false,
}) => {
  // Field configurations for the dropdowns
  const fields = [
    {
      label: isCompact ? 'W' : 'Width',
      options: tireWidthOptions,
      type: 'w' as keyof TireFilters,
      disabled: false,
    },
    {
      label: isCompact ? 'S' : 'Sidewall',
      options: tireSidewallOptions,
      type: 's' as keyof TireFilters,
      disabled: false,
    },
    {
      label: isCompact ? 'D' : 'Diameter',
      options: tireDiameterOptions,
      type: 'd' as keyof TireFilters,
      disabled: false,
    },
  ];

  return (
    <div
      className={`${isCompact ? 'bg-green-200' : 'bg-gray-50'} p-2 rounded-lg border border-gray-200`}
    >
      <div className="flex items-center mb-1">
        <div className="bg-gray-100 p-0.5 rounded-full">
          <CarFront className="w-3 h-3 text-green-600" />
        </div>
        <h4 className="ml-1 text-xs font-medium text-gray-700">Tire Size</h4>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {fields.map(field => (
          <div key={field.type} className="my-1">
            <label className="block my-1 text-xs font-medium text-gray-700">{field.label}</label>
            <SelectDropdownAdapter
              label={field.label}
              options={field.options}
              type={field.type}
              selectedFilters={selectedFilters}
              onFilterChangeAction={onFilterChangeAction}
              isCollapsed={isCompact}
              showDefaultText={!isCompact}
              disabled={field.disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
