'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useCart } from '@/app/context/CartContext';

const TAX_RATE = (() => {
  if (typeof process !== 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_TAX_RATE;
    const parsed = fromEnv ? parseFloat(fromEnv) : NaN;
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed; // accepts 0 to disable
  }
  return 0;
})();

const currency = (n: number) => `$${n.toFixed(2)}`;

export default function CheckoutPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  const taxes = Math.max(0, cartTotal * TAX_RATE);
  const total = cartTotal + taxes;

  const isEmpty = cartItems.length === 0;

  return (
    <main className="min-h-[70vh] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Review your cart and complete your order.</p>
        </header>

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
            {/* Items table */}
            <section className="lg:col-span-8 xl:col-span-9" aria-labelledby="cart-heading">
              <h2 id="cart-heading" className="sr-only">
                Items in cart
              </h2>
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
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
                                  {item.brand && (
                                    <p className="mt-0.5 text-sm text-gray-500">{item.brand}</p>
                                  )}
                                </div>
                              </div>
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
                                className="inline-flex items-center rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isEmpty}
                    aria-disabled={isEmpty}
                  >
                    Proceed to payment
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
