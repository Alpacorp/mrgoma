import React, { FC } from 'react';

import { Disclosure, DisclosureButton, DisclosureIcon, DisclosurePanel } from '@/app/ui/components';
import { FilterBody } from '@/app/ui/sections';
import { filtersItems } from '@/app/ui/sections/FiltersMobile/FiltersItems';
import { useFilters } from '@/app/ui/sections/FiltersMobile/hooks/useFilters';
/**
 * FilterContent is a component that renders a form with various filters, such as price, tread depth, remaining life, and checkboxes.
 * It takes an optional `isMobile` prop, which determines whether the component is rendered for mobile devices or not.
 * @prop {boolean} isMobile - Whether the component is rendered for mobile devices or not (default is false).
 */
export const FilterMobileContent: FC<{
  isMobile?: boolean;
  redirectBasePath: string;
  apiBasePath?: string;
  showPriceFilter?: boolean;
  showStoreFilter?: boolean;
}> = ({
  isMobile = false,
  redirectBasePath,
  apiBasePath = '/api',
  showPriceFilter = true,
  showStoreFilter = false,
}) => {
  const {
    rangeInputs,
    rangeBounds,
    availableBrands,
    availableStores,
    handleRangeChange,
    handleCheckboxChange,
    isLoadingRanges,
    isChecked,
    isLoadingBrands,
    isLoadingStores,
  } = useFilters(redirectBasePath, apiBasePath, { enableStoreFilter: showStoreFilter });

  const borderClass = isMobile ? 'border-t' : 'border-b';
  const paddingClass = isMobile ? 'px-4' : '';

  return (
    <form className={`${isMobile ? 'mt-2 px-5' : 'space-y-4'}`}>
      {/* Price Filter */}
      {showPriceFilter && (
        <Disclosure
          defaultOpen={true}
          as="div"
          className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
        >
          <h3 className="-my-3 flow-root">
            <DisclosureButton className="flex w-full items-center justify-between bg-gray-50 py-3 text-sm text-gray-400 hover:text-gray-500">
              <span className="font-medium text-gray-900">Price</span>
              <span className="ml-6 flex items-center text-green-primary">
                <DisclosureIcon />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6 h-20">
            {FilterBody(
              'price',
              {
                rangeInputs,
                rangeBounds,
                availableBrands,
                handleRangeChange,
                handleCheckboxChange,
                isLoadingRanges,
                isChecked,
                isLoadingBrands,
              },
              { isMobile, idPrefix: isMobile ? 'mobile-' : '' }
            )}
          </DisclosurePanel>
        </Disclosure>
      )}

      {/* Store Filter (dashboard only) */}
      {showStoreFilter && (availableStores.length > 0 || isLoadingStores) && (
        <Disclosure
          defaultOpen={true}
          as="div"
          className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
        >
          <h3 className={`${isMobile ? '-mx-2' : ''} -my-3 flow-root`}>
            <DisclosureButton
              className={`flex w-full items-center justify-between bg-gray-50 ${isMobile ? 'px-2' : ''} py-3 text-sm text-gray-400 hover:text-gray-500`}
            >
              <span className="font-medium text-gray-900">Store</span>
              <span className="ml-6 flex items-center text-green-primary">
                <DisclosureIcon />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6">
            {isLoadingStores ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-primary"></div>
                <span className="ml-2 text-sm text-gray-500">Loading stores...</span>
              </div>
            ) : (
              <div className={`space-y-${isMobile ? '6' : '4'} max-h-64 overflow-y-auto`}>
                {availableStores.map((store, idx) => (
                  <div key={store} className="flex items-center">
                    <input
                      id={`filter-${isMobile ? 'mobile-' : ''}stores-${idx}`}
                      name="stores[]"
                      value={store}
                      type="checkbox"
                      checked={isChecked('stores', store)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-primary focus:ring-green-primary"
                    />
                    <label
                      htmlFor={`filter-${isMobile ? 'mobile-' : ''}stores-${idx}`}
                      className={`ml-3 ${isMobile ? 'flex-1 text-gray-500' : 'text-gray-600'} text-sm`}
                    >
                      {store}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </DisclosurePanel>
        </Disclosure>
      )}

      {/* Tread Depth Filter */}
      <Disclosure
        defaultOpen={true}
        as="div"
        className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="flex w-full items-center justify-between bg-gray-50 py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Tread Depth</span>
            <span className="ml-6 flex items-center text-green-primary">
              <DisclosureIcon />
            </span>
          </DisclosureButton>
        </h3>
        <DisclosurePanel className="pt-6 h-20">
          {FilterBody(
            'treadDepth',
            {
              rangeInputs,
              rangeBounds,
              availableBrands,
              handleRangeChange,
              handleCheckboxChange,
              isLoadingRanges,
              isChecked,
              isLoadingBrands,
            },
            { isMobile, idPrefix: isMobile ? 'mobile-' : '' }
          )}
        </DisclosurePanel>
      </Disclosure>

      {/* Remaining Life Filter */}
      <Disclosure
        defaultOpen={true}
        as="div"
        className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
      >
        <h3 className="-my-3 flow-root">
          <DisclosureButton className="flex w-full items-center justify-between bg-gray-50 py-3 text-sm text-gray-400 hover:text-gray-500">
            <span className="font-medium text-gray-900">Remaining Life</span>
            <span className="ml-6 flex items-center text-green-primary">
              <DisclosureIcon />
            </span>
          </DisclosureButton>
        </h3>
        <DisclosurePanel className="pt-6 h-20">
          {FilterBody(
            'remainingLife',
            {
              rangeInputs,
              rangeBounds,
              availableBrands,
              handleRangeChange,
              handleCheckboxChange,
              isLoadingRanges,
              isChecked,
              isLoadingBrands,
            },
            { isMobile, idPrefix: isMobile ? 'mobile-' : '' }
          )}
        </DisclosurePanel>
      </Disclosure>

      {/* Checkbox Filters */}
      {filtersItems.map(section => (
        <Disclosure
          defaultOpen={true}
          key={section.id}
          as="div"
          className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
        >
          <h3 className={`${isMobile ? '-mx-2' : ''} -my-3 flow-root`}>
            <DisclosureButton
              className={`flex w-full items-center justify-between bg-gray-50 ${isMobile ? 'px-2' : ''} py-3 text-sm text-gray-400 hover:text-gray-500`}
            >
              <span className="font-medium text-gray-900">{section.name}</span>
              <span className="ml-6 flex items-center text-green-primary">
                <DisclosureIcon />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6">
            {FilterBody(
              section.id,
              {
                rangeInputs,
                rangeBounds,
                availableBrands,
                handleRangeChange,
                handleCheckboxChange,
                isLoadingRanges,
                isChecked,
                isLoadingBrands,
              },
              { isMobile, idPrefix: isMobile ? 'mobile-' : '' }
            )}
          </DisclosurePanel>
        </Disclosure>
      ))}

      {(availableBrands.length > 0 || isLoadingBrands) && (
        <Disclosure
          as="div"
          className={`${borderClass} border-gray-200 py-6 ${paddingClass}`}
          defaultOpen={true}
        >
          <h3 className={`${isMobile ? '-mx-2' : ''} -my-3 flow-root`}>
            <DisclosureButton
              className={`flex w-full items-center justify-between bg-gray-50 ${isMobile ? 'px-2' : ''} py-3 text-sm text-gray-400 hover:text-gray-500`}
            >
              <span className="font-medium text-gray-900">Brands</span>
              <span className="ml-6 flex items-center text-green-primary">
                <DisclosureIcon />
              </span>
            </DisclosureButton>
          </h3>
          <DisclosurePanel className="pt-6">
            {FilterBody(
              'brands',
              {
                rangeInputs,
                rangeBounds,
                availableBrands,
                handleRangeChange,
                handleCheckboxChange,
                isLoadingRanges,
                isChecked,
                isLoadingBrands,
              },
              { isMobile, idPrefix: isMobile ? 'mobile-' : '' }
            )}
          </DisclosurePanel>
        </Disclosure>
      )}
    </form>
  );
};

export default FilterMobileContent;
