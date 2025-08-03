import { FC } from 'react';

import { SelectDropdown, SizeSelector } from '@/app/ui/components';
import { TireSize } from '@/app/ui/interfaces/tireSize';

interface SizeSelectorsProps {
  width: { id: number; name: number }[];
  sidewall: { id: number; name: number }[];
  diameter: { id: number; name: number }[];
  currentSize: { width: string; sidewall: string; diameter: string };
  handleFilterChange: (value: string, type: keyof TireSize) => void;
  removeFilter: (type: keyof TireSize) => void;
  isLoadingWidth?: boolean;
  isLoadingSidewall?: boolean;
  isLoadingDiameter?: boolean;
}

const SizeSelectors: FC<SizeSelectorsProps> = ({
  width,
  sidewall,
  diameter,
  currentSize,
  handleFilterChange,
  removeFilter,
  isLoadingWidth = false,
  isLoadingSidewall = false,
  isLoadingDiameter = false,
}) => {
  // Determinar cuando los selectores deben estar deshabilitados
  const isSidewallDisabled = !currentSize.width || isLoadingSidewall;
  const isDiameterDisabled = !currentSize.width || !currentSize.sidewall || isLoadingDiameter;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        {/* Width Selector */}
        <div className="w-full">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Width
            {isLoadingWidth && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-green-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            )}
          </label>
          <SelectDropdown
            selectedFilters={currentSize}
            handleFilterChange={value => handleFilterChange(value, 'width')}
            field={{
              type: 'width',
              label: 'Width',
              options: width,
            }}
            showDefaultText={false}
            disabled={isLoadingWidth}
          />
        </div>

        {/* Sidewall Selector */}
        <div className="w-full">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Sidewall
            {isLoadingSidewall && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-green-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            )}
          </label>
          <SelectDropdown
            selectedFilters={currentSize}
            handleFilterChange={value => handleFilterChange(value, 'sidewall')}
            field={{
              type: 'sidewall',
              label: 'Sidewall',
              options: sidewall,
            }}
            showDefaultText={false}
            disabled={isSidewallDisabled}
          />
        </div>

        {/* Diameter Selector */}
        <div className="w-full">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Diameter
            {isLoadingDiameter && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-green-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            )}
          </label>
          <SelectDropdown
            selectedFilters={currentSize}
            handleFilterChange={value => handleFilterChange(value, 'diameter')}
            field={{
              type: 'diameter',
              label: 'Diameter',
              options: diameter,
            }}
            showDefaultText={false}
            disabled={isDiameterDisabled}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(currentSize).map(([key, value]) => {
          if (!value) return null;
          return (
            <SizeSelector key={key} filterKey={key} value={value} removeFilter={removeFilter} />
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelectors;
