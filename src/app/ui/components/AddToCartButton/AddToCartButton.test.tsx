import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartProvider } from '@/app/context/CartContext';
import type { SingleTire } from '@/app/interfaces/tires';

import AddToCartButton from './AddToCartButton';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));
const { trackEcommerce } = await import('@/app/utils/analytics');
const track = vi.mocked(trackEcommerce);

const tire = {
  id: 77,
  name: '(77) | GOODYEAR | ASSURANCE | 205/55R16',
  price: '85',
  brand: 'GOODYEAR',
  model2: 'ASSURANCE',
  size: '205/55R16',
  condition: 'Used',
  images: [],
  details: [],
} as unknown as SingleTire;

const renderButton = () =>
  render(
    <CartProvider>
      <AddToCartButton product={tire} />
    </CartProvider>
  );

describe('AddToCartButton (detail page)', () => {
  beforeEach(() => {
    localStorage.clear();
    track.mockClear();
  });

  it('reports add_to_cart with the tire', async () => {
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(track).toHaveBeenCalledTimes(1);
    const [name, payload] = track.mock.calls[0];
    expect(name).toBe('add_to_cart');
    expect(payload).toMatchObject({ currency: 'USD', value: 85 });
    expect(payload.items[0]).toMatchObject({
      item_id: '77',
      item_name: 'Used Goodyear Assurance 205/55R16',
      item_variant: '205/55R16',
    });
  });

  it('reports nothing once the tire is in the cart and the button is disabled', async () => {
    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    track.mockClear();
    await user.click(screen.getByRole('button', { name: /in cart/i }));
    expect(track).not.toHaveBeenCalled();
  });
});
