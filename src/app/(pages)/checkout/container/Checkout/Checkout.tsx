'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { useCart } from '@/app/context/CartContext';
import { LoadingScreen } from '@/app/ui/components';
import ProductMeta from '@/app/ui/components/ProductMeta/ProductMeta';

const TAX_RATE = (() => {
  if (typeof process !== 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_TAX_RATE;
    const parsed = fromEnv ? parseFloat(fromEnv) : NaN;
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed; // accepts 0 to disable
  }
  return 0;
})();

const currency = (n: number) => `$${n.toFixed(2)}`;

function formatCents(amountInCents: number, currencyCode: string | undefined) {
  const code = (currencyCode || 'USD').toUpperCase();
  const amount = (amountInCents || 0) / 100;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export default function Checkout() {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showCancelBanner, setShowCancelBanner] = React.useState(false);
  const [orderState, setOrderState] = React.useState<'idle' | 'success' | 'whatsapp'>('idle');
  // Stripe session details when returning from Stripe
  const [sessionDetails, setSessionDetails] = React.useState<null | {
    id: string;
    created: string | null;
    customer_email: string | null;
    payment_status: string | null;
    amount_total: number | null;
    currency: string | null;
    receipt_url: string | null;
    payment_method: string | null;
    items: Array<{
      id: string;
      productId: string | null;
      condition: string | null;
      description: string;
      quantity: number;
      amount_total: number;
      currency: string;
    }>;
  }>(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [infoExpanded, setInfoExpanded] = React.useState(false);

  const taxes = Math.max(0, cartTotal * TAX_RATE);
  const total = cartTotal + taxes;

  const isEmpty = cartItems.length === 0;

  const stripeEnabled = (process.env.NEXT_PUBLIC_ENABLE_STRIPE || '').toLowerCase() === 'true';

  // Detect checkout return states
  const success = (searchParams.get('success') || '') === '1';
  const canceled = (searchParams.get('canceled') || '') === '1';
  const whatsappFlag = (searchParams.get('whatsapp') || '') === '1';
  const sessionId = searchParams.get('session_id') || '';
  const [resolvingReturn, setResolvingReturn] = React.useState<boolean>(
    success || canceled || whatsappFlag
  );

  const clearedRef = React.useRef(false);
  React.useEffect(() => {
    // Show cancel banner if canceled
    setShowCancelBanner(canceled);

    // On success (Stripe) or whatsapp=1, clear cart and set success state
    if ((success || whatsappFlag) && !clearedRef.current) {
      const key = `order-cleared-key`;
      if (success) {
        // Deduplicate via session id
        const token = `stripe:${sessionId || 'ok'}`;
        const last = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        if (last !== token) {
          clearCart();
          if (typeof window !== 'undefined') localStorage.setItem(key, token);
        }
        setOrderState('success');
      } else if (whatsappFlag) {
        // Always clear for WhatsApp to avoid blocking future orders
        clearCart();
        setOrderState('whatsapp');
      }
      clearedRef.current = true;
    } else if (!success && !whatsappFlag) {
      setOrderState('idle');
    }
    // End of initial URL param resolving
    setResolvingReturn(false);
  }, [success, whatsappFlag, sessionId, canceled, clearCart]);

  // Load Stripe session details on success
  React.useEffect(() => {
    let active = true;
    async function load() {
      if (orderState !== 'success' || !sessionId) return;
      try {
        setDetailsLoading(true);
        setDetailsError(null);
        const res = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || `Failed to load order details (${res.status})`);
        }
        const json = await res.json();

        if (active) {
          setSessionDetails(json);
        }
      } catch (e: any) {
        if (active) setDetailsError(e?.message || 'Unable to load order details');
      } finally {
        if (active) setDetailsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [orderState, sessionId]);

  // Loading overlay logic
  const showLoader = resolvingReturn || detailsLoading || loading;
  const loaderMsg = (() => {
    if (resolvingReturn) {
      if (success) return 'Finalizing your payment...';
      if (canceled) return 'Confirming cancellation...';
      if (whatsappFlag) return 'Confirming your order...';
      return 'Please wait...';
    }
    if (detailsLoading) return 'Loading order details...';
    if (loading) return stripeEnabled ? 'Redirecting to payment...' : 'Opening WhatsApp...';
    return 'Loading...';
  })();

  const proceedToPayment = async () => {
    if (isEmpty || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        const details = data?.unavailable?.map((u: any) => u.id).join(', ');
        setError(
          details
            ? `Some items in your cart are unavailable: ${details}`
            : 'Some items are unavailable.'
        );
        return;
      }

      if (res.status === 501) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Payment gateway is not configured.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Failed to start payment. Please try again.');
        return;
      }

      const data = await res.json();
      if (data?.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
        // Reflect order initiation on the current page
        router.replace('/checkout?whatsapp=1');
        return;
      }
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      setError('Failed to start checkout. Please try again.');
    } catch (e: any) {
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success / WhatsApp confirmation view
  if (orderState !== 'idle') {
    if (orderState === 'success') {
      return (
        <main className="min-h-[70vh] bg-white">
          {showLoader && <LoadingScreen message={loaderMsg} />}
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start gap-3">
              <div
                className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"
                aria-hidden
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-7 w-7 text-green-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.724 5.29-2.02-2.02a.75.75 0 1 0-1.06 1.06l2.625 2.625a.75.75 0 0 0 1.13-.094l4.27-6.001Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment successful</h1>
                <p className="mt-1 text-gray-600">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
              </div>
            </div>

            {/* Reference row with copy */}
            <div className="mt-6 flex flex-wrap items-center gap-2 min-w-0">
              <span className="text-sm text-gray-500">Reference:</span>
              <span className="font-mono text-sm bg-gray-50 border border-gray-200 rounded px-2 py-0.5 break-all max-w-full w-full sm:w-auto">
                {sessionId}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(sessionId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    // no-op
                  }
                }}
                className="text-xs font-medium text-green-700 hover:text-green-800 border border-green-200 rounded px-2 py-1 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Copy reference"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-4 sm:p-5">
                {detailsLoading && <p className="text-sm text-gray-600">Loading order details…</p>}
                {detailsError && (
                  <div
                    className="rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-sm p-3"
                    role="alert"
                  >
                    {detailsError}
                  </div>
                )}
                {sessionDetails && (
                  <div className="space-y-6">
                    {/* Summary header */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                        <span className="text-gray-600">Payment status</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sessionDetails.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {sessionDetails.payment_status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                        <span className="text-gray-600">Customer</span>
                        <span className="text-gray-900">
                          {sessionDetails.customer_email || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                        <span className="text-gray-600">Date</span>
                        <span className="text-gray-900">
                          {sessionDetails.created
                            ? new Date(sessionDetails.created).toLocaleString('en-US')
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                        <span className="text-gray-600">Total</span>
                        <span className="text-gray-900 font-semibold">
                          {formatCents(
                            sessionDetails.amount_total || 0,
                            sessionDetails.currency || undefined
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900 mb-2">Items</h2>
                      <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                        {sessionDetails.items.map(it => (
                          <li key={it.id} className="p-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-gray-900">{it.description}</p>
                              <div className="text-xs text-gray-500 flex flex-wrap gap-2 items-center mt-1">
                                <span>Qty {it.quantity}</span>
                                {it.condition && (
                                  <span
                                    className={
                                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ' +
                                      (((it.condition || '') as string)
                                        .toString()
                                        .trim()
                                        .toLowerCase() === 'new' ||
                                      ((it.condition || '') as string)
                                        .toString()
                                        .trim()
                                        .toLowerCase() === 'nuevo'
                                        ? 'bg-green-50 text-green-700 ring-green-200'
                                        : 'bg-slate-50 text-slate-700 ring-slate-200')
                                    }
                                  >
                                    {(() => {
                                      const c = (it.condition || '').toString().toLowerCase();
                                      if (c === 'new') return 'NEW';
                                      if (c === 'used') return 'USED';
                                      if (c === 'sold') return 'SOLD';
                                      return (it.condition || '').toString();
                                    })()}
                                  </span>
                                )}
                                {it.productId && (
                                  <span className="font-mono bg-gray-50 border border-gray-200 rounded px-1 py-0.5">
                                    ID: {it.productId}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCents(it.amount_total, it.currency)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Receipt link */}
                    {sessionDetails.receipt_url && (
                      <div>
                        <a
                          href={sessionDetails.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                        >
                          View receipt
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/search-results"
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Continue shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-green-200 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Go to home
              </Link>
            </div>
          </div>
        </main>
      );
    }

    // WhatsApp confirmation view remains simple
    return (
      <main className="min-h-[70vh] bg-white">
        {showLoader && <LoadingScreen message={loaderMsg} />}
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div
            className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center"
            aria-hidden
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.724 5.29-2.02-2.02a.75.75 0 1 0-1.06 1.06l2.625 2.625a.75.75 0 0 0 1.13-.094l4.27-6.001Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Order sent via WhatsApp
          </h1>
          <p className="mt-2 text-gray-600">
            We opened WhatsApp in a new tab with your order details. Our team will reach out to
            confirm your request.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search-results"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              Continue shopping
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-green-200 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              Go to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-white">
      {showLoader && <LoadingScreen message={loaderMsg} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Review your cart and complete your order.</p>
        </header>

        {showCancelBanner && (
          <div
            className="mb-6 flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            role="status"
            aria-live="polite"
          >
            <p className="pr-2">Checkout was canceled. You can review your cart and try again.</p>
            <button
              type="button"
              onClick={() => setShowCancelBanner(false)}
              className="shrink-0 inline-flex items-center justify-center rounded-md border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Dismiss cancel message"
            >
              Dismiss
            </button>
          </div>
        )}

        {isEmpty ? (
          <section
            aria-live="polite"
            className="rounded-lg border border-dashed border-gray-200 p-10 text-center"
          >
            <p className="text-gray-600">Your cart is empty.</p>
            <div className="mt-4">
              <Link
                href="/search-results"
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Browse products
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Item table */}
            <section className="lg:col-span-8 xl:col-span-9" aria-labelledby="cart-heading">
              <h2 id="cart-heading" className="sr-only">
                Items in cart
              </h2>
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                {/* Informational banner at the top of the products table */}
                <div
                  role="note"
                  aria-label="Checkout information"
                  className="bg-blue-50 text-blue-900 border-b border-blue-200 p-3 flex items-start gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-5 w-5 mt-0.5 shrink-0 text-blue-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 7.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm-.75 2.25a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="relative">
                      <p
                        id="checkout-info-text"
                        className={`text-sm leading-5 ${infoExpanded ? '' : 'max-h-10 overflow-hidden'}`}
                      >
                        During checkout you will be redirected to complete your order. We will ask for your contact and shipping details (name, address and phone) and your payment information. This information is requested to comply with our terms of service and to properly process and ship your order. We will notify you by email or phone with the carrier tracking guide/number once your order has been dispatched. By proceeding, you agree to our{' '}
                        <Link
                          href="/legal-policies#terms"
                          className="underline font-medium text-green-700 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                        >
                          Terms & Conditions
                        </Link>
                        .
                      </p>
                      {!infoExpanded && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-blue-50 to-transparent" />
                      )}
                    </div>
                    <button
                      type="button"
                      aria-expanded={infoExpanded}
                      aria-controls="checkout-info-text"
                      onClick={() => setInfoExpanded(prev => !prev)}
                      className="mt-1 inline-flex items-center cursor-pointer text-xs font-medium text-green-700 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                    >
                      {infoExpanded ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Subtotal
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {cartItems.map(item => {
                        const lineTotal = item.price * item.quantity;
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={64}
                                      height={64}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                                      No image
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link
                                    href={`/detail?productId=${encodeURIComponent(String(item.id))}`}
                                    className="font-medium text-gray-900 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                  >
                                    {item.name}
                                  </Link>
                                  <ProductMeta
                                    brand={item.brand}
                                    condition={item.condition}
                                    className="mt-0.5"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-left text-gray-600">
                              <span className="font-mono text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5 inline-block">
                                {String(item.id)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right text-gray-700">
                              {currency(item.price)}
                            </td>
                            <td className="px-4 py-4 text-center text-gray-700">{item.quantity}</td>
                            <td className="px-4 py-4 text-right font-medium text-gray-900">
                              {currency(lineTotal)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="inline-flex items-center cursor-pointer rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Order summary */}
            <aside
              className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4"
              aria-labelledby="summary-heading"
            >
              <h2 id="summary-heading" className="text-lg font-semibold text-gray-900">
                Order summary
              </h2>
              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">{currency(cartTotal)}</dd>
                  </div>
                  <div className="flex items-start justify-between">
                    <dt className="text-gray-600">
                      Taxes{' '}
                      {TAX_RATE > 0 && (
                        <span className="text-xs text-gray-500">
                          (VAT {Math.round(TAX_RATE * 100)}%)
                        </span>
                      )}
                    </dt>
                    <dd className="font-medium text-gray-900">{currency(taxes)}</dd>
                  </div>
                  <div className="mt-2 border-t border-gray-200 pt-2 flex items-center justify-between text-base">
                    <dt className="font-semibold text-gray-900">Total</dt>
                    <dd className="font-semibold text-gray-900">{currency(total)}</dd>
                  </div>
                </dl>
                {error && (
                  <div
                    className="my-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm p-3"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={proceedToPayment}
                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isEmpty || loading}
                    aria-disabled={isEmpty || loading}
                  >
                    {loading
                      ? 'Processing…'
                      : stripeEnabled
                        ? 'Proceed to payment'
                        : 'Send order via WhatsApp'}
                  </button>
                  <Link
                    href="/search-results"
                    className="inline-flex w-full items-center justify-center rounded-md border border-green-200 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Taxes are estimates and may vary at checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
