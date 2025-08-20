'use client';

import { FC, useState, useRef, useEffect } from 'react';

import { FilterBody } from '@/app/ui/sections/';
import { filtersItems } from '@/app/ui/sections/FiltersMobile/FiltersItems';
import { useFilters } from '@/app/ui/sections/FiltersMobile/hooks/useFilters';

export const TopFilters: FC = () => {
  const {
    rangeInputs,
    rangeBounds,
    availableBrands,
    handleRangeChange,
    handleCheckboxChange,
    isLoadingRanges,
    isChecked,
    resetFilters,
    isLoadingBrands,
    checkboxInputs,
  } = useFilters();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const topSections = [
    { id: 'price', name: 'Price' },
    { id: 'treadDepth', name: 'Tread Depth' },
    { id: 'remainingLife', name: 'Remaining Life' },
    ...filtersItems.map(item => ({ id: item.id, name: item.name })),
  ] as { id: string; name: string }[];

  // Shared renderer for filter panels to avoid duplication across mobile and desktop views
  const buildDeps = () => ({
    rangeInputs,
    rangeBounds,
    availableBrands,
    handleRangeChange,
    handleCheckboxChange,
    isLoadingRanges,
    isChecked,
    isLoadingBrands,
  });

  const isRangeActive = (id: 'price' | 'treadDepth' | 'remainingLife') => {
    const [curMin, curMax] = rangeInputs[id];
    const [defMin, defMax] = rangeBounds[id];
    return curMin > defMin || curMax < defMax;
  };

  const isCheckboxGroupActive = (id: 'condition' | 'patched') => {
    return (checkboxInputs?.[id] || []).length > 0;
  };

  const isBrandsActive = () => (checkboxInputs?.brands || []).length > 0;

  const isFilterActive = (id: string) => {
    if (id === 'price' || id === 'treadDepth' || id === 'remainingLife') return isRangeActive(id);
    if (id === 'condition' || id === 'patched') return isCheckboxGroupActive(id);
    if (id === 'brands') return isBrandsActive();
    return false;
  };

  const activeClass = 'bg-green-50 border-green-500 text-green-700';
  const defaultClass = 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';

  return (
    <div ref={menuRef} className="w-full sticky top-21 z-40 hidden lg:block">
      <div className="flex items-start bg-white border border-gray-200 rounded-lg p-2">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {topSections.map(item => {
            const isOpen = openMenu === item.id;
            const isActive = isFilterActive(item.id);
            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(prev => (prev === item.id ? null : item.id))}
                  className={`px-3 py-2 text-sm rounded-md border cursor-pointer ${isOpen || isActive ? activeClass : defaultClass}`}
                >
                  {item.name}
                </button>
                {isOpen && (
                  <div className="absolute left-0 mt-2 z-50 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    {FilterBody(item.id, buildDeps(), { isMobile: false })}
                  </div>
                )}
              </div>
            );
          })}

          {(availableBrands.length > 0 || isLoadingBrands) && (
            <div className="relative">
              {(() => {
                const isOpen = openMenu === 'brands';
                const isActive = isBrandsActive();
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(prev => (prev === 'brands' ? null : 'brands'))}
                      className={`px-3 py-2 text-sm rounded-md border cursor-pointer ${isOpen || isActive ? activeClass : defaultClass}`}
                    >
                      Brands
                    </button>
                    {isOpen && (
                      <div className="absolute left-0 mt-2 z-50 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                        {FilterBody('brands', buildDeps(), {
                          isMobile: false,
                          containerExtraClass: 'pr-1',
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <div className="ml-auto pl-2">
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-2 cursor-pointer text-sm rounded-md text-white bg-green-600 hover:bg-green-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopFilters;
