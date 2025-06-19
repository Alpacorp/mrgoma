import type { Dispatch, SetStateAction, ChangeEvent } from 'react';

import { cleanInput } from '@/app/utils/cleanInput';
import { formatTireSize } from '@/app/utils/formatTireSize';

type SelectedFilters = {
  rear: {
    width: string;
    sidewall: string;
    diameter: string;
  };
  front: {
    width: string;
    sidewall: string;
    diameter: string;
  };
};

interface HandleChangeProps {
  event: ChangeEvent<HTMLInputElement>;
  setValue: (value: string) => void;
  setSelectedFilters: Dispatch<SetStateAction<SelectedFilters>>;
}

export const handleChange = ({ event, setValue, setSelectedFilters }: HandleChangeProps) => {
  const rawInput = event.target.value;
  const cleanedInput = cleanInput(rawInput);
  const formattedInput = formatTireSize(cleanedInput);
  setValue(formattedInput);
  setSelectedFilters((prev: SelectedFilters) => ({
    ...prev,
    front: {
      ...prev.front,
      width: formattedInput.split('/')[0] || '',
      sidewall: formattedInput.split('/')[1] || '',
      diameter: formattedInput.split('/')[2]?.replace(/[^0-9]/g, '') || '',
    },
    rear: {
      ...prev.rear,
      width: formattedInput.split('/')[0] || '',
      sidewall: formattedInput.split('/')[1] || '',
      diameter: formattedInput.split('/')[2]?.replace(/[^0-9]/g, '') || '',
    },
  }));
};
