import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  brand?: string;
  condition?: string;
  image?: string;
  setId?: string;
  tread?: number;
};

const cart = vi.hoisted(() => ({
  value: {
    cartItems: [] as CartItem[],
    removeFromCart: vi.fn(),
    removeSet: vi.fn(),
    cartTotal: 0,
    showCartModal: true,
    setShowCartModal: vi.fn(),
  },
}));

vi.mock('@/app/context/CartContext', () => ({ useCart: () => cart.value }));
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: unknown; alt?: string }) => (
    <img src={typeof src === 'string' ? src : ''} alt={typeof alt === 'string' ? alt : ''} />
  ),
}));

import CartModal from './CartModal';

beforeEach(() => {
  cart.value = {
    cartItems: [],
    removeFromCart: vi.fn(),
    removeSet: vi.fn(),
    cartTotal: 0,
    showCartModal: true,
    setShowCartModal: vi.fn(),
  };
});

describe('CartModal', () => {
  it('shows the empty state when there are no items', () => {
    render(<CartModal />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('lists items and removes one on click', async () => {
    const user = userEvent.setup();
    cart.value.cartItems = [
      {
        id: '1',
        name: 'Michelin Pilot',
        price: 99,
        quantity: 1,
        brand: 'Michelin',
        condition: 'New',
      },
    ];
    cart.value.cartTotal = 99;

    render(<CartModal />);
    expect(screen.getByRole('heading', { name: 'Michelin Pilot' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove michelin pilot from cart/i }));
    expect(cart.value.removeFromCart).toHaveBeenCalledWith('1');
  });

  it('shows the site placeholder, not "No image", for a tire without a photo', () => {
    cart.value.cartItems = [{ id: '7', name: 'Tire', price: 99, quantity: 1 }];
    const { container } = render(<CartModal />);
    expect(screen.queryByText('No image')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/assets/images/generic-tire-image.webp'
    );
  });

  it('links each tire to its detail page and closes the drawer on the way', async () => {
    const user = userEvent.setup();
    cart.value.cartItems = [
      { id: '7', name: '(7) | MICHELIN | 225/65/17', price: 99, quantity: 1, brand: 'Michelin' },
    ];
    render(<CartModal />);
    const link = screen.getByRole('link', { name: '(7) | MICHELIN | 225/65/17' });
    expect(link).toHaveAttribute('href', '/tires/7-michelin-225-65-17');
    await user.click(link);
    expect(cart.value.setShowCartModal).toHaveBeenCalledWith(false);
  });

  it('closes via the close button', async () => {
    const user = userEvent.setup();
    render(<CartModal />);
    await user.click(screen.getByRole('button', { name: /close cart/i }));
    expect(cart.value.setShowCartModal).toHaveBeenCalledWith(false);
  });

  it('shows the subtotal footer and closes on checkout', async () => {
    const user = userEvent.setup();
    cart.value.cartItems = [{ id: '1', name: 'Tire', price: 99, quantity: 1 }];
    cart.value.cartTotal = 99;

    render(<CartModal />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /^checkout$/i }));
    expect(cart.value.setShowCartModal).toHaveBeenCalledWith(false);
  });
});

describe('CartModal with sets (feature 041)', () => {
  const member = (id: string, tread: number): CartItem => ({
    id,
    name: `(${id}) | MICHELIN | 225/65/17`,
    price: 100,
    quantity: 1,
    setId: 's1',
    tread,
  });

  it('groups a set under one header with total and tread range (AC7)', () => {
    cart.value.cartItems = [member('1', 9), member('2', 10), member('3', 9)];
    render(<CartModal />);
    expect(screen.getByText(/Set of 3 · \$300\.00/)).toBeInTheDocument();
    expect(screen.getByText('· tread 9–10/32', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Set of 3' }).querySelectorAll('li')).toHaveLength(3);
  });

  it('removes the whole set or one tire', async () => {
    const user = userEvent.setup();
    cart.value.cartItems = [member('1', 9), member('2', 9)];
    render(<CartModal />);
    await user.click(screen.getByRole('button', { name: 'Remove set of 2 from cart' }));
    expect(cart.value.removeSet).toHaveBeenCalledWith('s1');
    await user.click(screen.getAllByRole('button', { name: /^Remove \(1\)/ })[0]);
    expect(cart.value.removeFromCart).toHaveBeenCalledWith('1');
  });

  it('shows a set reduced to one tire as a single tire', () => {
    cart.value.cartItems = [member('1', 9)];
    render(<CartModal />);
    expect(screen.queryByText(/Set of/)).toBeNull();
  });
});
