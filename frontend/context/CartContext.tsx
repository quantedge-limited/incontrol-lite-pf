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
  productId: number; // Always a number
}

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCartWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalPrice: 0,
  isLoading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  syncCartWithBackend: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage and sync with backend
  useEffect(() => {
    const initializeCart = async () => {
      try {
        setIsLoading(true);
        
        // First, try to get cart from backend
        const backendCart = await orderApiService.getCart();
        
        if (backendCart.cart && backendCart.cart.items) {
          // Transform backend items to frontend format
          const transformedItems = backendCart.cart.items.map((item: any) => ({
            id: item.product.id.toString(),
            name: item.product.name,
            price: parseFloat(item.product.price || item.unit_price || '0'),
            image: item.product.image || '',
            quantity: item.quantity,
            productId: Number(item.product.id), // Ensure it's a number
          }));
          
          setItems(transformedItems);
          localStorage.setItem('cart', JSON.stringify(transformedItems));
        } else {
          // Fallback to localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            // Ensure productId is a number in saved items
            const fixedCart = parsedCart.map((item: any) => ({
              ...item,
              productId: Number(item.productId || item.id),
            }));
            setItems(fixedCart);
          }
        }
      } catch (error) {
        console.error('Failed to initialize cart:', error);
        // Fallback to localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Ensure productId is a number in saved items
          const fixedCart = parsedCart.map((item: any) => ({
            ...item,
            productId: Number(item.productId || item.id),
          }));
          setItems(fixedCart);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Sync cart with backend
  const syncCartWithBackend = useCallback(async () => {
    try {
      const backendItems = items.map(item => ({
        product_id: item.productId, // Now this is guaranteed to be a number
        quantity: item.quantity,
      }));

      if (backendItems.length > 0) {
        await orderApiService.updateCart(backendItems);
      } else {
        await orderApiService.clearCart();
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
    }
  }, [items]);

  const addToCart = async (itemData: Omit<CartItem, 'quantity'>) => {
    try {
      // Update backend first
      await orderApiService.addToCart(itemData.productId, 1);
      
      // Update local state
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
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setItems(prev => {
        const itemToRemove = prev.find(item => item.id === id);
        if (!itemToRemove) return prev;
        
        // Update backend
        const remainingItems = prev.filter(item => item.id !== id);
        const backendItems = remainingItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));
        
        orderApiService.updateCart(backendItems).catch(console.error);
        
        return remainingItems;
      });
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
      setItems(prev => {
        const updatedItems = prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
        
        // Update backend
        const backendItems = updatedItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));
        
        orderApiService.updateCart(backendItems).catch(console.error);
        
        return updatedItems;
      });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await orderApiService.clearCart();
      setItems([]);
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
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartWithBackend,
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