import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { cleanInput } from '@/app/utils/cleanInput';
import { formatTireSize } from '@/app/utils/formatTireSize';

type SelectedFilters = React.ComponentProps<
  typeof SelectedFiltersContext.Provider
>['value']['selectedFilters'];

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

  setSelectedFilters({
    width: formattedInput.split('/')[0] || '',
    sidewall: formattedInput.split('/')[1] || '',
    diameter: formattedInput.split('/')[2]?.replace(/[^0-9]/g, '') || '',
  });
};
