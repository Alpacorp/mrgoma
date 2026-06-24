import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SelectDropdown from './SelectDropdown';

const field = {
  type: 'width',
  label: 'Width',
  options: [
    { id: 1, name: 205 },
    { id: 2, name: 225 },
  ],
};
const selected = { width: '', sidewall: '', diameter: '' };

describe('SelectDropdown', () => {
  it('renders an accessible select with its options and a default', () => {
    render(
      <SelectDropdown field={field} selectedFilters={selected} handleFilterChange={vi.fn()} />
    );
    expect(screen.getByRole('combobox', { name: 'Select Width' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Select Width' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '205' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '225' })).toBeInTheDocument();
  });

  it('calls handleFilterChange with the selected value and field type', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SelectDropdown field={field} selectedFilters={selected} handleFilterChange={onChange} />
    );
    await user.selectOptions(screen.getByRole('combobox'), '225');
    expect(onChange).toHaveBeenCalledWith('225', 'width');
  });

  it('is disabled when the disabled prop is set', () => {
    render(
      <SelectDropdown
        field={field}
        selectedFilters={selected}
        handleFilterChange={vi.fn()}
        disabled
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
