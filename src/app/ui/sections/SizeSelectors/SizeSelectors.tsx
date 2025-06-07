import { FC } from 'react';

import { SelectDropdown } from '@/app/ui/components';
import { SizeSelector } from '@/app/ui/components/SizeSelector/SizeSelector';
import { Car, CarFront } from '@/app/ui/icons';
import { TireSize } from '@/app/ui/interfaces/tireSize';

interface SizeSelectorsProps {
  position: 'rear' | 'all';
  section: { id: number; name: number }[];
  aspectRatio: { id: number; name: number }[];
  diameter: { id: number; name: number }[];
  currentSize: { width: string; sidewall: string; diameter: string };
  handleFilterChange: (value: string, type: keyof TireSize, position: 'rear' | 'all') => void;
  removeFilter: (type: keyof TireSize, position: 'rear' | 'all') => void;
}

export const SizeSelectors: FC<SizeSelectorsProps> = ({
  position,
  section,
  aspectRatio,
  diameter,
  currentSize,
  handleFilterChange,
  removeFilter,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        {position === 'all' ? (
          <CarFront className="w-5 h-5 text-gray-600" />
        ) : (
          <Car className="w-5 h-5 text-gray-600" />
        )}
        <span className="text-base font-medium text-gray-600 capitalize ml-1">
          {position} Tires
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Width', options: section, type: 'width' as const },
          { label: 'Sidewall', options: aspectRatio, type: 'sidewall' as const },
          { label: 'Diameter', options: diameter, type: 'diameter' as const },
        ].map(field => (
          <div key={`${position}-${field.type}`} className="w-full">
            <label className="text-sm font-medium text-gray-700 mb-2 block">{field.label}</label>
            <SelectDropdown
              selectedFilters={currentSize}
              handleFilterChange={value => handleFilterChange(value, field.type, position)}
              field={field}
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
