import type { ChangeEvent } from 'react';

import { cleanInput } from '@/app/utils/cleanInput';
import { formatTireSize } from '@/app/utils/formatTireSize';

interface HandleChangeProps {
  event: ChangeEvent<HTMLInputElement>;
  setValue: (value: string) => void;
  setSelectedFilters: (value: any) => void;
}

export const handleChange = ({ event, setValue, setSelectedFilters }: HandleChangeProps) => {
  const rawInput = event.target.value;
  const cleanedInput = cleanInput(rawInput);
  const formattedInput = formatTireSize(cleanedInput);
  setValue(formattedInput);
  setSelectedFilters((prev: any) => ({
    ...prev,
    width: Number(formattedInput.slice(0, 3)),
    sidewall: Number(formattedInput.slice(4, 6)),
    diameter: Number(formattedInput.slice(7, 9)),
  }));
};
