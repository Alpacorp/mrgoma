'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

interface RangeInputs {
  price: [number, number];
  treadDepth: [number, number];
  remainingLife: [number, number];
}

interface RangeBounds {
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

  const [rangeBounds, setRangeBounds] = useState<RangeBounds>({
    price: [10, 50],
    treadDepth: [1, 32],
    remainingLife: [0, 100],
  });

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isLoadingRanges, setIsLoadingRanges] = useState(true);

  // Initialize range inputs from URL parameters or defaults
  const [rangeInputs, setRangeInputs] = useState<RangeInputs>({
    price: [
      parseInt(searchParams.get('minPrice') || '10', 10),
      parseInt(searchParams.get('maxPrice') || '50', 10),
    ],
    treadDepth: [
      parseFloat(searchParams.get('minTreadDepth') || '1'),
      parseFloat(searchParams.get('maxTreadDepth') || '32'),
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

  useEffect(() => {
    const fetchBounds = async () => {
      try {
        setIsLoadingRanges(true);
        const res = await fetch('/api/ranges');
        if (!res.ok) return;
        const data = await res.json();
        const bounds: RangeBounds = {
          price: [data.minPrice, data.maxPrice],
          treadDepth: [data.minTreadDepth, data.maxTreadDepth],
          remainingLife: [data.minRemainingLife, data.maxRemainingLife],
        };
        setRangeBounds(bounds);
      } catch (err) {
        console.error('Failed to fetch range bounds', err);
      } finally {
        setIsLoadingRanges(false);
      }
    };

    void fetchBounds();

    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands');
        if (!res.ok) return;
        const data = await res.json();
        setAvailableBrands(data as string[]);
      } catch (err) {
        console.error('Failed to fetch brands', err);
      }
    };

    void fetchBrands();
  }, []);

  // Update filter values when URL changes
  useEffect(() => {
    const newRangeInputs = {
      price: [
        parseInt(searchParams.get('minPrice') || rangeBounds.price[0].toString(), 10),
        parseInt(searchParams.get('maxPrice') || rangeBounds.price[1].toString(), 10),
      ],
      treadDepth: [
        parseFloat(searchParams.get('minTreadDepth') || rangeBounds.treadDepth[0].toString()),
        parseFloat(searchParams.get('maxTreadDepth') || rangeBounds.treadDepth[1].toString()),
      ],
      remainingLife: [
        parseInt(
          searchParams.get('minRemainingLife') || rangeBounds.remainingLife[0].toString(),
          10
        ),
        parseInt(
          searchParams.get('maxRemainingLife') || rangeBounds.remainingLife[1].toString(),
          10
        ),
      ],
    } as RangeInputs;

    const newCheckboxInputs = {
      condition: searchParams.get('condition')?.split(',').filter(Boolean) || [],
      patched: searchParams.get('patched')?.split(',').filter(Boolean) || [],
      brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    } as CheckboxInputs;

    setRangeInputs(newRangeInputs);
    setCheckboxInputs(newCheckboxInputs);
  }, [searchParams, rangeBounds]);

  // Update URL parameters when filters change
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Update range inputs in URL
    if (rangeInputs.price[0] > rangeBounds.price[0])
      params.set('minPrice', rangeInputs.price[0].toString());
    else params.delete('minPrice');

    if (rangeInputs.price[1] < rangeBounds.price[1])
      params.set('maxPrice', rangeInputs.price[1].toString());
    else params.delete('maxPrice');

    if (rangeInputs.treadDepth[0] > rangeBounds.treadDepth[0])
      params.set('minTreadDepth', rangeInputs.treadDepth[0].toString());
    else params.delete('minTreadDepth');

    if (rangeInputs.treadDepth[1] < rangeBounds.treadDepth[1])
      params.set('maxTreadDepth', rangeInputs.treadDepth[1].toString());
    else params.delete('maxTreadDepth');

    if (rangeInputs.remainingLife[0] > rangeBounds.remainingLife[0])
      params.set('minRemainingLife', rangeInputs.remainingLife[0].toString());
    else params.delete('minRemainingLife');

    if (rangeInputs.remainingLife[1] < rangeBounds.remainingLife[1])
      params.set('maxRemainingLife', rangeInputs.remainingLife[1].toString());
    else params.delete('maxRemainingLife');

    // Update checkbox inputs in URL
    if (checkboxInputs.condition.length > 0)
      params.set('condition', checkboxInputs.condition.join(','));
    else params.delete('condition');

    if (checkboxInputs.patched.length > 0) params.set('patched', checkboxInputs.patched.join(','));
    else params.delete('patched');

    if (checkboxInputs.brands.length > 0) params.set('brands', checkboxInputs.brands.join(','));
    else params.delete('brands');

    // Preserve existing search parameters that aren't related to filters
    const newUrl = `/search-results?${params.toString()}`;

    router.push(newUrl, { scroll: false });
  }, [
    searchParams,
    rangeInputs.price,
    rangeInputs.treadDepth,
    rangeInputs.remainingLife,
    rangeBounds.price,
    rangeBounds.treadDepth,
    rangeBounds.remainingLife,
    checkboxInputs.condition,
    checkboxInputs.patched,
    checkboxInputs.brands,
    router,
  ]);

  // Update URL when filters change
  useEffect(() => {
    // Skip the initial render to avoid double updates
    const timeoutId = setTimeout(() => {
      updateUrlParams();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [rangeInputs, checkboxInputs, updateUrlParams]);

  // Handle range slider changes
  const handleRangeChange = (type: keyof RangeInputs, value: [number, number]) => {
    setRangeInputs(prev => {
      return {
        ...prev,
        [type]: value,
      };
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    const category = name.split('[')[0] as keyof CheckboxInputs;

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
      return newState;
    });
  };

  // Reset all filters to default values
  const resetFilters = useCallback(() => {
    // Reset range inputs to defaults
    const defaultRangeInputs = {
      price: [...rangeBounds.price] as [number, number],
      treadDepth: [...rangeBounds.treadDepth] as [number, number],
      remainingLife: [...rangeBounds.remainingLife] as [number, number],
    } as RangeInputs;
    setRangeInputs(defaultRangeInputs);

    // Reset checkbox inputs to empty arrays
    const defaultCheckboxInputs = {
      condition: [],
      patched: [],
      brands: [],
    };
    setCheckboxInputs(defaultCheckboxInputs);

    // Clear filter parameters from URL
    const params = new URLSearchParams(searchParams.toString());

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

    // Update URL
    const newUrl = `/search-results?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, router, rangeBounds]);

  return {
    availableBrands,
    rangeInputs,
    rangeBounds,
    checkboxInputs,
    handleRangeChange,
    handleCheckboxChange,
    isLoadingRanges,
    resetFilters,
    isChecked: (category: keyof CheckboxInputs, value: string) =>
      checkboxInputs[category].includes(value),
  };
};
