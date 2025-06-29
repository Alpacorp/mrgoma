'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

interface RangeInputs {
  price: [number, number];
  treadDepth: [number, number];
  remainingLife: [number, number];
}

interface CheckboxInputs {
  condition: string[];
  patched: string[];
  brands: string[];
}

export const useLateralFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize range inputs from URL parameters or defaults
  const [rangeInputs, setRangeInputs] = useState<RangeInputs>({
    price: [
      parseInt(searchParams.get('minPrice') || '0', 10),
      parseInt(searchParams.get('maxPrice') || '50', 10),
    ],
    treadDepth: [
      parseInt(searchParams.get('minTreadDepth') || '1', 10),
      parseInt(searchParams.get('maxTreadDepth') || '32', 10),
    ],
    remainingLife: [
      parseInt(searchParams.get('minRemainingLife') || '0', 10),
      parseInt(searchParams.get('maxRemainingLife') || '100', 10),
    ],
  });

  // Initialize checkbox inputs from URL parameters or defaults
  const [checkboxInputs, setCheckboxInputs] = useState<CheckboxInputs>({
    condition: searchParams.get('condition')?.split(',').filter(Boolean) || [],
    patched: searchParams.get('patched')?.split(',').filter(Boolean) || [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
  });

  // Update filter values when URL changes
  useEffect(() => {
    console.log('URL changed, updating filters from URL parameters');
    console.log('Current URL parameters:', Object.fromEntries(new URLSearchParams(searchParams.toString())));

    const newRangeInputs = {
      price: [
        parseInt(searchParams.get('minPrice') || '0', 10),
        parseInt(searchParams.get('maxPrice') || '50', 10),
      ],
      treadDepth: [
        parseInt(searchParams.get('minTreadDepth') || '1', 10),
        parseInt(searchParams.get('maxTreadDepth') || '32', 10),
      ],
      remainingLife: [
        parseInt(searchParams.get('minRemainingLife') || '0', 10),
        parseInt(searchParams.get('maxRemainingLife') || '100', 10),
      ],
    };

    const newCheckboxInputs = {
      condition: searchParams.get('condition')?.split(',').filter(Boolean) || [],
      patched: searchParams.get('patched')?.split(',').filter(Boolean) || [],
      brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    };

    console.log('New range inputs:', newRangeInputs);
    console.log('New checkbox inputs:', newCheckboxInputs);

    setRangeInputs(newRangeInputs);
    setCheckboxInputs(newCheckboxInputs);
  }, [searchParams]);

  // Update URL parameters when filters change
  const updateUrlParams = useCallback(() => {
    console.log('Updating URL parameters from filter values');
    console.log('Current range inputs:', rangeInputs);
    console.log('Current checkbox inputs:', checkboxInputs);

    const params = new URLSearchParams(searchParams.toString());
    console.log('Initial URL parameters:', Object.fromEntries(params));

    // Update range inputs in URL
    if (rangeInputs.price[0] > 0) params.set('minPrice', rangeInputs.price[0].toString());
    else params.delete('minPrice');

    if (rangeInputs.price[1] < 50) params.set('maxPrice', rangeInputs.price[1].toString());
    else params.delete('maxPrice');

    if (rangeInputs.treadDepth[0] > 1) params.set('minTreadDepth', rangeInputs.treadDepth[0].toString());
    else params.delete('minTreadDepth');

    if (rangeInputs.treadDepth[1] < 32) params.set('maxTreadDepth', rangeInputs.treadDepth[1].toString());
    else params.delete('maxTreadDepth');

    if (rangeInputs.remainingLife[0] > 0) params.set('minRemainingLife', rangeInputs.remainingLife[0].toString());
    else params.delete('minRemainingLife');

    if (rangeInputs.remainingLife[1] < 100) params.set('maxRemainingLife', rangeInputs.remainingLife[1].toString());
    else params.delete('maxRemainingLife');

    // Update checkbox inputs in URL
    if (checkboxInputs.condition.length > 0) params.set('condition', checkboxInputs.condition.join(','));
    else params.delete('condition');

    if (checkboxInputs.patched.length > 0) params.set('patched', checkboxInputs.patched.join(','));
    else params.delete('patched');

    if (checkboxInputs.brands.length > 0) params.set('brands', checkboxInputs.brands.join(','));
    else params.delete('brands');

    console.log('Updated URL parameters:', Object.fromEntries(params));

    // Preserve existing search parameters that aren't related to filters
    const newUrl = `/search-results?${params.toString()}`;
    console.log('New URL:', newUrl);

    router.push(newUrl, { scroll: false });
  }, [rangeInputs, checkboxInputs, searchParams, router]);

  // Update URL when filters change
  useEffect(() => {
    console.log('Filter values changed, updating URL');
    console.log('Current range inputs in effect:', rangeInputs);
    console.log('Current checkbox inputs in effect:', checkboxInputs);

    // Skip the initial render to avoid double updates
    const timeoutId = setTimeout(() => {
      console.log('Timeout expired, calling updateUrlParams');
      updateUrlParams();
    }, 0);

    return () => {
      console.log('Cleaning up timeout');
      clearTimeout(timeoutId);
    };
  }, [rangeInputs, checkboxInputs]);

  // Handle range slider changes
  const handleRangeChange = (type: keyof RangeInputs, value: [number, number]) => {
    console.log(`Range slider changed: ${type}`, value);
    setRangeInputs(prev => {
      const newState = {
        ...prev,
        [type]: value,
      };
      console.log('New range inputs state:', newState);
      return newState;
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    const category = name.split('[')[0] as keyof CheckboxInputs;
    console.log(`Checkbox changed: ${category} - ${value}`, checked);

    setCheckboxInputs(prev => {
      let newState;
      if (checked) {
        newState = {
          ...prev,
          [category]: [...prev[category], value],
        };
      } else {
        newState = {
          ...prev,
          [category]: prev[category].filter(item => item !== value),
        };
      }
      console.log('New checkbox inputs state:', newState);
      return newState;
    });
  };

  // Reset all filters to default values
  const resetFilters = useCallback(() => {
    console.log('Resetting all filters to default values');

    // Reset range inputs to defaults
    const defaultRangeInputs = {
      price: [0, 50],
      treadDepth: [1, 32],
      remainingLife: [0, 100],
    };
    console.log('Default range inputs:', defaultRangeInputs);
    setRangeInputs(defaultRangeInputs);

    // Reset checkbox inputs to empty arrays
    const defaultCheckboxInputs = {
      condition: [],
      patched: [],
      brands: [],
    };
    console.log('Default checkbox inputs:', defaultCheckboxInputs);
    setCheckboxInputs(defaultCheckboxInputs);

    // Clear filter parameters from URL
    const params = new URLSearchParams(searchParams.toString());
    console.log('Initial URL parameters before reset:', Object.fromEntries(params));

    // Remove range input parameters
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('minTreadDepth');
    params.delete('maxTreadDepth');
    params.delete('minRemainingLife');
    params.delete('maxRemainingLife');

    // Remove checkbox input parameters
    params.delete('condition');
    params.delete('patched');
    params.delete('brands');

    console.log('URL parameters after reset:', Object.fromEntries(params));

    // Update URL
    const newUrl = `/search-results?${params.toString()}`;
    console.log('New URL after reset:', newUrl);
    router.push(newUrl, { scroll: false });
  }, [searchParams, router]);

  return {
    rangeInputs,
    checkboxInputs,
    handleRangeChange,
    handleCheckboxChange,
    resetFilters,
    isChecked: (category: keyof CheckboxInputs, value: string) =>
      checkboxInputs[category].includes(value)
  };
};
