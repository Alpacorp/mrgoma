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

/**
 * FilterContent is a component that renders a form with various filters, such as price, tread depth, remaining life, and checkboxes.
 * It takes an optional `isMobile` prop, which determines whether the component is rendered for mobile devices or not.
 * @prop {boolean} isMobile - Whether the component is rendered for mobile devices or not (default is false).
 */
const FilterContent: FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const {
    rangeInputs,
    rangeBounds,
    availableBrands,
    handleRangeChange,
    handleCheckboxChange,
    isLoadingRanges,
    isChecked,
    resetFilters,
  } = useLateralFilters();

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
          <div className="space-y-4">
            {isLoadingRanges ? (
              <div className="h-6 flex items-center justify-center">
                <span className="text-sm text-gray-500">Loading price range...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">${rangeInputs.price[0]}</span>
                  <span className="text-sm text-gray-600">${rangeInputs.price[1]}</span>
                </div>
                <RangeSlider
                  min={rangeBounds.price[0]}
                  max={rangeBounds.price[1]}
                  step={1}
                  value={rangeInputs.price}
                  onChange={value => handleRangeChange('price', value)}
                />
              </>
            )}
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
            {isLoadingRanges ? (
              <div className="h-6 flex items-center justify-center">
                <span className="text-sm text-gray-500">Loading tread depth range...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{rangeInputs.treadDepth[0]}</span>
                  <span className="text-sm text-gray-600">{rangeInputs.treadDepth[1]}</span>
                </div>
                <RangeSlider
                  min={rangeBounds.treadDepth[0]}
                  max={rangeBounds.treadDepth[1]}
                  step={1}
                  value={rangeInputs.treadDepth}
                  onChange={value => handleRangeChange('treadDepth', value)}
                />
              </>
            )}
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
            {isLoadingRanges ? (
              <div className="h-6 flex items-center justify-center">
                <span className="text-sm text-gray-500">Loading remaining life range...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{rangeInputs.remainingLife[0]}%</span>
                  <span className="text-sm text-gray-600">{rangeInputs.remainingLife[1]}%</span>
                </div>
                <RangeSlider
                  min={rangeBounds.remainingLife[0]}
                  max={rangeBounds.remainingLife[1]}
                  step={1}
                  value={rangeInputs.remainingLife}
                  onChange={value => handleRangeChange('remainingLife', value)}
                />
              </>
            )}
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Checkbox Filters */}
      {lateralItems.map(section => (
        <Disclosure
          defaultOpen={true}
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

      {availableBrands.length > 0 && (
        <Disclosure
          as="div"
          className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
          defaultOpen={true}
        >
          <h3 className={`${isMobile ? '-mx-2' : ''} -my-3 flow-root`}>
            <DisclosureButton
              className={`flex w-full items-center justify-between bg-white ${isMobile ? 'px-2' : ''} py-3 text-sm text-gray-400 hover:text-gray-500`}
            >
              <span className="font-medium text-gray-900">Brands</span>
              <span className="ml-6 flex items-center text-green-primary">
                <DisclosureIcon />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6">
            <div className={`space-y-${isMobile ? '6' : '4'} h-full max-h-96 overflow-y-auto`}>
              {availableBrands.map((brand, idx) => (
                <div key={brand} className="flex items-center">
                  <input
                    id={`filter-${isMobile ? 'mobile-' : ''}brands-${idx}`}
                    name="brands[]"
                    value={brand}
                    type="checkbox"
                    checked={isChecked('brands', brand)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-green-primary focus:ring-green-primary"
                  />
                  <label
                    htmlFor={`filter-${isMobile ? 'mobile-' : ''}brands-${idx}`}
                    className={`ml-3 ${isMobile ? 'flex-1 text-gray-500' : 'text-gray-600'} text-sm`}
                  >
                    {brand.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </DisclosurePanel>
        </Disclosure>
      )}
    </form>
  );
};

/**
 * A component that renders a filter panel on the left side of the screen (for desktop) or a modal (for mobile).
 * The component is a part of the search result page and is used to filter the search results.
 * The component is a wrapper around the `FilterContent` component, which is the component that renders the actual filters.
 * The component is responsive and renders differently depending on the screen size.
 * For desktop, the component renders a panel on the left side of the screen with the filters.
 * For mobile, the component renders a modal with the filters.
 * The component also renders a button to reset all filters.
 * The component uses the `useLateralFilters` hook to get the `resetFilters` function, which is called when the reset button is clicked.
 * The component uses the `ShowFilterContext` to get the `showFilter` and `setShowFilter` functions, which are used to show and hide the modal.
 */
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
