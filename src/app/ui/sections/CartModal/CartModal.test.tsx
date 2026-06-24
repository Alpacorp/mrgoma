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
};

const cart = vi.hoisted(() => ({
  value: {
    cartItems: [] as CartItem[],
    removeFromCart: vi.fn(),
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
      { id: '1', name: 'Michelin Pilot', price: 99, quantity: 1, brand: 'Michelin', condition: 'New' },
    ];
    cart.value.cartTotal = 99;

    render(<CartModal />);
    expect(screen.getByRole('heading', { name: 'Michelin Pilot' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove michelin pilot from cart/i }));
    expect(cart.value.removeFromCart).toHaveBeenCalledWith('1');
  });
});
