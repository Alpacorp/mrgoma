import { FC } from 'react';

import { SelectDropdown, SizeSelector } from '@/app/ui/components';
import { TireSize } from '@/app/ui/interfaces/tireSize';

interface SizeSelectorsProps {
  position: 'rear' | 'all';
  width: { id: number; name: number }[];
  sidewall: { id: number; name: number }[];
  diameter: { id: number; name: number }[];
  currentSize: { width: string; sidewall: string; diameter: string };
  handleFilterChange: (value: string, type: keyof TireSize, position: 'rear' | 'all') => void;
  removeFilter: (type: keyof TireSize, position: 'rear' | 'all') => void;
}

const SizeSelectors: FC<SizeSelectorsProps> = ({
  position,
  width,
  sidewall,
  diameter,
  currentSize,
  handleFilterChange,
  removeFilter,
}) => {
  console.log('logs SizeSelectors', {
    position,
    width,
    sidewall,
    diameter,
    currentSize,
    handleFilterChange,
    removeFilter,
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Width', options: width, type: 'width' as const },
          { label: 'Sidewall', options: sidewall, type: 'sidewall' as const },
          { label: 'Diameter', options: diameter, type: 'diameter' as const },
        ].map(field => (
          <div key={`${position}-${field.type}`} className="w-full">
            <label className="text-sm font-medium text-gray-700 mb-2 block">{field.label}</label>
            <SelectDropdown
              selectedFilters={currentSize}
              handleFilterChange={value => handleFilterChange(value, field.type, position)}
              field={field}
              position={position}
              showDefaultText={false}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(currentSize).map(([key, value]) => {
          if (!value) return null;
          return (
            <SizeSelector
              position={position}
              key={key}
              filterKey={key}
              value={value}
              removeFilter={removeFilter}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelectors;
