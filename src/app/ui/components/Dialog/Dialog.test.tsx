import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog, DialogBackdrop, DialogPanel } from './Dialog';

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <Dialog open={false} onCloseAction={() => {}}>
        <p>content</p>
      </Dialog>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('exposes dialog semantics and its label when open', () => {
    render(
      <Dialog open onCloseAction={() => {}} ariaLabel="Test dialog">
        <button>Inside</button>
      </Dialog>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Test dialog');
    expect(screen.getByRole('button', { name: 'Inside' })).toBeInTheDocument();
  });

  it('calls onCloseAction when Escape is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onCloseAction={onClose}>
        <button>Inside</button>
      </Dialog>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click but not on panel click', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onCloseAction={onClose} ariaLabel="d">
        <DialogBackdrop className="backdrop" />
        <DialogPanel className="panel">
          <button>Inside</button>
        </DialogPanel>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: 'Inside' }));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(document.querySelector('.backdrop') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps focus on the dialog when Tab finds no focusable children', async () => {
    const user = userEvent.setup();
    render(
      <Dialog open onCloseAction={() => {}} ariaLabel="d">
        <span>no focusables</span>
      </Dialog>
    );
    await user.keyboard('{Tab}');
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('throws when a backdrop is used outside a Dialog', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DialogBackdrop />)).toThrow(/useDialog must be used within a Dialog/);
    spy.mockRestore();
  });
});
