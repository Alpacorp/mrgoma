import { act, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CartProvider, useCart } from './CartContext';

/**
 * The cart used to be read from `localStorage` inside the `useState`
 * initialiser, behind `typeof window !== 'undefined'` — the first cause React's
 * hydration error message lists. The server rendered "Add to Cart" and the
 * client's first render said "In Cart", so **every product page logged a
 * hydration error for anyone with a cart**, and the label flashed as React threw
 * the tree away and rebuilt it.
 *
 * Reading it after mount fixes that, and introduces a trap these tests exist to
 * hold shut: the effect that *saves* the cart must not run before the effect
 * that *loads* it, or the first render's empty array is written over a real
 * cart.
 */

const STORED = [{ id: '1', name: 'x', price: 10, quantity: 1, model: 'PROXES', size: '225/40/18' }];

function Probe() {
  const { cartItems, isInCart } = useCart();
  return (
    <div>
      <span data-testid="count">{cartItems.length}</span>
      <span data-testid="has">{isInCart('1') ? 'yes' : 'no'}</span>
    </div>
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('the cart and hydration', () => {
  /**
   * The assertion that would have caught the defect, made where it actually
   * matters: the HTML the server sends.
   *
   * It is asserted through `renderToString` rather than `render` because
   * Testing Library wraps `render` in `act`, which flushes the effects — by the
   * time it returns, the cart has already loaded and the first pass is
   * unobservable. Server rendering is the honest place to check it, and it is
   * also the side of the mismatch that used to disagree.
   */
  it('sends empty HTML from the server, even with a stored cart', () => {
    localStorage.setItem('cart', JSON.stringify(STORED));

    const html = renderToString(
      <CartProvider>
        <Probe />
      </CartProvider>
    );

    expect(html).toContain('>0<');
    expect(html).toContain('>no<');
  });

  it('picks the stored cart up right after mount', async () => {
    localStorage.setItem('cart', JSON.stringify(STORED));

    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    expect(screen.getByTestId('has').textContent).toBe('yes');
  });

  /**
   * The trap. Mounting must never write the first render's empty array over the
   * stored cart — a customer would lose it just by opening a page.
   */
  it('does not wipe a stored cart on mount', async () => {
    localStorage.setItem('cart', JSON.stringify(STORED));

    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    expect(JSON.parse(localStorage.getItem('cart') || '[]')).toHaveLength(1);
  });

  // A corrupt payload used to throw from the initialiser and take the page down.
  it('starts empty rather than crashing on a corrupt payload', async () => {
    localStorage.setItem('cart', 'not json at all');

    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );

    await act(async () => {});
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
