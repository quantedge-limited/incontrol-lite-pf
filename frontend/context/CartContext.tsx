// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orderApiService } from '@/services/orderApi';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_path: string | null;
  quantity: number;
  productId: number;
}

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCartWithBackend: () => Promise<void>;
  retryInitialization: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalPrice: 0,
  isLoading: false,
  error: null,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  syncCartWithBackend: async () => {},
  retryInitialization: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage first, then sync with backend
  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Always load from localStorage first for immediate UI
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Ensure productId is a number in saved items
          const fixedCart = parsedCart.map((item: any) => ({
            ...item,
            productId: Number(item.productId || item.id),
          }));
          setItems(fixedCart);
        } catch (e) {
          console.warn('Failed to parse saved cart:', e);
        }
      }

      // Then try to sync with backend if user is authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const backendCart = await orderApiService.getCart();
          
          if (backendCart && backendCart.items) {
            // Transform backend items to frontend format
            const transformedItems = backendCart.items.map((item: any) => ({
              id: item.product.id?.toString() || item.product_id?.toString() || '',
              name: item.product?.name || 'Unknown Product',
              price: parseFloat(item.product?.price || item.unit_price || '0'),
              image_path: item.product?.image_path || null,
              quantity: item.quantity || 1,
              productId: Number(item.product?.id || item.product_id || 0),
            }));
            
            setItems(transformedItems);
            localStorage.setItem('cart', JSON.stringify(transformedItems));
          }
        } catch (backendError: any) {
          console.warn('Failed to sync with backend, using local cart:', backendError);
          // Don't set error here - just use local cart
        }
      }
    } catch (error: any) {
      console.error('Cart initialization error:', error);
      setError(error.message || 'Failed to initialize cart');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
    }
  }, [items, isInitialized]);

  // Sync cart with backend (for authenticated users)
  const syncCartWithBackend = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || items.length === 0) return;

      const backendItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
      }));

      // Use addToCart for each item individually since updateCart might not exist
      for (const item of items) {
        try {
          // Add each item to backend cart
          await orderApiService.addToCart(item.productId, item.quantity);
        } catch (e) {
          console.warn(`Failed to sync item ${item.id} with backend:`, e);
        }
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
    }
  }, [items]);

  const addToCart = async (itemData: Omit<CartItem, 'quantity'>) => {
    try {
      // Update local state first for immediate UI feedback
      setItems(prev => {
        const existingItem = prev.find(i => i.id === itemData.id);
        if (existingItem) {
          return prev.map(i =>
            i.id === itemData.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...itemData, quantity: 1 }];
      });

      // Then sync with backend if authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await orderApiService.addToCart(itemData.productId, 1);
        } catch (backendError) {
          console.warn('Failed to sync with backend:', backendError);
          // Item is still in local cart, just not synced with backend
        }
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Revert local change if there was an error
      setItems(prev => prev.filter(item => item.id !== itemData.id));
      throw error;
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      // Find the item to remove
      const itemToRemove = items.find(item => item.id === id);
      if (!itemToRemove) return;

      // Update local state first
      setItems(prev => prev.filter(item => item.id !== id));

      // Remove from backend if authenticated
      const token = localStorage.getItem('access_token');
      if (token && itemToRemove.productId) {
        try {
          await orderApiService.removeCartItem(itemToRemove.productId);
        } catch (backendError) {
          console.warn('Failed to remove from backend:', backendError);
        }
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      // Update local state first
      setItems(prev => {
        return prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      });

      // Update backend if authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        const itemToUpdate = items.find(item => item.id === id);
        if (itemToUpdate?.productId) {
          try {
            await orderApiService.updateCartItem(itemToUpdate.productId, quantity);
          } catch (backendError) {
            console.warn('Failed to update backend:', backendError);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Clear local state first
      setItems([]);

      // Clear backend if authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await orderApiService.clearCart();
        } catch (backendError) {
          console.warn('Failed to clear backend cart:', backendError);
        }
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalPrice,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartWithBackend,
        retryInitialization: initializeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};