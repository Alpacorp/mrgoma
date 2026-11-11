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

describe('a set opened from the AI chat (044)', () => {
  const anchor = unit('10', { price: 100 });
  const cands = [unit('11'), unit('12'), unit('13', { price: 300 }), unit('14', { price: 300 })];
  const renderAt = (search: string) => {
    window.history.replaceState(null, '', `/tires/10-michelin-225-65-17${search}`);
    return render(
      <CartProvider>
        <TireSetPanel
          anchor={anchor}
          candidates={cands}
          product={{ brand: 'MICHELIN', model2: 'DEFENDER', size: '225/65/17' }}
          more={4}
          sizes={[2, 3, 4]}
          fromSize={2}
          fromTotal={200}
          quantityMode={false}
        />
      </CartProvider>
    );
  };
  const dialog = () => document.querySelector('dialog') as HTMLDialogElement;

  it('opens the panel with exactly those tires and removes ?set= (AC4)', async () => {
    renderAt('?set=10,13,14');

    expect(await screen.findByText(/Set of 3 · total \$700\.00/)).toBeInTheDocument();
    expect(dialog()).toHaveAttribute('open');
    expect(window.location.search).toBe('');
    expect(window.location.pathname).toBe('/tires/10-michelin-225-65-17');
  });

  it('replaces a tire that sold and says so (AC5)', async () => {
    renderAt('?set=10,13,99');

    expect(await screen.findByRole('status')).toHaveTextContent(
      '1 tire of that set just sold; we picked the closest match.'
    );
    expect(dialog()).toHaveAttribute('open');
  });

  it('keeps the panel closed with a notice when the set cannot be built (AC5)', async () => {
    window.history.replaceState(null, '', '/tires/10?set=10,97,98,99');
    render(
      <CartProvider>
        <TireSetPanel
          anchor={anchor}
          candidates={[unit('11')]}
          product={{ brand: 'MICHELIN', model2: 'DEFENDER', size: '225/65/17' }}
          more={1}
          sizes={[2]}
          fromSize={2}
          fromTotal={200}
          quantityMode={false}
        />
      </CartProvider>
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'That set of 4 is no longer available'
    );
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('ignores a tampered link and behaves as today', () => {
    renderAt('?set=10,10,abc');

    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does nothing without ?set=', () => {
    renderAt('');

    expect(dialog()).not.toHaveAttribute('open');
  });
});
