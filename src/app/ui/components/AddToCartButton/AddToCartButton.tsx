'use client';

import { FC, SyntheticEvent } from 'react';

import { useCart } from '@/app/context/CartContext';
import { SingleTire } from '@/app/interfaces/tires';
import { CtaButton } from '@/app/ui/components';

interface AddToCartButtonProps {
  product: SingleTire;
}

/**
 * Client island for the add-to-cart action. Extracted from `TireInformation` so
 * the surrounding product info (name, price, specs, description) can render on
 * the server; only this button needs the cart context on the client.
 */
const AddToCartButton: FC<AddToCartButtonProps> = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const productInCart = isInCart(product.id);

  const handleAddToCart = (event: SyntheticEvent) => {
    event.preventDefault();
    addToCart(product);
  };

  return (
    <div className="flex gap-2">
      <CtaButton
        product={product}
        text={productInCart ? 'In Cart' : 'Add to Cart'}
        // Filled brand green while it is the thing to do, outlined once the tire
        // is in the cart. `CtaButton`'s disabled styles force `!text-gray-500`,
        // which over a `bg-green-600` at 50% opacity is unreadable — so the fill
        // is dropped exactly when the button stops being actionable.
        style={productInCart ? 'primary' : 'filled'}
        onClick={handleAddToCart}
        disabled={productInCart}
        isLink={false}
      />
      <div className="sr-only" aria-live="polite" role="status">
        {productInCart ? 'This item is already in your cart.' : ''}
      </div>
    </div>
  );
};

export default AddToCartButton;
