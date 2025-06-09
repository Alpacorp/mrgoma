'use client';
import { ChangeEvent, useState } from 'react';

interface RangeInputs {
  price: string;
  treadDepth: string;
  remainingLife: string;
}

export const useLateralFilters = () => {
  const [rangeInputs, setRangeInputs] = useState<RangeInputs>({
    price: '0',
    treadDepth: '0',
    remainingLife: '0',
  });

  const handleChange: (event: ChangeEvent<HTMLInputElement>) => void = event => {
    const name = event.target.name;
    const value = event.target.value;
    setRangeInputs({
      ...rangeInputs,
      [name]: value,
    });
  };

  return { rangeInputs, handleChange };
};
