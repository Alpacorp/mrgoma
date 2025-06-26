'use client';

import { CarIcon as CarRear, Search, X } from 'lucide-react';
import React from 'react';

import { TireFilters } from '../hooks/useTireSearch';

import { TireSelector } from './TireSelector';

interface CompactFormProps {
  selectedFilters: TireFilters;
  hasRearTires: boolean;
  onFilterChangeAction: (value: string, type: keyof TireFilters) => void;
  onRemoveRearTiresAction: () => void;
  onAddRearTiresAction: () => void;
  onCloseAction: () => void;
}

/**
 * CompactForm component for the tire search
 * Appears when the floating button is clicked
 */
export const CompactForm: React.FC<CompactFormProps> = ({
  selectedFilters,
  hasRearTires,
  onFilterChangeAction,
  onRemoveRearTiresAction,
  onAddRearTiresAction,
  onCloseAction,
}) => {
  return (
    <div
      className="fixed bottom-20 left-4 z-50 sm:z-40 md:z-40 lg:z-40 xl:z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-80 max-w-[90vw]"
      style={{ position: 'fixed' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Search className="w-3 h-3 mr-1 text-green-600" />
          Edit Tire Sizes
        </h3>
        <button
          onClick={onCloseAction}
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Front tire selector */}
        <TireSelector
          isRear={false}
          selectedFilters={selectedFilters}
          onFilterChangeAction={onFilterChangeAction}
          isCompact={true}
        />

        {/* Rear tire selector or add a button */}
        {hasRearTires ? (
          <TireSelector
            isRear={true}
            selectedFilters={selectedFilters}
            onFilterChangeAction={onFilterChangeAction}
            onRemove={onRemoveRearTiresAction}
            isCompact={true}
          />
        ) : (
          <button
            onClick={onAddRearTiresAction}
            className="w-full flex items-center justify-center gap-1 text-green-600 hover:text-green-700 py-1 px-2 border border-green-600 rounded-md transition-colors hover:bg-green-50 text-xs"
          >
            <CarRear className="w-3 h-3" />
            <span>Add Rear Tire</span>
          </button>
        )}
      </div>
    </div>
  );
};
