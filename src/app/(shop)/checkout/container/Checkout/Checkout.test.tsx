import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CartContext, type CartItem } from '@/app/context/CartContext';
import { VisitorCityProvider } from '@/app/context/VisitorCityContext';
import { trackEcommerce, trackEvent } from '@/app/utils/analytics';
import { writeGuess } from '@/app/utils/visitorCity';

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
        addSetToCart: vi.fn(),
        removeFromCart: vi.fn(),
        removeSet: vi.fn(),
        replaceInCart: vi.fn(),
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

describe('tire sets at checkout (feature 041)', () => {
  const api = {
    removeFromCart: vi.fn(),
    removeSet: vi.fn(),
    replaceInCart: vi.fn(),
  };
  const renderWith = (cartItems: CartItem[]) =>
    render(
      <CartContext.Provider
        value={{
          cartItems,
          addToCart: vi.fn(),
          addSetToCart: vi.fn(),
          clearCart: vi.fn(),
          isInCart: () => false,
          cartCount: cartItems.length,
          cartTotal: cartItems.reduce((n, i) => n + i.price * i.quantity, 0),
          showCartModal: false,
          setShowCartModal: vi.fn(),
          isCartReady: true,
          ...api,
        }}
      >
        <Checkout />
      </CartContext.Provider>
    );

  const tire = (id: string, over: Partial<CartItem> = {}): CartItem => ({
    ...ITEM,
    id,
    name: `(${id}) | MICHELIN | 225/65/17`,
    brand: 'MICHELIN',
    model: 'DEFENDER',
    size: '225/65/17',
    ...over,
  });

  beforeEach(() => {
    api.removeFromCart.mockClear();
    api.removeSet.mockClear();
    api.replaceInCart.mockClear();
  });

  const storeOptions = () =>
    Array.from((screen.getByLabelText('Choose a store for pick-up') as HTMLSelectElement).options)
      .map(o => o.textContent ?? '')
      .filter(t => t !== 'Select a store…');

  it('offers only Orlando stores for an Orlando cart (AC8)', async () => {
    const user = userEvent.setup({ delay: null });
    renderWith([
      tire('1', { city: 'Orlando', setId: 's' }),
      tire('2', { city: 'Orlando', setId: 's' }),
    ]);
    await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
    expect(storeOptions().length).toBeGreaterThan(0);
    expect(storeOptions().every(t => /Orlando/.test(t))).toBe(true);
    expect(screen.getByText(/only Orlando stores are shown/)).toBeInTheDocument();
  });

  it('hides Miami stores for a single Orlando tire too (AC10)', async () => {
    const user = userEvent.setup({ delay: null });
    renderWith([tire('1', { city: 'Orlando' })]);
    await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
    expect(storeOptions().some(t => /Cutler Bay|Hialeah|Coral Gables/.test(t))).toBe(false);
  });

  it('explains why pickup is impossible only once pickup is chosen (AC9)', async () => {
    const user = userEvent.setup({ delay: null });
    renderWith([tire('1', { city: 'Orlando' }), tire('2', { city: 'Miami' })]);
    // Nothing chosen yet: no notice, no state, no store, and no way to pay.
    expect(screen.queryByText(/Store pickup isn’t available/)).toBeNull();
    expect(screen.queryByLabelText(/Shipping State/i)).toBeNull();
    expect(submitButton()).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
    expect(screen.getByText(/Store pickup isn’t available for this cart/)).toBeInTheDocument();
    expect(screen.getByText(/tires are in Orlando \(1\) and Miami \(1\)/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Choose a store for pick-up')).toBeNull();
    expect(submitButton()).toBeDisabled();
    // Delivery hides the notice and asks for the state instead.
    await user.click(screen.getByRole('radio', { name: /delivery to my address/i }));
    expect(screen.queryByText(/Store pickup isn’t available/)).toBeNull();
    expect(screen.getByLabelText(/Shipping State/i)).toBeInTheDocument();
  });

  it('asks for the state only with delivery, and the store only with pickup', async () => {
    const user = userEvent.setup({ delay: null });
    renderWith([tire('1', { city: 'Miami' })]);
    expect(screen.queryByLabelText(/Shipping State/i)).toBeNull();
    expect(screen.queryByLabelText('Choose a store for pick-up')).toBeNull();
    await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
    expect(screen.getByLabelText('Choose a store for pick-up')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Shipping State/i)).toBeNull();
  });

  it('marks the odd-city tire and removes it from the pickup notice', async () => {
    const user = userEvent.setup({ delay: null });
    renderWith([
      tire('1', { city: 'Miami', setId: 's' }),
      tire('2', { city: 'Miami', setId: 's' }),
      tire('3', { city: 'Orlando' }),
    ]);
    // The set shows its city once; the single shows its own.
    expect(screen.getAllByText('Miami')).toHaveLength(1);
    expect(screen.getByText('Orlando').closest('span.bg-amber-100')).not.toBeNull();
    expect(screen.getByText('Miami').closest('span.bg-amber-100')).toBeNull();
    await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
    await user.click(screen.getByRole('button', { name: 'Remove the Orlando tire (1)' }));
    expect(api.removeFromCart).toHaveBeenCalledWith('3');
    // The shopper's choice is a removal (046, AC6), reported once.
    const removals = ecom.mock.calls.filter(([n]) => n === 'remove_from_cart');
    expect(removals).toHaveLength(1);
    expect(removals[0][1].items.map((i: { item_id: string }) => i.item_id)).toEqual(['3']);
  });

  it('groups a set in the order table with its total and a Remove set action', async () => {
    const user = userEvent.setup({ delay: null });
    renderWith([tire('1', { setId: 's', tread: 9 }), tire('2', { setId: 's', tread: 10 })]);
    expect(screen.getByText(/Set of 2 · \$160\.00/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove set of 2 from cart' }));
    expect(api.removeSet).toHaveBeenCalledWith('s');
    const removals = ecom.mock.calls.filter(([n]) => n === 'remove_from_cart');
    expect(removals).toHaveLength(1);
    expect(removals[0][1].items).toHaveLength(2);
    // /checkout sends begin_checkout, never view_cart (046, D3).
    expect(ecomNames()).not.toContain('view_cart');
  });

  const sold409 = (replacement: unknown) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.startsWith('/api/tire-sets/replacement')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              replacement,
              product: { brand: 'MICHELIN', model2: 'DEFENDER', size: '225/65/17' },
            }),
          };
        }
        return {
          ok: false,
          status: 409,
          json: async () => ({
            unavailable: [{ id: '2', reason: 'Product is already sold', code: 'sold' }],
          }),
        };
      })
    );

  it('offers a replacement for a set tire that sold, and swaps it in on accept (AC11)', async () => {
    const user = userEvent.setup({ delay: null });
    sold409({ id: '9', price: 85, tread: 9, patched: false, condition: 'Used', city: 'Miami' });
    renderWith([
      tire('1', { setId: 's', city: 'Miami' }),
      tire('2', { setId: 's', city: 'Miami' }),
    ]);
    await choosePickup(user);
    await user.click(submitButton());

    await screen.findByText(/A matching tire is available: 9\/32 · no patch · \$85\.00/);
    expect(api.removeFromCart).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Use this tire instead' }));
    expect(api.replaceInCart).toHaveBeenCalledWith(
      '2',
      expect.objectContaining({ id: '9', model: 'DEFENDER', city: 'Miami' })
    );
  });

  it('removes a sold set tire and says the set is smaller when nothing fits (AC11)', async () => {
    const user = userEvent.setup({ delay: null });
    sold409(null);
    renderWith([
      tire('1', { setId: 's', city: 'Miami' }),
      tire('2', { setId: 's', city: 'Miami' }),
    ]);
    await choosePickup(user);
    await user.click(submitButton());

    await screen.findByText(
      /No matching tire is left, so it was removed\. Your set is now 1 tire\./
    );
    expect(api.removeFromCart).toHaveBeenCalledWith('2');
    // The site removed a sold tire: not the shopper's removal (046, AC7).
    expect(ecomNames()).not.toContain('remove_from_cart');
  });
});

describe('nearest pickup store (feature 043)', () => {
  const renderCity = (cartItems: CartItem[]) =>
    render(
      <VisitorCityProvider>
        <CartContext.Provider
          value={{
            cartItems,
            addToCart: vi.fn(),
            addSetToCart: vi.fn(),
            clearCart: vi.fn(),
            isInCart: () => false,
            cartCount: cartItems.length,
            cartTotal: cartItems.reduce((n, i) => n + i.price * i.quantity, 0),
            showCartModal: false,
            setShowCartModal: vi.fn(),
            isCartReady: true,
            removeFromCart: vi.fn(),
            removeSet: vi.fn(),
            replaceInCart: vi.fn(),
          }}
        >
          <Checkout />
        </CartContext.Provider>
      </VisitorCityProvider>
    );
  const tire = (id: string, city: 'Miami' | 'Orlando'): CartItem => ({ ...ITEM, id, city });
  const store = () => screen.getByLabelText('Choose a store for pick-up') as HTMLSelectElement;
  const pickup = async () => {
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('radio', { name: /pick up in store/i }));
    return user;
  };

  beforeEach(() => localStorage.clear());

  it('preselects the nearest Miami store for a Miami visitor with Miami tires (AC6)', async () => {
    writeGuess('Miami', 'location-5');
    renderCity([tire('1', 'Miami'), tire('2', 'Miami')]);
    const user = await pickup();
    await waitFor(() => expect(store().value).toBe('location-5'));
    // …and the shopper can still change it.
    await user.selectOptions(store(), 'location-1');
    expect(store().value).toBe('location-1');
  });

  it.each([
    ['an Orlando cart', () => writeGuess('Miami', 'location-5'), ['Orlando']],
    ['no estimated city', () => writeGuess(null, null), ['Miami']],
  ] as const)('preselects nothing for %s (AC7)', async (_label, setup, cities) => {
    setup();
    renderCity(cities.map((c, i) => tire(String(i + 1), c)));
    await pickup();
    await new Promise(r => setTimeout(r, 0));
    expect(store().value).toBe('');
  });
});
