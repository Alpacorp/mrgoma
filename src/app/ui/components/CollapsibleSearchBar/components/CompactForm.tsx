'use client';

import React from 'react';

import { EditIcon, XMarkIcon } from '@/app/ui/components/Icons/Icons';

import { TireFilters } from '../hooks/useTireSearch';

import { TireSelector } from './TireSelector';

interface CompactFormProps {
  selectedFilters: TireFilters;
  onFilterChangeAction: (value: string, type: keyof TireFilters) => void;
  onResetFiltersAction: () => void;
  onCloseAction: () => void;
}

/**
 * CompactForm component for the tire search
 * Appears when the floating button is clicked
 */
export const CompactForm: React.FC<CompactFormProps> = ({
  selectedFilters,
  onFilterChangeAction,
  onResetFiltersAction,
  onCloseAction,
}) => {
  return (
    <div
      className="fixed bottom-20 left-4 z-50 sm:z-40 md:z-40 lg:z-40 xl:z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-80 max-w-[90vw]"
      style={{ position: 'fixed' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <EditIcon className="w-4 h-4 text-green-600" aria-hidden />
          Edit Tire Size
        </h3>
        <button
          onClick={onCloseAction}
          aria-label="Close"
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          <XMarkIcon className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <div className="space-y-2">
        {/* Tire size selector */}
        <TireSelector
          selectedFilters={selectedFilters}
          onFilterChangeAction={onFilterChangeAction}
        />

        {/* Reset button */}
        <button
          onClick={onResetFiltersAction}
          className="w-full flex items-center justify-center gap-1 text-gray-700 hover:text-gray-900 py-1 px-2 border border-gray-300 rounded-md transition-colors hover:bg-gray-50 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <span>Reset Selection</span>
        </button>
      </div>
    </div>
  );
};
