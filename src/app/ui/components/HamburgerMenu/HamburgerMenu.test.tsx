import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ShowMenuContext } from '@/app/context/ShowMenuContext';

import HamburgerMenu from './HamburgerMenu';

const renderWith = (setShowMenu: (v: boolean) => void = vi.fn(), showMenu = false) =>
  render(
    <ShowMenuContext.Provider value={{ showMenu, setShowMenu }}>
      <HamburgerMenu />
    </ShowMenuContext.Provider>
  );

describe('HamburgerMenu', () => {
  it('exposes an accessible toggle in the collapsed state', () => {
    renderWith();
    const button = screen.getByRole('button', { name: /abrir menú/i });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('requests opening the menu on click', async () => {
    const setShowMenu = vi.fn();
    const user = userEvent.setup();
    renderWith(setShowMenu);
    await user.click(screen.getByRole('button', { name: /abrir menú/i }));
    expect(setShowMenu).toHaveBeenCalledWith(true);
  });
});
