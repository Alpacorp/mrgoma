'use client';

import { useEffect } from 'react';

import {
  handleFilterAllChange as handleFilterAllChangeUtil,
  removeFilterAll,
  useTireSizeWithContext,
} from '@/app/hooks/useTireSizeWithContext';
import { ButtonSearch } from '@/app/ui/components';
import { TireSize } from '@/app/ui/interfaces/tireSize';
import { SizeSelectors } from '@/app/ui/sections';
import { diameterDataMock, sidewallDataMock, widthDataMock } from '@/app/utils/tireSizeMockData';

interface DifferentSizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  frontTires: { width: string; sidewall: string; diameter: string };
}

const frontTiresDefault = { width: '', sidewall: '', diameter: '' };
const rearTiresDefault = { width: '', sidewall: '', diameter: '' };

const DifferentSizesModal = ({
  isOpen,
  onClose,
  onSearch,
  frontTires,
}: DifferentSizesModalProps) => {
  const {
    tireSize: frontTireSize,
    updateTireSize: updateFrontTireSize,
    handleFilterChange: handleFrontTireChange,
    removeFilter: removeFrontTireFilter,
    isComplete: isFrontComplete,
  } = useTireSizeWithContext('front', frontTiresDefault);

  const {
    tireSize: rearTireSize,
    handleFilterChange: handleRearTireChange,
    removeFilter: removeRearTireFilter,
    isComplete: isRearComplete,
  } = useTireSizeWithContext('rear', rearTiresDefault);

  useEffect(() => {
    if (isOpen) {
      updateFrontTireSize(frontTires);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleFilterAllChange = (value: string, type: keyof TireSize, position: 'all' | 'rear') => {
    handleFilterAllChangeUtil(handleFrontTireChange, handleRearTireChange, value, type, position);
  };

  const removeFilter = (type: keyof TireSize, position: 'all' | 'rear') => {
    removeFilterAll(removeFrontTireFilter, removeRearTireFilter, type, position);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const canSearch = isFrontComplete() && isRearComplete();

  const renderSizeSelectors = (position: 'all' | 'rear') => {
    const currentSize = position === 'all' ? frontTireSize : rearTireSize;

    return (
      <SizeSelectors
        currentSize={currentSize}
        position={position}
        width={widthDataMock}
        sidewall={sidewallDataMock}
        diameter={diameterDataMock}
        handleFilterChange={handleFilterAllChange}
        removeFilter={removeFilter}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-40 transition-opacity"
        onClick={handleCancel}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Select Different Tire Sizes</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Configure different sizes for front and rear tires
            </p>
          </div>
          <div className="px-6 py-3 space-y-1">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <h4 className="text-lg font-medium text-gray-900">Front Tires</h4>
              </div>
              {renderSizeSelectors('all')}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">and</span>
              </div>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <h4 className="text-lg font-medium text-gray-900">Rear Tires</h4>
              </div>
              {renderSizeSelectors('rear')}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <ButtonSearch onClick={handleSearch} disabled={canSearch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifferentSizesModal;
