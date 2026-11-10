import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CartContext, type CartItem } from '@/app/context/CartContext';
import { trackEcommerce, trackEvent } from '@/app/utils/analytics';

// `vi.hoisted` because `vi.mock` is lifted above these declarations; the same
// pattern the API route tests use.
const h = vi.hoisted(() => ({ replace: vi.fn(), search: '', consent: true }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: h.replace, push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(h.search),
}));

vi.mock('@/app/utils/analytics', () => ({
  trackEvent: vi.fn(),
  trackEcommerce: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/app/utils/consent', () => ({ hasConsent: () => h.consent }));

import Checkout from './Checkout';

const tracked = vi.mocked(trackEvent);
const ecom = vi.mocked(trackEcommerce);
const ecomNames = () => ecom.mock.calls.map(([name]) => name);

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
        isCartReady: true,
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
  h.search = '';
  h.consent = true;
  localStorage.clear();
});

describe('Checkout tracking', () => {
  it('no longer reports shipping on the button press, and never the retired place_order', () => {
    // Feature 040, D3: `add_shipping_info` moved from the press to the server's
    // acceptance, so the button carries no declarative marker any more.
    renderCheckout();

    expect(submitButton()).not.toHaveAttribute('data-track');
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
    // AC6: a rejected order reports neither checkout step.
    expect(ecomNames()).not.toContain('add_shipping_info');
    expect(ecomNames()).not.toContain('add_payment_info');
  });
});

const TWO: CartItem[] = [
  { ...ITEM, id: 1, brand: 'GOODYEAR', model: 'ASSURANCE', size: '205/55R16' },
  { ...ITEM, id: 2, price: 95.5, name: 'Michelin 225/65R17' },
];

const stubFetch = (response: { ok: boolean; status: number; body: unknown }) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status,
      json: async () => response.body,
    })
  );

describe('begin_checkout (feature 040, D4)', () => {
  it('is sent once when the page opens with a cart, with every item and the subtotal', async () => {
    const { rerender } = renderCheckout(TWO);
    await waitFor(() => expect(ecomNames()).toContain('begin_checkout'));
    rerender(<></>);

    const calls = ecom.mock.calls.filter(([n]) => n === 'begin_checkout');
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toMatchObject({ currency: 'USD', value: 175.5 });
    expect(calls[0][1].items.map((i: { item_id: string }) => i.item_id)).toEqual(['1', '2']);
  });

  it('is not sent for an empty cart', async () => {
    renderCheckout([]);
    await screen.findByText(/your cart is empty/i).catch(() => undefined);
    expect(ecomNames()).not.toContain('begin_checkout');
  });

  it('is not sent on the confirmation page', async () => {
    h.search = 'success=1&session_id=cs_test_1';
    stubFetch({
      ok: true,
      status: 200,
      body: { id: 'cs_test_1', payment_status: 'unpaid', items: [] },
    });
    renderCheckout(TWO);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(ecomNames()).not.toContain('begin_checkout');
  });
});

describe('add_shipping_info / add_payment_info (feature 040, D2–D3)', () => {
  it('reports shipping then payment, then redirects to Stripe', async () => {
    const user = userEvent.setup({ delay: null });
    const assign = vi.fn();
    stubFetch({ ok: true, status: 200, body: { url: 'https://checkout.stripe.com/x' } });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign },
    });

    renderCheckout(TWO);
    await choosePickup(user);
    ecom.mockClear();
    await user.click(submitButton());

    await waitFor(() => expect(assign).toHaveBeenCalled());
    expect(ecomNames()).toEqual(['add_shipping_info', 'add_payment_info']);
    expect(ecom.mock.calls[0][1]).toMatchObject({ shipping_tier: 'pickup', value: 175.5 });
    expect(ecom.mock.calls[1][1]).toMatchObject({ payment_type: 'card' });
    expect(ecom.mock.calls[1][2]).toEqual({ waitMs: 600 });
    // The redirect waits for the payment event.
    expect(ecom.mock.invocationCallOrder[1]).toBeLessThan(assign.mock.invocationCallOrder[0]);
  });

  it('reports shipping but never payment for a WhatsApp hand-off', async () => {
    const user = userEvent.setup({ delay: null });
    stubFetch({ ok: true, status: 200, body: { whatsappUrl: 'https://wa.me/1' } });

    renderCheckout(TWO);
    await choosePickup(user);
    ecom.mockClear();
    await user.click(submitButton());

    await waitFor(() => expect(ecomNames()).toContain('add_shipping_info'));
    expect(ecomNames()).not.toContain('add_payment_info');
  });

  it('reports neither when the server fails', async () => {
    const user = userEvent.setup({ delay: null });
    stubFetch({ ok: false, status: 500, body: { message: 'boom' } });

    renderCheckout(TWO);
    await choosePickup(user);
    ecom.mockClear();
    await user.click(submitButton());

    await waitFor(() => expect(screen.getByText(/boom/i)).toBeInTheDocument());
    expect(ecom).not.toHaveBeenCalled();
  });
});

describe('purchase (feature 040, D1)', () => {
  const paidSession = {
    id: 'cs_test_paid',
    payment_status: 'paid',
    amount_total: 25787,
    currency: 'usd',
    shipping_total: 0,
    tax_total: 1687,
    items: [
      {
        id: 'li_1',
        productId: '259893',
        description: '(259893) | MICHELIN | DEFENDER | 225/65R17',
        condition: 'Used',
        quantity: 2,
        amount_total: 24100,
        currency: 'USD',
        brand: 'MICHELIN',
        model: 'DEFENDER',
        size: '225/65R17',
      },
      {
        id: 'li_tax',
        productId: 'tax',
        description: 'Sales tax (7%)',
        condition: 'n/a',
        quantity: 1,
        amount_total: 1687,
        currency: 'USD',
      },
    ],
  };

  const purchases = () => ecom.mock.calls.filter(([n]) => n === 'purchase');

  it('is sent once for a paid session, to GA only, without the tax line', async () => {
    h.search = 'success=1&session_id=cs_test_paid';
    stubFetch({ ok: true, status: 200, body: paidSession });
    renderCheckout([]);

    await waitFor(() => expect(purchases()).toHaveLength(1));
    const [, payload, opts] = purchases()[0];
    expect(payload).toMatchObject({
      transaction_id: 'cs_test_paid',
      value: 257.87,
      tax: 16.87,
      shipping: 0,
      currency: 'USD',
    });
    expect(payload.items).toHaveLength(1);
    expect(opts).toEqual({ vercel: false });
  });

  it('is not sent again when the confirmation page is reloaded', async () => {
    h.search = 'success=1&session_id=cs_test_paid';
    stubFetch({ ok: true, status: 200, body: paidSession });
    const first = renderCheckout([]);
    await waitFor(() => expect(purchases()).toHaveLength(1));
    first.unmount();

    renderCheckout([]);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await screen.findByText(/payment successful/i);
    expect(purchases()).toHaveLength(1);
  });

  it('is not marked as sent when there was no consent', async () => {
    h.consent = false;
    h.search = 'success=1&session_id=cs_test_paid';
    stubFetch({ ok: true, status: 200, body: paidSession });
    renderCheckout([]);
    await waitFor(() => expect(purchases()).toHaveLength(1));
    expect(localStorage.getItem('ga-purchase:cs_test_paid')).toBeNull();
  });

  it('is not sent for a session that is not paid', async () => {
    h.search = 'success=1&session_id=cs_test_open';
    stubFetch({
      ok: true,
      status: 200,
      body: { ...paidSession, id: 'cs_test_open', payment_status: 'unpaid' },
    });
    renderCheckout([]);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await screen.findByText(/payment successful/i);
    expect(purchases()).toHaveLength(0);
  });

  it('is not sent when the shopper cancelled on Stripe', async () => {
    h.search = 'canceled=1';
    stubFetch({ ok: true, status: 200, body: paidSession });
    renderCheckout(TWO);
    await waitFor(() => expect(ecomNames()).toContain('begin_checkout'));
    expect(purchases()).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
  });
});
