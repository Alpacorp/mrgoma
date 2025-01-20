'use client';
import { useState } from 'react';

export const useLateralFilters = () => {
  const [rangeInputs, setRangeInputs] = useState<any>({
    price: '0',
    treadDepth: '0',
    remainingLife: '0',
  });

  const handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void = event => {
    const name = event.target.name;
    const value = event.target.value;
    setRangeInputs({
      ...rangeInputs,
      [name]: value,
    });
  };

  return { rangeInputs, handleChange };
};
