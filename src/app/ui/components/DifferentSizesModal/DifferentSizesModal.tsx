'use client';

import { useState } from 'react';

import { TireSize } from '@/app/ui/interfaces/tireSize';

interface DifferentSizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontTires?: TireSize;
  rearTires?: TireSize;
  onSave?: (frontTires: TireSize, rearTires: TireSize) => void;
}

const DifferentSizesModal = ({
  isOpen,
  onClose,
  frontTires = { width: '', sidewall: '', diameter: '' },
  rearTires = { width: '', sidewall: '', diameter: '' },
  // onSave,
}: DifferentSizesModalProps) => {
  const [localFrontTires, setLocalFrontTires] = useState<TireSize>(frontTires);
  const [localRearTires, setLocalRearTires] = useState<TireSize>(rearTires);

  const handleSave = () => {
    // onSave(localFrontTires, localRearTires);
    onClose();
  };

  const handleCancel = () => {
    setLocalFrontTires(frontTires);
    setLocalRearTires(rearTires);
    onClose();
  };

  const isValid = () => {
    const frontComplete =
      localFrontTires.width && localFrontTires.sidewall && localFrontTires.diameter;
    const rearComplete = localRearTires.width && localRearTires.sidewall && localRearTires.diameter;
    return frontComplete && rearComplete;
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
              {/*<SizeSelectors*/}
              {/*  value={localFrontTires as TireSize}*/}
              {/*  onChange={setLocalFrontTires}*/}
              {/*  className="bg-blue-50 p-4 rounded-lg"*/}
              {/*/>*/}
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
              {/*<SizeSelectors*/}
              {/*  values={localRearTires}*/}
              {/*  onChange={setLocalRearTires}*/}
              {/*  className="bg-red-50 p-4 rounded-lg"*/}
              {/*/>*/}
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
              onClick={handleSave}
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
