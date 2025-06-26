'use client';

import { CarFront, CarIcon as CarRear, X } from 'lucide-react';
import React from 'react';

import { tireDiameterOptions, tireSidewallOptions, tireWidthOptions } from '../data/tireOptions';
import { TireFilters } from '../hooks/useTireSearch';

import { SelectDropdownAdapter } from './SelectDropdownAdapter';

interface TireSelectorProps {
  isRear: boolean;
  selectedFilters: TireFilters;
  onFilterChangeAction: (value: string, type: keyof TireFilters) => void;
  onRemove?: () => void;
  isCompact?: boolean;
}

/**
 * TireSelector component for selecting tire dimensions
 * Can be used for both front and rear tires
 */
export const TireSelector: React.FC<TireSelectorProps> = ({
  isRear,
  selectedFilters,
  onFilterChangeAction,
  onRemove,
  isCompact = false,
}) => {
  // Determine prefix for parameter names based on tire position
  const prefix = isRear ? 'r' : '';
  const tirePosition = isRear ? 'Rear Tire' : 'Front Tire';

  // Icon based on tire position
  const TireIcon = isRear ? CarRear : CarFront;

  // Field configurations for the dropdowns
  const fields = [
    {
      label: isCompact ? 'W' : 'Width',
      options: tireWidthOptions,
      type: `${prefix}w` as keyof TireFilters,
      // Width is always enabled
      disabled: false,
    },
    {
      label: isCompact ? 'S' : 'Sidewall',
      options: tireSidewallOptions,
      type: `${prefix}s` as keyof TireFilters,
      // For rear tires, Sidewall is disabled if Width is not selected
      disabled: isRear && !selectedFilters.rw,
    },
    {
      label: isCompact ? 'D' : 'Diameter',
      options: tireDiameterOptions,
      type: `${prefix}d` as keyof TireFilters,
      // For rear tires, Diameter is disabled if Width or Sidewall is not selected
      disabled: isRear && (!selectedFilters.rw || !selectedFilters.rs),
    },
  ];

  return (
    <div
      className={`${isCompact ? 'bg-green-200' : 'bg-gray-50'} p-2 rounded-lg border border-gray-200`}
    >
      <div className="flex items-center mb-1">
        <div className="bg-gray-100 p-0.5 rounded-full">
          <TireIcon className="w-3 h-3 text-green-600" />
        </div>
        <h4 className="ml-1 text-xs font-medium text-gray-700">{tirePosition}</h4>

        {/* Remove the button for rear tires */}
        {isRear && onRemove && (
          <button
            onClick={onRemove}
            className="ml-auto p-0.5 hover:bg-gray-200 rounded-full transition-colors text-red-500 cursor-pointer"
            aria-label="Remove rear tire selection"
            title="Remove rear tire selection"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Sequential selection instruction for rear tires */}
      {isRear && (
        <div className="text-xs text-gray-500 mb-1 italic">
          Please select in order: Width → Sidewall → Diameter
        </div>
      )}

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
