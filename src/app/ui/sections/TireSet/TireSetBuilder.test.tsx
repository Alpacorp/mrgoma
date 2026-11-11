import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartProvider } from '@/app/context/CartContext';
import { toGaItem } from '@/app/utils/ecommerce';
import type { SetUnit } from '@/app/utils/tireSets';

import TireSetBuilder from './TireSetBuilder';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('@/app/utils/analytics', () => ({
  trackEcommerce: vi.fn(() => Promise.resolve()),
  trackEvent: vi.fn(),
}));
const { trackEcommerce, trackEvent } = await import('@/app/utils/analytics');
const ecom = vi.mocked(trackEcommerce);
const evt = vi.mocked(trackEvent);

const unit = (id: string, over: Partial<SetUnit> = {}): SetUnit => ({
  id,
  code: `C${id}`,
  price: 100,
  tread: 9,
  life: '88%',
  patched: false,
  dot: '1222',
  image: null,
  condition: 'Used',
  city: 'Miami',
  ...over,
});

const product = { brand: 'MICHELIN', model2: 'DEFENDER', size: '225/65/17' };

const renderBuilder = (anchor: SetUnit, candidates: SetUnit[]) =>
  render(
    <CartProvider>
      <TireSetBuilder anchor={anchor} candidates={candidates} product={product} />
    </CartProvider>
  );

beforeEach(() => {
  localStorage.clear();
  ecom.mockClear();
  evt.mockClear();
});

describe('intro', () => {
  it('says the button above adds one tire and how many more there are', () => {
    render(
      <CartProvider>
        <TireSetBuilder anchor={unit('a')} candidates={[unit('b')]} product={product} more={1} />
      </CartProvider>
    );
    expect(screen.getByText(/Add to Cart above adds only this tire/)).toBeInTheDocument();
    expect(screen.getByText('We have 1 more of this tire in Miami.')).toBeInTheDocument();
  });
});

describe('TireSetBuilder', () => {
  it('offers only the feasible sizes as a labelled radio group (AC1, AC2)', () => {
    renderBuilder(unit('a'), [unit('b')]);
    const group = screen.getByRole('group', { name: 'How many tires?' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio').map(r => (r as HTMLInputElement).value)).toEqual(['2']);
  });

  it('lists every tire with its data, the total and the tread range (AC4)', () => {
    renderBuilder(unit('a'), [
      unit('b', { price: 110 }),
      unit('c', { tread: 10, price: 120 }),
      unit('d', { tread: 8, price: 90 }),
    ]);
    expect(screen.getByRole('radio', { name: '4 tires' })).toBeChecked();
    const list = screen.getByRole('list', { name: 'Tires in your set of 4' });
    expect(list.querySelectorAll('li')).toHaveLength(4);
    expect(screen.getByText('This tire')).toBeInTheDocument();
    // Every unit says its size, so the shopper sees they all match.
    expect(list.textContent!.match(/225\/65\/17 · /g)).toHaveLength(4);
    // Every other tire links to its own page, in a new tab so the set survives.
    const link = screen.getByRole('link', { name: /#Cb/ });
    expect(link).toHaveAttribute('href', '/tires/b-michelin-225-65-17');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(
      screen.getByText(/Set of 4 · total \$420\.00 · tread 8–10\/32, Δ2\/32/)
    ).toBeInTheDocument();
  });

  it('swaps a tire and updates the total (AC5)', async () => {
    const user = userEvent.setup();
    renderBuilder(unit('a'), [unit('b', { price: 100 }), unit('x', { tread: 8.5, price: 50 })]);
    await user.click(screen.getByRole('radio', { name: '2 tires' }));
    const swap = screen.getByRole('combobox', { name: 'Swap tire 2 of 2' });
    await user.selectOptions(swap, 'x');
    expect(screen.getByText(/total \$150\.00/)).toBeInTheDocument();
  });

  it('adds the set once, with one add_to_cart carrying every tire and a set_built event (AC6)', async () => {
    const user = userEvent.setup();
    renderBuilder(unit('a'), [unit('b'), unit('c'), unit('d')]);
    await user.click(screen.getByRole('button', { name: 'Add all 4 tires to cart' }));

    expect(ecom).toHaveBeenCalledTimes(1);
    const [name, payload] = ecom.mock.calls[0];
    expect(name).toBe('add_to_cart');
    expect(payload.items).toHaveLength(4);
    expect(payload).toMatchObject({ value: 400, set_size: 4 });
    // Same item_name `view_item` would send for that tire (feature 040).
    expect((payload.items[0] as { item_name?: string }).item_name).toBe(
      toGaItem({
        id: 'a',
        name: '',
        brand: 'MICHELIN',
        model: 'DEFENDER',
        size: '225/65/17',
        condition: 'Used',
      }).item_name
    );
    expect(evt).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'set_built',
        params: { set_size: 4, swaps: 0, condition: 'Used' },
      })
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Set in cart' })).toBeDisabled());
  });

  it('uses quantity mode for new tires — no unit list (AC16)', () => {
    renderBuilder(unit('a', { condition: 'New', tread: 10 }), [
      unit('b', { condition: 'New', tread: null }),
      unit('c', { condition: 'New', tread: 10 }),
      unit('d', { condition: 'New', tread: 10 }),
    ]);
    expect(screen.getByRole('heading', { name: 'Buy more than one' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders nothing when no set is possible (AC3)', () => {
    const { container } = renderBuilder(unit('a'), [unit('far', { tread: 5 })]);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('a set from the AI chat (044, D6)', () => {
  const anchor = unit('1', { price: 100 });
  const cands = [
    unit('2', { price: 100 }),
    unit('3', { price: 100 }),
    unit('4', { price: 300, tread: 8 }),
    unit('5', { price: 300, tread: 8 }),
  ];
  const renderWith = (initialSet: SetUnit[], notice?: string, a = anchor, c = cands) =>
    render(
      <CartProvider>
        <TireSetBuilder
          anchor={a}
          candidates={c}
          product={product}
          initialSet={initialSet}
          notice={notice}
        />
      </CartProvider>
    );

  it('starts from exactly those tires and their total (AC4)', () => {
    renderWith([anchor, cands[2], cands[3]]);

    expect(screen.getByRole('radio', { name: '3 tires' })).toBeChecked();
    expect(screen.getByText(/Set of 3 · total \$700\.00/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /#C4/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /#C5/ })).toBeInTheDocument();
  });

  it('shows the notice when a tire was replaced (AC5)', () => {
    renderWith([anchor, cands[0]], '1 tire sold; we picked the closest match.');

    expect(screen.getByRole('status')).toHaveTextContent('1 tire sold');
  });

  it('returns to the suggestion when the shopper picks another size', async () => {
    renderWith([anchor, cands[2], cands[3]]);

    await userEvent.click(screen.getByRole('radio', { name: '2 tires' }));
    await userEvent.click(screen.getByRole('radio', { name: '3 tires' }));

    expect(screen.getByText(/Set of 3 · total \$300\.00/)).toBeInTheDocument();
  });

  it('uses the quantity and total of a set of new tires', () => {
    const n = (id: string) => unit(id, { condition: 'New', tread: null, price: 150 });
    renderWith([n('1'), n('2'), n('3')], undefined, n('1'), [n('2'), n('3'), n('4')]);

    expect(screen.getByRole('radio', { name: '3 tires' })).toBeChecked();
    expect(screen.getByText(/Set of 3 · total \$450\.00/)).toBeInTheDocument();
  });
});
