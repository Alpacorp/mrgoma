'use client';

import { FC, useContext } from 'react';

import { ShowFilterContext } from '@/app/context/ShowFilterContext';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  DisclosureIcon,
  RangeSlider,
  XMarkIcon,
} from '@/app/ui/components';
import { useLateralFilters } from '@/app/ui/sections/LateralFilters/hooks/useLateralFilters';
import { lateralItems } from '@/app/ui/sections/LateralFilters/LateralItems';

// Filter content component that's shared between desktop and mobile views
const FilterContent: FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const { rangeInputs, handleRangeChange, handleCheckboxChange, isChecked, resetFilters } =
    useLateralFilters();

  const borderClass = isMobile ? 'border-t' : 'border-b';
  const paddingClass = isMobile ? 'px-4' : '';
  const resetButtonClass = isMobile
    ? 'w-full py-2 text-white bg-green-primary hover:bg-green-600 rounded-md text-sm font-medium transition-colors'
    : 'text-sm cursor-pointer bg-green-200 px-2 py-1 text-green-primary hover:text-green-600 font-medium flex items-center rounded-md';

  return (
    <form className={`${isMobile ? 'mt-2 px-5' : 'space-y-4'}`}>
      {!isMobile && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Additional Filters</h2>
          <button type="button" onClick={resetFilters} className={resetButtonClass}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Price Filter */}
      <Disclosure
        defaultOpen={true}
        as="div"
        className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Price</span>
            <span className="ml-6 flex items-center text-green-primary">
              <DisclosureIcon />
            </span>
          </DisclosureButton>
        </h3>
        <DisclosurePanel className="pt-6">
          <div className="space-y-4 ">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">${rangeInputs.price[0]}</span>
              <span className="text-sm text-gray-600">${rangeInputs.price[1]}</span>
            </div>
            <RangeSlider
              min={0}
              max={50}
              step={1}
              value={rangeInputs.price}
              onChange={value => handleRangeChange('price', value)}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Tread Depth Filter */}
      <Disclosure
        defaultOpen={true}
        as="div"
        className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Tread Depth</span>
            <span className="ml-6 flex items-center text-green-primary">
              <DisclosureIcon />
            </span>
          </DisclosureButton>
        </h3>
        <DisclosurePanel className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{rangeInputs.treadDepth[0]}/32</span>
              <span className="text-sm text-gray-600">{rangeInputs.treadDepth[1]}/32</span>
            </div>
            <RangeSlider
              min={1}
              max={32}
              step={1}
              value={rangeInputs.treadDepth}
              onChange={value => handleRangeChange('treadDepth', value)}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Remaining Life Filter */}
      <Disclosure
        defaultOpen={true}
        as="div"
        className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Remaining Life</span>
            <span className="ml-6 flex items-center text-green-primary">
              <DisclosureIcon />
            </span>
          </DisclosureButton>
        </h3>
        <DisclosurePanel className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{rangeInputs.remainingLife[0]}%</span>
              <span className="text-sm text-gray-600">{rangeInputs.remainingLife[1]}%</span>
            </div>
            <RangeSlider
              min={0}
              max={100}
              step={1}
              value={rangeInputs.remainingLife}
              onChange={value => handleRangeChange('remainingLife', value)}
            />
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Checkbox Filters */}
      {lateralItems.map(section => (
        <Disclosure
          key={section.id}
          as="div"
          className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
        >
          <h3 className={`${isMobile ? '-mx-2' : ''} -my-3 flow-root`}>
            <DisclosureButton
              className={`flex w-full items-center justify-between bg-white ${isMobile ? 'px-2' : ''} py-3 text-sm text-gray-400 hover:text-gray-500`}
            >
              <span className="font-medium text-gray-900">{section.name}</span>
              <span className="ml-6 flex items-center text-green-primary">
                <DisclosureIcon />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6">
            <div className={`space-y-${isMobile ? '6' : '4'}`}>
              {section.options.map((option, optionIdx) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`filter-${isMobile ? 'mobile-' : ''}${section.id}-${optionIdx}`}
                    name={`${section.id}[]`}
                    value={option.value}
                    type="checkbox"
                    checked={isChecked(section.id as any, option.value)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-green-primary focus:ring-green-primary"
                  />
                  <label
                    htmlFor={`filter-${isMobile ? 'mobile-' : ''}${section.id}-${optionIdx}`}
                    className={`ml-3 ${isMobile ? 'flex-1 text-gray-500' : 'text-gray-600'} text-sm`}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </form>
  );
};

const LateralFilters: FC = () => {
  const { showFilter, setShowFilter } = useContext(ShowFilterContext);
  const { resetFilters } = useLateralFilters();

  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile view */}
      <Dialog
        open={showFilter}
        onCloseAction={() => setShowFilter(false)}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black opacity-40 transition-opacity duration-300 ease-linear"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative mr-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out"
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
                className="w-full py-2 text-white bg-green-500 hover:bg-green-600 rounded-md text-sm font-medium transition-colors"
              >
                Reset All Filters
              </button>
            </div>
            <FilterContent isMobile={true} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default LateralFilters;
