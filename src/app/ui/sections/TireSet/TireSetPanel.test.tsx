import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CartProvider } from '@/app/context/CartContext';
import type { SetUnit } from '@/app/utils/tireSets';

import TireSetPanel from './TireSetPanel';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('@/app/utils/analytics', () => ({
  trackEcommerce: vi.fn(() => Promise.resolve()),
  trackEvent: vi.fn(),
}));

// jsdom has <dialog> but not its modal methods.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

const unit = (id: string, over: Partial<SetUnit> = {}): SetUnit => ({
  id,
  code: `C${id}`,
  price: 100,
  tread: 9,
  patched: false,
  image: null,
  condition: 'Used',
  city: 'Miami',
  ...over,
});

const renderPanel = () =>
  render(
    <CartProvider>
      <TireSetPanel
        anchor={unit('a')}
        candidates={[unit('b'), unit('c'), unit('d')]}
        product={{ brand: 'MICHELIN', model2: 'DEFENDER', size: '225/65/17' }}
        more={3}
        sizes={[2, 3, 4]}
        fromSize={2}
        fromTotal={200}
        quantityMode={false}
      />
    </CartProvider>
  );

beforeEach(() => localStorage.clear());

describe('TireSetPanel', () => {
  it('shows a short card in the page, not the whole builder', () => {
    renderPanel();
    expect(screen.getByText('Need 2–4 tires?')).toBeInTheDocument();
    expect(
      screen.getByText('We have 3 more like this in Miami · from $200.00 for 2')
    ).toBeInTheDocument();
    const dialog = document.querySelector('dialog')!;
    expect(dialog).not.toHaveAttribute('open');
    expect(dialog).toHaveAttribute('closedby', 'any');
  });

  it('opens the builder in a labelled modal dialog and closes it after adding the set', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: /Build a set/ }));
    const dialog = document.querySelector('dialog')!;
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByRole('heading', { name: 'Build your set' }).id).toBe(
      dialog.getAttribute('aria-labelledby')
    );
    await user.click(screen.getByRole('button', { name: 'Add all 4 tires to cart' }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('has a visible close button', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: /Build a set/ }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });
});
