import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CartContext, type CartItem } from '@/app/context/CartContext';
import { trackEvent } from '@/app/utils/analytics';

// `vi.hoisted` because `vi.mock` is lifted above these declarations; the same
// pattern the API route tests use.
const h = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: h.replace, push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/app/utils/analytics', () => ({ trackEvent: vi.fn() }));

import Checkout from './Checkout';

const tracked = vi.mocked(trackEvent);

const ITEM: CartItem = {
  id: 1,
  name: 'Goodyear 205/55R16',
  price: 80,
  quantity: 1,
  condition: 'used',
};

/**
 * The container reads the cart from context and nothing else that matters here,
 * so a bare provider is enough — no need to drive `CartProvider`'s own storage.
 */
const renderCheckout = (cartItems: CartItem[] = [ITEM]) =>
  render(
    <CartContext.Provider
      value={{
        cartItems,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        isInCart: () => false,
        cartCount: cartItems.length,
        cartTotal: cartItems.reduce((n, i) => n + i.price * i.quantity, 0),
        showCartModal: false,
        setShowCartModal: vi.fn(),
      }}
    >
      <Checkout />
    </CartContext.Provider>
  );

/** Pick up-in-store, which is the shortest path to an enabled submit button. */
const choosePickup = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
  // `/store/i` alone matches several controls; the select's own label is exact.
  const store = screen.getByLabelText('Choose a store for pick-up') as HTMLSelectElement;
  await user.selectOptions(store, store.options[1].value);
};

const submitButton = () => screen.getByRole('button', { name: /proceed to payment|whatsapp/i });

beforeEach(() => {
  vi.stubGlobal('open', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Checkout tracking', () => {
  it('marks the submit button with add_shipping_info, not the retired place_order', () => {
    // AC8: the click is an intent signal named for what it observes — the
    // customer supplied fulfilment details. Payment details are entered on the
    // provider's page, which we never see.
    renderCheckout();

    expect(submitButton()).toHaveAttribute('data-track', 'add_shipping_info');
    expect(document.querySelector('[data-track="place_order"]')).toBeNull();
  });

  it('records exactly one whatsapp_order_sent when the order is handed off', async () => {
    const user = userEvent.setup({ delay: null });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ whatsappUrl: 'https://wa.me/1234' }),
      })
    );

    renderCheckout();
    await choosePickup(user);
    await user.click(submitButton());

    await waitFor(() => {
      const sent = tracked.mock.calls.filter(([e]) => e.action === 'whatsapp_order_sent');
      expect(sent).toHaveLength(1);
    });

    // AC10 + FR12: an unconfirmed hand-off must never be counted as a purchase.
    expect(tracked.mock.calls.some(([e]) => e.action === 'purchase')).toBe(false);
  });

  it('records no whatsapp_order_sent when the session redirects to the payment provider', async () => {
    const user = userEvent.setup({ delay: null });
    const assign = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: 'https://checkout.stripe.com/x' }),
      })
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign },
    });

    renderCheckout();
    await choosePickup(user);
    await user.click(submitButton());

    await waitFor(() => expect(assign).toHaveBeenCalled());
    expect(tracked.mock.calls.some(([e]) => e.action === 'whatsapp_order_sent')).toBe(false);
  });

  it('records nothing when an item turns out to be unavailable', async () => {
    const user = userEvent.setup({ delay: null });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ unavailable: [{ id: '1' }] }),
      })
    );

    renderCheckout();
    await choosePickup(user);
    await user.click(submitButton());

    await waitFor(() => expect(screen.getByText(/unavailable/i)).toBeInTheDocument());
    expect(tracked).not.toHaveBeenCalled();
  });
});
