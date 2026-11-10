import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartProvider } from '@/app/context/CartContext';
import type { TransformedTire } from '@/app/interfaces/tires';

import TireCard from './TireCard';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));
const { trackEcommerce } = await import('@/app/utils/analytics');
const track = vi.mocked(trackEcommerce);

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: unknown; alt?: string }) => (
    <img src={typeof src === 'string' ? src : ''} alt={typeof alt === 'string' ? alt : ''} />
  ),
}));

const product = {
  id: '42',
  name: '(ABC) | Michelin | Pilot | 225/40/18',
  color: 'Black',
  href: '#',
  imageSrc: '/tire.jpg',
  imageAlt: 'Michelin tire',
  price: '99',
  brand: 'Michelin',
  brandId: 7,
  condition: 'new',
  features: [],
} as unknown as TransformedTire;

const renderCard = () =>
  render(
    <CartProvider>
      <TireCard products={[product]} />
    </CartProvider>
  );

describe('TireCard', () => {
  beforeEach(() => {
    localStorage.clear();
    track.mockClear();
  });

  it('renders the parsed product title', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Michelin Pilot' })).toBeInTheDocument();
  });

  it('adds the product to the cart on click', async () => {
    const user = userEvent.setup();
    renderCard();
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]);
    expect(screen.getAllByRole('button', { name: /in cart/i }).length).toBeGreaterThan(0);
  });

  it('renders the spec strip and used-condition link for a used tire', () => {
    const used = {
      ...product,
      condition: 'used',
      features: [
        { name: 'Remaining life', value: '70%' },
        { name: 'Tread depth', value: '8' },
        { name: 'Patched', value: 'No' },
        { name: 'Run Flat', value: 'No' },
      ],
    } as unknown as TransformedTire;

    render(
      <CartProvider>
        <TireCard products={[used]} />
      </CartProvider>
    );

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Used' })).toBeInTheDocument();
  });

  // Feature 040. The card renders a desktop and a mobile button (CSS hides one);
  // jsdom shows both, in that order.
  it.each([
    ['desktop', 0],
    ['mobile', 1],
  ])('reports add_to_cart with the item from the %s button', async (_label, index) => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getAllByRole('button', { name: /add to cart/i })[index]);

    expect(track).toHaveBeenCalledTimes(1);
    const [name, payload] = track.mock.calls[0];
    expect(name).toBe('add_to_cart');
    expect(payload).toMatchObject({ currency: 'USD', value: 99 });
    expect(payload.items).toEqual([
      expect.objectContaining({ item_id: '42', item_name: 'New Michelin Pilot 225/40/18' }),
    ]);
  });

  it('reports nothing from a button that is disabled because the tire is in the cart', async () => {
    const user = userEvent.setup();
    renderCard();
    const [desktop] = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(desktop);
    track.mockClear();

    for (const button of screen.getAllByRole('button', { name: /in cart/i })) {
      await user.click(button);
    }
    expect(track).not.toHaveBeenCalled();
  });

  it('no longer carries the declarative add_to_cart marker (it would double-count)', () => {
    const { container } = renderCard();
    expect(container.querySelector('[data-track="add_to_cart"]')).toBeNull();
  });
});
