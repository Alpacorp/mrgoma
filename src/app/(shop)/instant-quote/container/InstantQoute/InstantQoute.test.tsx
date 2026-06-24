import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';

// SearchByText pulls next/navigation's router; stub it via the barrel.
vi.mock('@/app/ui/components', () => ({
  SearchByText: () => <div data-testid="search-by-text" />,
}));

import InstantQuote from './InstantQoute';

const renderWithSize = (size = { width: '', sidewall: '', diameter: '' }) =>
  render(
    <SelectedFiltersContext.Provider value={{ selectedFilters: size, setSelectedFilters: vi.fn() }}>
      <InstantQuote />
    </SelectedFiltersContext.Provider>
  );

afterEach(() => vi.unstubAllGlobals());

describe('InstantQuote form', () => {
  it('shows an email error only for invalid input', async () => {
    const user = userEvent.setup();
    renderWithSize();
    const email = screen.getByLabelText('Email');

    await user.type(email, 'bad');
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();

    await user.clear(email);
    await user.type(email, 'a@b.co');
    expect(screen.queryByText('Enter a valid email.')).not.toBeInTheDocument();
  });

  it('auto-formats the phone number', () => {
    renderWithSize();
    const phone = screen.getByLabelText('Phone');
    fireEvent.change(phone, { target: { value: '1234567890' } });
    expect(phone).toHaveValue('(123) 456-7890');
  });

  it('keeps submit disabled until all required fields are valid', () => {
    renderWithSize();
    expect(screen.getByRole('button', { name: /get my quote/i })).toBeDisabled();
  });

  it('submits the lead to /api/instant-quote when complete', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    renderWithSize({ width: '225', sidewall: '40', diameter: '18' });

    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');

    const store = screen.getByLabelText(/choose a store for pick-up/i);
    const options = within(store).getAllByRole('option');
    await user.selectOptions(store, options[1]);

    const submit = screen.getByRole('button', { name: /get my quote/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/instant-quote');
  });
});
