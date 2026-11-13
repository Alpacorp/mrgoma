'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Define the cart item type
export interface CartItem {
  id: string | number;
  code?: string;
  name: string;
  price: number;
  condition?: string;
  image?: string;
  quantity: number;
  brand?: string;
  brandId?: string | number;
  /**
   * Model and size as their own fields, so a cart line can be written the way
   * the rest of the site writes a tire. Optional because items saved before
   * 2026-08-24 are still in `localStorage` without them — those fall back to
   * `name`, which is the only thing they carry.
   */
  model?: string;
  size?: string;
  /**
   * Feature 041. Lines added together as a set share an id; removing one leaves
   * the rest grouped. Absent on single tires and on every line saved before 041.
   */
  setId?: string;
  /** Where the tire is (never the warehouse). Absent on older lines. */
  city?: 'Miami' | 'Orlando';
  /** Tread in 32nds, for the set's range in the cart. */
  tread?: number | null;
  /** Remaining life, patch and DOT, to compare tires in the cart (047). */
  life?: string;
  patched?: boolean;
  dot?: string;
}

// Define the cart context type
export interface AddToCartProduct {
  id: string | number;
  code?: string;
  name: string;
  price: number | string;
  condition?: string;
  imageSrc?: string;
  images?: Array<{ src: string }>;
  brand?: string;
  brandId?: string | number;
  /**
   * Model and size as their own fields, so a cart line can be written the way
   * the rest of the site writes a tire. Optional because items saved before
   * 2026-08-24 are still in `localStorage` without them — those fall back to
   * `name`, which is the only thing they carry.
   */
  model?: string;
  size?: string;
  city?: 'Miami' | 'Orlando';
  tread?: number | null;
  life?: string;
  patched?: boolean;
  dot?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: AddToCartProduct) => void;
  /** Add every tire of a built set at once (feature 041). */
  addSetToCart: (lines: AddToCartProduct[], setId: string) => void;
  removeFromCart: (productId: string | number) => void;
  /** Remove every tire still carrying `setId`. */
  removeSet: (setId: string) => void;
  /** Swap one line for another, keeping its set (feature 041, sold-tire replacement). */
  replaceInCart: (oldId: string | number, replacement: AddToCartProduct) => void;
  clearCart: () => void;
  isInCart: (productId: string | number) => boolean;
  cartCount: number;
  cartTotal: number;
  showCartModal: boolean;
  setShowCartModal: (show: boolean) => void;
  /**
   * The stored cart has been read. Until then `cartItems` is the empty first
   * render, not the shopper's cart — anything that reports on the cart (e.g.
   * `begin_checkout`, feature 040) must wait for this.
   */
  isCartReady: boolean;
}

/** One cart line from a product, as `addToCart` builds it for a new tire. */
function toCartItem(product: AddToCartProduct, setId?: string): CartItem {
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  return {
    brand: product.brand,
    code: product.code,
    condition: product.condition,
    brandId: product.brandId,
    id: String(product.id),
    image: product.imageSrc || (product.images?.[0]?.src ?? undefined),
    name: product.name,
    model: product.model,
    size: product.size,
    city: product.city,
    tread: product.tread,
    life: product.life,
    patched: product.patched,
    dot: product.dot,
    price,
    quantity: 1,
    ...(setId ? { setId } : {}),
  };
}

// Create the cart context with default values
export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  addSetToCart: () => {},
  removeFromCart: () => {},
  removeSet: () => {},
  replaceInCart: () => {},
  clearCart: () => {},
  isInCart: () => false,
  cartCount: 0,
  cartTotal: 0,
  showCartModal: false,
  setShowCartModal: () => {},
  isCartReady: false,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  /**
   * Empty on the first render, on the server **and** on the client.
   *
   * This used to read `localStorage` inside the `useState` initialiser, guarded
   * by `typeof window !== 'undefined'` — which is the first cause React's own
   * hydration error lists. The server rendered "Add to Cart" and the client's
   * first render said "In Cart", so every product page logged a hydration error
   * for anyone with a cart, and the label flashed as React regenerated the tree.
   */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /**
   * Whether the stored cart has been read yet. **The save effect must not run
   * before it has**: it would write the first render's empty array over a real
   * cart and lose it. That ordering is the whole reason this flag exists.
   */
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  // Read the stored cart once, after mount, so the first client render matches
  // the server's.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
    } catch {
      // A corrupt payload used to throw here and take the whole app down.
      // Starting empty is recoverable; crashing is not.
    }
    setLoadedFromStorage(true);
  }, []);

  // Save the cart whenever it changes — but never before it has been read.
  useEffect(() => {
    if (!loadedFromStorage) return;
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems, loadedFromStorage]);

  // Add a product to the cart
  const addToCart = (product: AddToCartProduct) => {
    setCartItems(prevItems => {
      const prodId = String(product.id);
      // Check if the product is already in the cart (normalize id comparison)
      const existingItem = prevItems.find(item => String(item.id) === prodId);

      if (existingItem) {
        // If it exists, increase the quantity
        return prevItems.map(item =>
          String(item.id) === prodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If it doesn't exist, add it with quantity 1
        // Ensure price is a number
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

        return [
          ...prevItems,
          {
            brand: product.brand,
            code: product.code,
            condition: product.condition,
            brandId: product.brandId,
            id: prodId,
            image: product.imageSrc || (product.images?.[0]?.src ?? undefined),
            name: product.name,
            model: product.model,
            size: product.size,
            city: product.city,
            tread: product.tread,
            life: product.life,
            patched: product.patched,
            dot: product.dot,
            price: price,
            quantity: 1,
          },
        ];
      }
    });

    // Show the cart modal when adding an item
    setShowCartModal(true);
  };

  /**
   * Add a built set. Tires already in the cart are left as they are — each tire
   * is one physical unit, so "adding it again" would mean nothing — and the
   * drawer opens once, as for a single tire.
   */
  const addSetToCart = (lines: AddToCartProduct[], setId: string) => {
    setCartItems(prevItems => {
      // A tire already in the cart (e.g. added alone with the button above the
      // set block) joins the set instead of staying a loose line beside it.
      const inSet = new Set(lines.map(line => String(line.id)));
      const present = new Set(prevItems.map(item => String(item.id)));
      const kept = prevItems.map(item =>
        inSet.has(String(item.id)) && item.setId !== setId ? { ...item, setId } : item
      );
      const added = lines
        .filter(line => !present.has(String(line.id)))
        .map(line => toCartItem(line, setId));
      return [...kept, ...added];
    });
    setShowCartModal(true);
  };

  const removeSet = (setId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.setId !== setId));
  };

  const replaceInCart = (oldId: string | number, replacement: AddToCartProduct) => {
    setCartItems(prevItems => {
      const old = prevItems.find(item => String(item.id) === String(oldId));
      if (!old) return prevItems;
      if (prevItems.some(item => String(item.id) === String(replacement.id))) {
        return prevItems.filter(item => String(item.id) !== String(oldId));
      }
      return prevItems.map(item =>
        String(item.id) === String(oldId) ? toCartItem(replacement, old.setId) : item
      );
    });
  };

  // Remove a product from the cart
  const removeFromCart = (productId: string | number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Check if a product is in the cart
  const isInCart = useCallback(
    (productId: string | number) => {
      const pid = String(productId);
      return cartItems.some(item => String(item.id) === pid);
    },
    [cartItems]
  );

  // Calculate the total number of items in the cart
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Calculate the total price of all items in the cart
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      addSetToCart,
      removeFromCart,
      removeSet,
      replaceInCart,
      clearCart,
      isInCart,
      cartCount,
      cartTotal,
      showCartModal,
      setShowCartModal,
      isCartReady: loadedFromStorage,
    }),
    [cartItems, isInCart, cartCount, cartTotal, showCartModal, loadedFromStorage]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
