"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

{/*
  
  CartContext provides a context for managing the shopping cart state.
   It uses localStorage for persistence since the backend doesn't have cart endpoints.
   All cart operations are client-side until checkout, when a POS transaction is created.

*/}

// Define the cart structure
export interface CartItem {
  product_id: number;
  product_name: string;
  brand_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_path?: string; // Optional for UI
  cartItemId?: string; // Add this for unique IDs in cart
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  isLoading?: boolean;
  error: string | null;
  items: CartItem[];
  cartCount: number;
  
  addItem: (inventoryId: number, quantity?: number, itemDetails?: { name: string; price: number; image?: string }) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Default empty cart
const defaultCart: Cart = {
  id: 'local-cart',
  session_id: typeof window !== 'undefined' ? (localStorage.getItem('session_id') || generateSessionId()) : 'temp',
  items: [],
  total_price: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

function generateSessionId(): string {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

function loadCartFromStorage(): Cart {
  if (typeof window === 'undefined') return defaultCart;
  
  try {
    const stored = localStorage.getItem('cart');
    if (stored) {
      const cart = JSON.parse(stored);
      return {
        ...cart,
        updated_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
  }
  return defaultCart;
}

function saveCartToStorage(cart: Cart): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify({
      ...cart,
      updated_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error('Failed to load cart from storage:', err);
      }
    };
    
    loadCart();
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = loadCartFromStorage();
      setCart(cartData);
    } catch (err: any) {
      setError(err.message);
      setCart(defaultCart);
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const addItem = useCallback(async (
    inventoryId: number, 
    quantity: number = 1,
    itemDetails?: { name: string; price: number; image?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const currentCart = loadCartFromStorage();
      const existingItemIndex = currentCart.items.findIndex(item => item.inventory_id === inventoryId);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        currentCart.items[existingItemIndex].quantity += quantity;
        currentCart.items[existingItemIndex].total_price = 
          currentCart.items[existingItemIndex].quantity * currentCart.items[existingItemIndex].price_per_unit;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `item-${Date.now()}-${inventoryId}`,
          inventory_id: inventoryId,
          inventory_name: itemDetails?.name || `Product ${inventoryId}`,
          quantity: quantity,
          price_per_unit: itemDetails?.price || 0,
          total_price: (itemDetails?.price || 0) * quantity,
          image_url: itemDetails?.image
        };
        currentCart.items.push(newItem);
      }
      
      // Recalculate total
      currentCart.total_price = currentCart.items.reduce((sum, item) => sum + item.total_price, 0);
      currentCart.updated_at = new Date().toISOString();
      
      saveCartToStorage(currentCart);
      setCart(currentCart);
      toast.success('Item added to cart');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to add item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback((productId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const currentCart = loadCartFromStorage();
      const itemIndex = currentCart.items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          currentCart.items.splice(itemIndex, 1);
        } else {
          currentCart.items[itemIndex].quantity = quantity;
          currentCart.items[itemIndex].total_price = 
            quantity * currentCart.items[itemIndex].price_per_unit;
        }
        
        // Recalculate total
        currentCart.total_price = currentCart.items.reduce((sum, item) => sum + item.total_price, 0);
        currentCart.updated_at = new Date().toISOString();
        
        saveCartToStorage(currentCart);
        setCart(currentCart);
        toast.success('Cart updated');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to update item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback((productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const currentCart = loadCartFromStorage();
      currentCart.items = currentCart.items.filter(item => item.id !== itemId);
      
      // Recalculate total
      currentCart.total_price = currentCart.items.reduce((sum, item) => sum + item.total_price, 0);
      currentCart.updated_at = new Date().toISOString();
      
      saveCartToStorage(currentCart);
      setCart(currentCart);
      toast.success('Item removed from cart');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to remove item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const emptyCart = {
        ...defaultCart,
        session_id: cart.session_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      saveCartToStorage(emptyCart);
      setCart(emptyCart);
      toast.success('Cart cleared');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to clear cart: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart.session_id]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.line_total, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      items: cart,
      loading,
      isLoading: loading,
      error,
      cartCount,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      getCartTotal,
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