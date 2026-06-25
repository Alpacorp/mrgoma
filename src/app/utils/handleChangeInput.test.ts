import type { ChangeEvent } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { handleChange } from './handleChangeInput';

const evt = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

describe('handleChange', () => {
  it('cleans, formats and splits a full tire size', () => {
    const setValue = vi.fn();
    const setSelectedFilters = vi.fn();
    handleChange({ event: evt('225/40 R18'), setValue, setSelectedFilters });
    expect(setValue).toHaveBeenCalledWith('225/40/18');
    expect(setSelectedFilters).toHaveBeenCalledWith({
      width: '225',
      sidewall: '40',
      diameter: '18',
    });
  });

  it('handles partial input', () => {
    const setValue = vi.fn();
    const setSelectedFilters = vi.fn();
    handleChange({ event: evt('225'), setValue, setSelectedFilters });
    expect(setValue).toHaveBeenCalledWith('225');
    expect(setSelectedFilters).toHaveBeenCalledWith({ width: '225', sidewall: '', diameter: '' });
  });
});
