import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from './Dialog';

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
});
