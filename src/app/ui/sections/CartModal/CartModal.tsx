'use client';

import React, { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useCart, type CartItem } from '@/app/context/CartContext';
import { XMarkIcon } from '@/app/ui/components';
import CityTag from '@/app/ui/components/CityTag/CityTag';
import { Dialog, DialogBackdrop, DialogPanel } from '@/app/ui/components/Dialog/Dialog';
import ProductMeta from '@/app/ui/components/ProductMeta/ProductMeta';
import { cartLine } from '@/app/utils/cartLine';
import { groupCartLines, oddCity } from '@/app/utils/cartSets';
import { GENERIC_TIRE_IMAGE } from '@/app/utils/genericTireImage';
import { tireDetailHref } from '@/app/utils/tireSlug';

/** One tire in the drawer — the same markup for single tires and set members. */
const CartLine: FC<{
  item: CartItem;
  onRemove: (id: string | number) => void;
  onOpen: () => void;
  /** Show the city (set members show it once, in the set header). */
  city?: { odd: boolean };
}> = ({ item, onRemove, onOpen, city }) => (
  <li className="py-3 flex gap-3 -mx-2 px-2 rounded-md hover:bg-gray-50 transition-colors group">
    {/* Product Image — a second, mouse-only way into the tire's page */}
    <Link
      href={tireDetailHref(item)}
      onClick={onOpen}
      tabIndex={-1}
      aria-hidden="true"
      className="shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden group-hover:ring-1 group-hover:ring-green-200"
    >
      <Image
        src={item.image || GENERIC_TIRE_IMAGE}
        alt={cartLine(item).title}
        width={64}
        height={64}
        className="w-full h-full object-center object-cover"
      />
    </Link>

    {/* Product Details */}
    <div className="ml-4 flex-1 flex flex-col">
      <div>
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>
            <Link
              href={tireDetailHref(item)}
              onClick={onOpen}
              className="underline-offset-2 hover:text-green-700 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              {cartLine(item).title}
            </Link>
          </h3>
          <p className="ml-4">${item.price.toFixed(2)}</p>
        </div>
        {cartLine(item).size && <p className="text-sm text-gray-500">{cartLine(item).size}</p>}
        {/* Condition and city side by side, so the line does not grow. */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ProductMeta condition={item.condition} className="mt-0!" />
          {city ? <CityTag city={item.city} odd={city.odd} /> : null}
        </div>
        {cartLine(item).code && <p className="text-xs text-gray-400">{cartLine(item).code}</p>}
      </div>
      <div className="flex-1 flex items-end justify-between text-sm">
        <p className="text-gray-500">Qty {item.quantity}</p>
        <button
          type="button"
          className="font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer inline-flex items-center min-h-[44px] py-2 -my-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name} from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  </li>
);

const CartModal: FC<{ footer?: React.ReactNode }> = ({ footer }) => {
  const { cartItems, removeFromCart, removeSet, cartTotal, showCartModal, setShowCartModal } =
    useCart();

  const odd = oddCity(cartItems);

  const closeModal = () => {
    setShowCartModal(false);
  };

  return (
    <Dialog
      open={showCartModal}
      onCloseAction={closeModal}
      ariaLabelledby="cart-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <DialogBackdrop
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        transition={true}
      />
      <div className="flex h-full justify-end">
        <DialogPanel
          className="w-full sm:max-w-md bg-white shadow-xl h-full overflow-y-auto animate-slide-in-right sm:rounded-l-2xl ring-1 ring-black/5"
          transition={true}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
              <h2 id="cart-modal-title" className="text-lg font-semibold text-gray-900">
                Your Cart
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                onClick={closeModal}
                title="Close cart"
                aria-label="Close cart"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div
                    className="sr-only"
                    aria-live="polite"
                  >{`Items in cart: ${cartItems.length}`}</div>
                  <ul className="divide-y divide-gray-200" aria-label="Cart items">
                    {groupCartLines(cartItems).map(group =>
                      group.kind === 'single' ? (
                        <CartLine
                          key={group.item.id}
                          item={group.item}
                          onRemove={removeFromCart}
                          onOpen={closeModal}
                          city={{ odd: odd?.city === group.item.city }}
                        />
                      ) : (
                        <li key={group.setId} className="py-3">
                          {/* A set is one framed card, so a single tire after it
                              cannot be read as part of it. */}
                          <div className="rounded-lg border-2 border-green-600/70 bg-green-50/50">
                            <div className="flex items-center justify-between gap-2 rounded-t-md bg-green-600/10 px-3 text-sm">
                              <p className="font-semibold text-green-900">
                                {`Set of ${group.items.length} · $${group.total.toFixed(2)}`}
                                {group.range ? (
                                  <span className="ml-1 font-normal text-green-900/80">
                                    {` · tread ${group.range}`}
                                  </span>
                                ) : null}
                                <CityTag
                                  city={group.items[0].city}
                                  odd={odd?.city === group.items[0].city}
                                  className="ml-2 align-middle"
                                />
                              </p>
                              <button
                                type="button"
                                className="inline-flex min-h-[44px] items-center rounded-md font-medium text-gray-600 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                onClick={() => removeSet(group.setId)}
                                aria-label={`Remove set of ${group.items.length} from cart`}
                              >
                                Remove set
                              </button>
                            </div>
                            <ul
                              className="divide-y divide-green-100 px-3"
                              aria-label={`Set of ${group.items.length}`}
                            >
                              {group.items.map(item => (
                                <CartLine
                                  key={item.id}
                                  item={item}
                                  onRemove={removeFromCart}
                                  onOpen={closeModal}
                                />
                              ))}
                            </ul>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}
            </div>

            {/* Footer */}
            {footer !== undefined ? (
              footer
            ) : (
              <div className="sticky bottom-0 z-10 border-t border-gray-200 p-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
                <div
                  className="flex items-center justify-between text-base font-semibold text-gray-900 mb-3"
                  aria-live="polite"
                >
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
                <Link
                  href="/checkout"
                  aria-disabled={cartItems.length === 0}
                  role={cartItems.length === 0 ? 'link' : undefined}
                  tabIndex={cartItems.length === 0 ? -1 : 0}
                  className={`flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                    cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={e => {
                    if (cartItems.length === 0) {
                      e.preventDefault();
                    } else {
                      closeModal();
                    }
                  }}
                >
                  Checkout
                </Link>
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    className="text-sm font-semibold text-green-700 hover:text-green-800 cursor-pointer px-4 py-2 rounded-md border border-green-200 hover:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    onClick={closeModal}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CartModal;
