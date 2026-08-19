import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { encodeLocationPairs } from '@/app/utils/filterUtils';

import { LocationFilter } from './LocationFilter';

const AVAILABLE = [
  { store: 'Hialeah', code: '+703A+' },
  { store: 'Hialeah', code: '+703B+' },
  { store: '441', code: '-507D-' },
];

const props = {
  available: AVAILABLE,
  selected: [] as string[],
  hasStore: true,
  isLoading: false,
  isOpen: true,
  onToggleAction: vi.fn(),
  onChangeAction: vi.fn(),
  activeClass: 'active',
  defaultClass: 'default',
};

describe('the shelf filter before a store is chosen', () => {
  /**
   * AC4 — disabled, not hidden. A hidden control teaches nobody it exists; a
   * disabled one shows the capability and its precondition at once. The reason
   * is in the button's own text because a `disabled` element receives no touch
   * events on iOS, where a tap-to-reveal tooltip would never appear.
   */
  it('shows the control, disabled, saying what it needs', () => {
    render(<LocationFilter {...props} hasStore={false} isOpen={false} />);

    const button = screen.getByRole('button', { name: /select a store/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('cannot be opened', async () => {
    const onToggleAction = vi.fn();
    render(
      <LocationFilter {...props} hasStore={false} isOpen={false} onToggleAction={onToggleAction} />
    );

    await userEvent.click(screen.getByRole('button', { name: /select a store/i }));

    expect(onToggleAction).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('Filter codes…')).not.toBeInTheDocument();
  });
});

describe('the shelf filter once a store is chosen', () => {
  it('groups every code under the store that holds it', () => {
    render(<LocationFilter {...props} />);

    expect(screen.getByText('Hialeah')).toBeInTheDocument();
    expect(screen.getByText('441')).toBeInTheDocument();
    expect(screen.getByLabelText('+703A+')).toBeInTheDocument();
    expect(screen.getByLabelText('-507D-')).toBeInTheDocument();
  });

  /**
   * The checkbox carries the encoded **pair**, not the code, because the code
   * alone is ambiguous — seven of them exist in more than one store.
   */
  it('carries the store with the code as its value', () => {
    render(<LocationFilter {...props} />);

    expect(screen.getByLabelText('-507D-')).toHaveAttribute(
      'value',
      encodeLocationPairs([{ store: '441', code: '-507D-' }])
    );
  });

  // AC3b
  it('narrows to the matching codes as you type, and hides a group with none', async () => {
    render(<LocationFilter {...props} />);

    await userEvent.type(screen.getByPlaceholderText('Filter codes…'), '703');

    expect(screen.getByLabelText('+703A+')).toBeInTheDocument();
    expect(screen.queryByLabelText('-507D-')).not.toBeInTheDocument();
    expect(screen.getByText('Hialeah')).toBeInTheDocument();
    expect(screen.queryByText('441')).not.toBeInTheDocument();
  });

  it('restores the full list when the input is cleared, keeping the selection', async () => {
    const selected = [encodeLocationPairs([{ store: '441', code: '-507D-' }])];
    render(<LocationFilter {...props} selected={selected} />);

    const search = screen.getByPlaceholderText('Filter codes…');
    await userEvent.type(search, '703');
    await userEvent.clear(search);

    expect(screen.getByLabelText('-507D-')).toBeInTheDocument();
    expect(screen.getByLabelText('-507D-')).toBeChecked();
  });

  it('says so plainly when nothing matches', async () => {
    render(<LocationFilter {...props} />);

    await userEvent.type(screen.getByPlaceholderText('Filter codes…'), 'zzz');

    expect(screen.getByText(/No codes match/)).toBeInTheDocument();
  });
});
