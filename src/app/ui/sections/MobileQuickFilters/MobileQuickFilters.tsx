'use client';

import { ChangeEvent, FC, useContext } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import { AdjustmentsHorizontalIcon } from '@/app/ui/components/Icons/Icons';
import { useFilters } from '@/app/ui/sections/FiltersMobile/hooks/useFilters';

interface MobileQuickFiltersProps {
  redirectBasePath: string;
  apiBasePath?: string;
}

const CHIPS = [
  { category: 'condition' as const, value: 'new', label: 'New' },
  { category: 'condition' as const, value: 'used', label: 'Used' },
  { category: 'patched' as const, value: 'yes', label: 'Patched' },
  { category: 'patched' as const, value: 'no', label: 'Not Patched' },
];

const MobileQuickFilters: FC<MobileQuickFiltersProps> = ({
  redirectBasePath,
  apiBasePath = '/api',
}) => {
  const { setShowFilter } = useContext(ShowFilterContext);
  const { isChecked, handleCheckboxChange, checkboxInputs, rangeInputs, rangeBounds, resetFilters } =
    useFilters(redirectBasePath, apiBasePath, { enableStoreFilter: true });

  const toggleChip = (category: 'condition' | 'patched', value: string, active: boolean) => {
    const fakeEvent = {
      target: { name: `${category}[]`, value, checked: !active },
    } as ChangeEvent<HTMLInputElement>;
    handleCheckboxChange(fakeEvent);
  };

  const isRangeActive = (id: 'price' | 'treadDepth' | 'remainingLife') => {
    const [curMin, curMax] = rangeInputs[id];
    const [defMin, defMax] = rangeBounds[id];
    return curMin > defMin || curMax < defMax;
  };

  const otherActiveCount =
    (['treadDepth', 'remainingLife'] as const).filter(isRangeActive).length +
    (checkboxInputs.brands.length > 0 ? 1 : 0) +
    (checkboxInputs.stores.length > 0 ? 1 : 0);

  const anyFilterActive =
    otherActiveCount > 0 ||
    checkboxInputs.condition.length > 0 ||
    checkboxInputs.patched.length > 0;

  return (
    <div className="space-y-3">
      {/* Quick-access chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CHIPS.map(({ category, value, label }) => {
          const active = isChecked(category, value);
          return (
            <button
              key={`${category}-${value}`}
              type="button"
              onClick={() => toggleChip(category, value, active)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 active:bg-gray-100'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Filters button + Reset */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
          aria-label="Show all filters"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>Filters</span>
          {otherActiveCount > 0 && (
            <span className="bg-white text-green-700 rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">
              {otherActiveCount}
            </span>
          )}
        </button>

        {anyFilterActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileQuickFilters;
