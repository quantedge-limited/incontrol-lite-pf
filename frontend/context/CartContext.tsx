'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/apiClient';
import * as salesService from '@/services/sales';

export interface CartItem {
  id: string; 
  name: string;
  price: number;
  image_path: string | null;
  quantity: number;
  productId: number;
  cartItemId?: string;
}

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  cartCount: number;
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
  cartCount: 0,
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

  const transformBackendToFrontend = useCallback((backendItems: any[]): CartItem[] => {
    return backendItems.map(item => ({
      id: item.inventory_id.toString(),
      name: item.inventory_name || 'Unknown Product',
      price: Number(item.price_per_unit || 0),
      image_path: item.image_path || null,
      quantity: item.quantity || 1,
      productId: item.inventory_id,
      cartItemId: item.id?.toString(),
    }));
  }, []);

  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      try {
        const backendCart = await salesService.getCart();
        if (backendCart?.items) {
          const transformed = transformBackendToFrontend(backendCart.items);
          setItems(transformed);
          localStorage.setItem('cart', JSON.stringify(transformed));
        }
      } catch (backendError: any) {
        console.warn('Backend cart not available, falling back to localStorage', backendError);
        const saved = localStorage.getItem('cart');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as CartItem[];
            const fixedItems = parsed.map(item => ({
              ...item,
              productId: Number(item.productId || item.id),
            }));
            setItems(fixedItems);
            if (fixedItems.length > 0) setTimeout(() => syncLocalCartToBackend(parsed), 1000);
          } catch (e) {
            console.error('Failed to parse localStorage cart', e);
          }
        }
      }
    } catch (err: any) {
      console.error('Cart initialization error:', err);
      setError(err.message || 'Failed to initialize cart');
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [transformBackendToFrontend]);

  const syncLocalCartToBackend = async (localItems: CartItem[]) => {
    try {
      await salesService.clearCart().catch(() => {});
      for (const item of localItems) {
        await salesService.addToCart(item.productId, item.quantity);
      }
      const backendCart = await salesService.getCart();
      if (backendCart?.items) setItems(transformBackendToFrontend(backendCart.items));
    } catch (err) {
      console.warn('Failed to sync local cart', err);
    }
  };

  useEffect(() => {
    if (!isInitialized) initializeCart();
  }, [initializeCart, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isInitialized]);

  const syncCartWithBackend = useCallback(async () => {
    if (items.length === 0) return;
    try {
      await salesService.clearCart().catch(() => {});
      for (const item of items) {
        await salesService.addToCart(item.productId, item.quantity);
      }
      const backendCart = await salesService.getCart();
      if (backendCart?.items) setItems(transformBackendToFrontend(backendCart.items));
    } catch (err) {
      console.error('Failed to sync cart with backend', err);
    }
  }, [items, transformBackendToFrontend]);

  const addToCart = async (itemData: Omit<CartItem, 'quantity'>) => {
    try {
      setIsLoading(true);
      const index = items.findIndex(i => i.id === itemData.id);
      if (index >= 0) {
        const updated = [...items];
        updated[index].quantity += 1;
        setItems(updated);
        if (updated[index].cartItemId) {
          await salesService.updateCartItem(updated[index].cartItemId!, updated[index].quantity);
        } else {
          await salesService.addToCart(itemData.productId, 1);
          await syncCartWithBackend();
        }
      } else {
        const newItem: CartItem = { ...itemData, quantity: 1 };
        setItems(prev => [...prev, newItem]);
        await salesService.addToCart(itemData.productId, 1);
        await syncCartWithBackend();
      }
      toast.success(`${itemData.name} added to cart!`);
    } catch (err: any) {
      console.error('Add to cart failed', err);
      toast.error(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setIsLoading(true);
      const item = items.find(i => i.id === id);
      if (!item) return;
      if (item.cartItemId) await salesService.removeCartItem(item.cartItemId);
      else await syncCartWithBackend();
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Item removed from cart');
    } catch (err: any) {
      console.error('Remove cart item failed', err);
      toast.error(err.message || 'Failed to remove item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    try {
      setIsLoading(true);
      const item = items.find(i => i.id === id);
      if (!item) return;
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
      if (item.cartItemId) await salesService.updateCartItem(item.cartItemId, quantity);
      else await syncCartWithBackend();
      toast.success('Cart updated');
    } catch (err: any) {
      console.error('Update quantity failed', err);
      toast.error(err.message || 'Failed to update quantity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
      setIsLoading(true);
      await salesService.clearCart();
      setItems([]);
      toast.success('Cart cleared');
    } catch (err: any) {
      console.error('Clear cart failed', err);
      toast.error(err.message || 'Failed to clear cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalPrice,
      cartCount,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCartWithBackend,
      retryInitialization: initializeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
