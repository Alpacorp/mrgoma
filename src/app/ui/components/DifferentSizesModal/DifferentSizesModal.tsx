'use client';

import { useContext, useEffect } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { useTireSize } from '@/app/hooks/useTireSize';
import { TireSize } from '@/app/ui/interfaces/tireSize';
import { SizeSelectors } from '@/app/ui/sections';
import { diameterDataMock, sidewallDataMock, widthDataMock } from '@/app/utils/tireSizeMockData';

interface DifferentSizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontTires?: TireSize;
  rearTires?: TireSize;
  onSearch: () => void;
}

const DifferentSizesModal = ({
  isOpen,
  onClose,
  frontTires = { width: '', sidewall: '', diameter: '' },
  rearTires = { width: '', sidewall: '', diameter: '' },
  onSearch,
}: DifferentSizesModalProps) => {
  const { setSelectedFilters } = useContext(SelectedFiltersContext);

  const {
    tireSize: frontTireSize,
    updateTireSize: updateFrontTireSize,
    handleFilterChange: handleFrontTireChange,
    removeFilter: removeFrontTireFilter,
    isComplete: isFrontComplete,
  } = useTireSize(frontTires);

  const {
    tireSize: rearTireSize,
    handleFilterChange: handleRearTireChange,
    removeFilter: removeRearTireFilter,
    isComplete: isRearComplete,
  } = useTireSize(rearTires);

  // Update local state when props change
  useEffect(() => {
    if (isOpen) {
      updateFrontTireSize(frontTires);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Adapter functions to match the expected interface
  const handleFilterChange = (value: string, type: keyof TireSize, position: 'all' | 'rear') => {
    if (position === 'all') {
      handleFrontTireChange(value, type);
      // Update selected filters context for the front tire
      setSelectedFilters(prev => ({
        ...prev,
        front: {
          ...prev.front,
          [type]: value,
        },
      }));
    } else {
      handleRearTireChange(value, type);
      // Update selected filters context for the rear tire
      setSelectedFilters(prev => ({
        ...prev,
        rear: {
          ...prev.rear,
          [type]: value,
        },
      }));
    }
  };

  const removeFilter = (type: keyof TireSize, position: 'all' | 'rear') => {
    if (position === 'all') {
      removeFrontTireFilter(type);
      // Update selected filters context for the front tire
      setSelectedFilters(prev => ({
        ...prev,
        front: {
          ...prev.front,
          [type]: '',
        },
      }));
    } else {
      removeRearTireFilter(type);
      // Update selected filters context for the rear tire
      setSelectedFilters(prev => ({
        ...prev,
        rear: {
          ...prev.rear,
          [type]: '',
        },
      }));
    }
  };

  const handleSearch = () => {
    // We need to update the parent component's state with the selected tire sizes
    // before calling onSearch, so we'll add an onSave prop to pass the data back

    // Call the onSearch callback if provided
    if (onSearch) {
      // Pass the selected tire sizes back to the parent component
      // This will update the rearTireSize in the SearchBySize component
      // before calling handleSearch
      onSearch();
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset local tire sizes to initial values
    onClose();
  };

  const isValid = () => {
    // validate isRearComplete and isFrontComplete
    return isFrontComplete() && isRearComplete();
  };

  const renderSizeSelectors = (position: 'all' | 'rear') => {
    const currentSize = position === 'all' ? frontTireSize : rearTireSize;

    return (
      <SizeSelectors
        currentSize={currentSize}
        position={position}
        width={widthDataMock}
        sidewall={sidewallDataMock}
        diameter={diameterDataMock}
        handleFilterChange={handleFilterChange}
        removeFilter={removeFilter}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-40 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
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

          {/* Content */}
          <div className="px-6 py-6 space-y-8">
            {/* Front Tires Section */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <h4 className="text-lg font-medium text-gray-900">Front Tires</h4>
              </div>
              {renderSizeSelectors('all')}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">and</span>
              </div>
            </div>

            {/* Rear Tires Section */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                <h4 className="text-lg font-medium text-gray-900">Rear Tires</h4>
              </div>
              {renderSizeSelectors('rear')}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              disabled={!isValid()}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                isValid()
                  ? 'bg-[#9dfb40] text-gray-900 hover:bg-[#7bc42d]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifferentSizesModal;
