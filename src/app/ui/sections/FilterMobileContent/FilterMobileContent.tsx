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
export const FilterMobileContent: FC<{ isMobile?: boolean; redirectBasePath: string }> = ({
  isMobile = false,
  redirectBasePath,
}) => {
  const {
    rangeInputs,
    rangeBounds,
    availableBrands,
    handleRangeChange,
    handleCheckboxChange,
    isLoadingRanges,
    isChecked,
    isLoadingBrands,
  } = useFilters(redirectBasePath);

  const borderClass = isMobile ? 'border-t' : 'border-b';
  const paddingClass = isMobile ? 'px-4' : '';

  return (
    <form className={`${isMobile ? 'mt-2 px-5' : 'space-y-4'}`}>
      {/* Price Filter */}
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
