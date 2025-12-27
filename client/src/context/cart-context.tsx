import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/data/mock-data";
import { useAuth } from "./auth-context";
import { 
  saveCartItem, 
  fetchCartItems, 
  removeCartItem, 
  updateCartItemQuantity, 
  clearCart as clearCartDB,
  debugCartContents,
  type CartItem 
} from "@/services/cart";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  // Load cart from database when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isLoggedIn]);

  const loadCart = async () => {
    if (!isLoggedIn) return;
    
    try {
      setLoading(true);
      const cartItems = await fetchCartItems();
      setCart(cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    if (!isLoggedIn) {
      console.error('User must be logged in to add items to cart');
      return;
    }

    try {
      // Check if item already exists in local cart
      const existingIndex = cart.findIndex(item => item.product.id === product.id);
      const newQuantity = existingIndex >= 0 ? cart[existingIndex].quantity + quantity : quantity;
      
      const cartItem: CartItem = { product, quantity: newQuantity };
      const result = await saveCartItem(cartItem);
      
      if (result.success) {
        // Update local state
        if (existingIndex >= 0) {
          setCart(prev => prev.map((item, index) => 
            index === existingIndex 
              ? { ...item, quantity: newQuantity }
              : item
          ));
        } else {
          setCart(prev => [...prev, { product, quantity }]);
        }
      } else {
        console.error('Failed to add item to cart:', result.error);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isLoggedIn) return;

    try {
      console.log('Attempting to remove item from cart:', productId);
      const result = await removeCartItem(productId);
      if (result.success) {
        console.log('Successfully removed item from database, updating local state');
        setCart(prev => prev.filter(item => item.product.id !== productId));
      } else {
        console.error('Failed to remove item from cart:', result.error);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isLoggedIn) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const result = await updateCartItemQuantity(productId, quantity);
      if (result.success) {
        setCart(prev => prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        ));
      } else {
        console.error('Failed to update cart item quantity:', result.error);
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) return;

    try {
      const result = await clearCartDB();
      if (result.success) {
        setCart([]);
      } else {
        console.error('Failed to clear cart:', result.error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  // Debug function - you can call this from browser console
  (window as any).debugCart = debugCartContents;

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartTotal, 
        cartCount, 
        loading,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
