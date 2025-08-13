'use client';

import { FC, useContext } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import { Dialog, DialogBackdrop, DialogPanel, XMarkIcon } from '@/app/ui/components';
import { FilterMobileContent } from '@/app/ui/sections';
import { useFilters } from '@/app/ui/sections/FiltersMobile/hooks/useFilters';

const FiltersMobile: FC = () => {
  const { showFilter, setShowFilter } = useContext(ShowFilterContext);
  const { resetFilters } = useFilters();

  return (
    <>
      {/* Mobile view */}
      <Dialog
        open={showFilter}
        onCloseAction={() => setShowFilter(false)}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black opacity-40 transition-opacity duration-300 ease-linear cursor-pointer"
        />
        <div
          className="fixed inset-0 z-40 flex"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowFilter(false);
            }
          }}
        >
          <DialogPanel
            transition
            className="relative mr-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-gray-50 py-4 pb-12 shadow-xl transition duration-300 ease-in-out"
          >
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Additional Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilter(false)}
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-green-primary"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-4 mt-2 mb-2">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-2 text-white bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
            <FilterMobileContent isMobile={true} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default FiltersMobile;
