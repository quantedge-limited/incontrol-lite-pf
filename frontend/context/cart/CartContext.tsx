"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '@/lib/api/sales';
import { toast } from 'react-toastify';

// Define the cart structure
export interface CartItem {
  id: string;
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  image_path?: string;
  image?: string; 
  image_url?: string; 
}

export interface Cart {
  id: string;
  session_id: string;
  items: CartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  isLoading?: boolean; // Optional alias for loading
  error: string | null;
  items: CartItem[];
  cartCount: number; // Add this
  
  addItem: (inventoryId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Default empty cart
const defaultCart: Cart = {
  id: '',
  session_id: '',
  items: [],
  total_price: 0,
  created_at: '',
  updated_at: ''
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate cart count from items
  const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (err: any) {
      setError(err.message);
      // Set default cart if error
      setCart(defaultCart);
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (inventoryId: number, quantity: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.addToCart(inventoryId, quantity);
      await refreshCart();
      toast.success('Item added to cart');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to add item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.updateCartItem(itemId, quantity);
      await refreshCart();
      toast.success('Cart updated');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to update item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.removeCartItem(itemId);
      await refreshCart();
      toast.success('Item removed from cart');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to remove item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await cartApi.clearCart();
      await refreshCart();
      toast.success('Cart cleared');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to clear cart: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Initialize cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{
      cart,
      items: cart.items,
      loading,
      isLoading: loading, // Provide both for compatibility
      error,
      cartCount, // Add this
      addItem,
      updateItem,
      removeItem,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}