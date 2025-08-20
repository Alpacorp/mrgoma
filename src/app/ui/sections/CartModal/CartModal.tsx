'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { FC } from 'react';

import { useCart } from '@/app/context/CartContext';
import { XMarkIcon } from '@/app/ui/components';
import { Dialog, DialogBackdrop, DialogPanel } from '@/app/ui/components/Dialog/Dialog';

const CartModal: FC = () => {
  const { cartItems, removeFromCart, cartTotal, showCartModal, setShowCartModal } = useCart();

  const closeModal = () => {
    setShowCartModal(false);
  };

  return (
    <Dialog
      open={showCartModal}
      onCloseAction={closeModal}
      className="fixed inset-0 z-50 overflow-y-auto animate-slide-in-right"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" transition={true} />
      <div className="flex h-full justify-end animate-slide-in-right">
        <DialogPanel
          className="w-full sm:max-w-md bg-white shadow-xl h-full overflow-y-auto animate-slide-in-right sm:rounded-l-2xl ring-1 ring-black/5"
          transition={true}
        >
          <div className="flex flex-col h-full animate-slide-in-right">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
              <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
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
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="py-3 flex gap-3 -mx-2 px-2 rounded-md hover:bg-gray-50 transition-colors group">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden group-hover:ring-1 group-hover:ring-green-200">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-center object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">${item.price.toFixed(2)}</p>
                          </div>
                          {item.brand && <p className="mt-1 text-sm text-gray-500">{item.brand}</p>}
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                          <button
                            type="button"
                            className="font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 border-t border-gray-200 p-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
              <div className="flex items-center justify-between text-base font-semibold text-gray-900 mb-3" aria-live="polite">
                <p>Subtotal</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <Link
                href="/checkout"
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
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default CartModal;
