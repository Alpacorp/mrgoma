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
  name: string;
  price: number;
  image?: string;
  quantity: number;
  brand?: string;
  brandId?: string | number;
}

// Define the cart context type
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  isInCart: (productId: string | number) => boolean;
  cartCount: number;
  cartTotal: number;
  showCartModal: boolean;
  setShowCartModal: (show: boolean) => void;
}

// Create the cart context with default values
export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  isInCart: () => false,
  cartCount: 0,
  cartTotal: 0,
  showCartModal: false,
  setShowCartModal: () => {},
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart state from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  // Save the cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Add a product to the cart
  const addToCart = (product: any) => {
    setCartItems(prevItems => {
      // Check if the product is already in the cart
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // If it exists, increase the quantity
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If it doesn't exist, add it with quantity 1
        // Ensure price is a number
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

        return [
          ...prevItems,
          {
            brand: product.brand,
            brandId: product.brandId,
            id: product.id,
            image: product.imageSrc,
            name: product.name,
            price: price,
            quantity: 1,
          },
        ];
      }
    });

    // Show the cart modal when adding an item
    setShowCartModal(true);
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
      return cartItems.some(item => item.id === productId);
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
      removeFromCart,
      clearCart,
      isInCart,
      cartCount,
      cartTotal,
      showCartModal,
      setShowCartModal,
    }),
    [cartItems, isInCart, cartCount, cartTotal, showCartModal]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
