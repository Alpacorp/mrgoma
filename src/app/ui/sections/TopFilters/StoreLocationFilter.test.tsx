import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { encodeLocationPairs } from '@/app/utils/filterUtils';

import { StoreLocationFilter } from './StoreLocationFilter';

const LOCATIONS = [
  { store: 'Hialeah', code: '+703A+' },
  { store: 'Hialeah', code: '+703B+' },
  { store: '441', code: '-507D-' },
];

const base = {
  stores: ['Hialeah', '441'],
  selectedStores: [] as string[],
  isLoadingStores: false,
  locations: LOCATIONS,
  selectedLocations: [] as string[],
  isLoadingLocations: false,
  openMenu: null as string | null,
  onOpenAction: vi.fn(),
  onChangeAction: vi.fn(),
  activeClass: 'active',
  defaultClass: 'default',
};

const pair = (store: string, code: string) => encodeLocationPairs([{ store, code }]);

const trigger = (name: 'Store' | 'Location') =>
  screen.getByText(name).parentElement!.querySelector('button')!;

describe('Location waits for a Store', () => {
  /**
   * AC4 — disabled, not hidden. A hidden control teaches nobody it exists; a
   * disabled one shows the capability and its precondition at once. The reason
   * is in the control's own text because a `disabled` element receives no touch
   * events on iOS, where a tap-to-reveal tooltip would never appear.
   *
   * It is the same shape as the Size group beside it in the bar: no sidewall
   * until a width is chosen.
   */
  it('greys Location out until a store is chosen, saying what it needs', () => {
    render(<StoreLocationFilter {...base} />);

    expect(trigger('Location')).toBeDisabled();
    expect(trigger('Location')).toHaveAttribute('aria-disabled', 'true');
    expect(trigger('Location')).toHaveTextContent('Select a store');
    expect(trigger('Store')).not.toBeDisabled();
  });

  it('cannot be opened while it is waiting', async () => {
    const onOpenAction = vi.fn();
    render(<StoreLocationFilter {...base} onOpenAction={onOpenAction} />);

    await userEvent.click(trigger('Location'));

    expect(onOpenAction).not.toHaveBeenCalled();
  });

  it('enables once a store is selected', () => {
    render(<StoreLocationFilter {...base} selectedStores={['Hialeah']} />);

    expect(trigger('Location')).not.toBeDisabled();
    expect(trigger('Location')).toHaveTextContent('Select');
  });
});

describe('the two controls read as one group', () => {
  it('counts each selection on its own trigger', () => {
    render(
      <StoreLocationFilter
        {...base}
        selectedStores={['Hialeah', '441']}
        selectedLocations={[pair('Hialeah', '+703A+')]}
      />
    );

    expect(trigger('Store')).toHaveTextContent('2 selected');
    expect(trigger('Location')).toHaveTextContent('1 selected');
  });

  it('offers Clear only once something is selected', () => {
    const { rerender } = render(<StoreLocationFilter {...base} />);
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

    rerender(<StoreLocationFilter {...base} selectedStores={['Hialeah']} />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  // Clearing goes through the same handler the checkboxes use, so the hook keeps
  // owning the state shape.
  it('unchecks both stores and shelves when cleared', async () => {
    const onChangeAction = vi.fn();
    render(
      <StoreLocationFilter
        {...base}
        selectedStores={['Hialeah']}
        selectedLocations={[pair('Hialeah', '+703A+')]}
        onChangeAction={onChangeAction}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

    const names = onChangeAction.mock.calls.map(call => call[0].target.name);
    expect(names).toEqual(['stores[]', 'locations[]']);
    for (const call of onChangeAction.mock.calls) {
      expect(call[0].target.checked).toBe(false);
    }
  });
});

describe('the shelf list', () => {
  const open = { ...base, selectedStores: ['Hialeah', '441'], openMenu: 'locations' };

  it('groups every code under the store that holds it', () => {
    render(<StoreLocationFilter {...open} />);

    expect(screen.getByLabelText('+703A+')).toBeInTheDocument();
    expect(screen.getByLabelText('-507D-')).toBeInTheDocument();
  });

  /**
   * The checkbox carries the encoded **pair**, not the code, because the code
   * alone is ambiguous — seven of them exist in more than one store.
   */
  it('carries the store with the code as its value', () => {
    render(<StoreLocationFilter {...open} />);

    expect(screen.getByLabelText('-507D-')).toHaveAttribute('value', pair('441', '-507D-'));
  });

  // AC3b
  it('narrows as you type, and hides a group with no match', async () => {
    render(<StoreLocationFilter {...open} />);

    await userEvent.type(screen.getByPlaceholderText('Filter codes…'), '703');

    expect(screen.getByLabelText('+703A+')).toBeInTheDocument();
    expect(screen.queryByLabelText('-507D-')).not.toBeInTheDocument();
    expect(screen.queryByText('441')).not.toBeInTheDocument();
  });

  it('restores the list when the input is cleared, keeping the selection', async () => {
    render(<StoreLocationFilter {...open} selectedLocations={[pair('441', '-507D-')]} />);

    const search = screen.getByPlaceholderText('Filter codes…');
    await userEvent.type(search, '703');
    await userEvent.clear(search);

    expect(screen.getByLabelText('-507D-')).toBeChecked();
  });

  it('says so plainly when nothing matches', async () => {
    render(<StoreLocationFilter {...open} />);

    await userEvent.type(screen.getByPlaceholderText('Filter codes…'), 'zzz');

    expect(screen.getByText(/No codes match/)).toBeInTheDocument();
  });
});
