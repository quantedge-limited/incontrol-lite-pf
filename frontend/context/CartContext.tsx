'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { salesApi, CartItem as ApiCartItem } from '@/lib/api/salesApi';
import { toast } from 'react-toastify';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_path: string | null;
  quantity: number;
  productId: number; // This matches inventory_id from backend
  cartItemId?: string; // Backend cart item ID for updates/removals
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
  cartCount: number;
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
  cartCount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to transform backend cart items to frontend format
  const transformBackendToFrontend = useCallback((backendItems: ApiCartItem[]): CartItem[] => {
    return backendItems.map(item => ({
      id: item.inventory_id.toString(),
      name: item.inventory_name || 'Unknown Product',
      price: parseFloat(item.price_per_unit.toString() || '0'),
      image_path: null, // You can add image_path if your backend provides it
      quantity: item.quantity || 1,
      productId: item.inventory_id,
      cartItemId: item.id.toString(), // Store backend cart item ID for updates
    }));
  }, []);

  // Initialize cart from backend
  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get cart from backend first
      try {
        const backendCart = await salesApi.getCart();
        
        if (backendCart && backendCart.items) {
          // Transform backend items to frontend format
          const transformedItems = transformBackendToFrontend(backendCart.items);
          setItems(transformedItems);
          
          // Save to localStorage as backup
          localStorage.setItem('cart', JSON.stringify(transformedItems));
        }
      } catch (backendError: any) {
        console.log('Backend cart not available, trying localStorage:', backendError);
        
        // Fallback to localStorage
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
            
            // Try to sync localStorage cart to backend
            if (fixedCart.length > 0) {
              setTimeout(() => syncLocalCartToBackend(fixedCart), 1000);
            }
          } catch (e) {
            console.warn('Failed to parse saved cart:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('Cart initialization error:', error);
      setError(error.message || 'Failed to initialize cart');
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [transformBackendToFrontend]);

  // Sync localStorage cart items to backend
  const syncLocalCartToBackend = async (localItems: CartItem[]) => {
    try {
      // Clear existing backend cart first
      await salesApi.clearCart().catch(() => {});
      
      // Add each item to backend cart
      for (const item of localItems) {
        await salesApi.addToCart(item.productId, item.quantity);
      }
      
      // Refresh cart from backend
      const backendCart = await salesApi.getCart();
      if (backendCart && backendCart.items) {
        const transformedItems = transformBackendToFrontend(backendCart.items);
        setItems(transformedItems);
      }
    } catch (error) {
      console.warn('Failed to sync local cart to backend:', error);
    }
  };

  // Load cart on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeCart();
    }
  }, [initializeCart, isInitialized]);

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

  // Sync cart with backend
  const syncCartWithBackend = useCallback(async () => {
    try {
      if (items.length === 0) return;

      // Clear and rebuild backend cart
      await salesApi.clearCart().catch(() => {});
      
      // Add all items to backend cart
      for (const item of items) {
        await salesApi.addToCart(item.productId, item.quantity);
      }
      
      // Refresh from backend
      const backendCart = await salesApi.getCart();
      if (backendCart && backendCart.items) {
        const transformedItems = transformBackendToFrontend(backendCart.items);
        setItems(transformedItems);
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
    }
  }, [items, transformBackendToFrontend]);

  const addToCart = async (itemData: Omit<CartItem, 'quantity'>) => {
    try {
      setIsLoading(true);
      
      // Check if item already exists in cart
      const existingItemIndex = items.findIndex(item => item.id === itemData.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity locally
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += 1;
        setItems(updatedItems);
        
        // Update backend
        const existingItem = items[existingItemIndex];
        if (existingItem.cartItemId) {
          await salesApi.updateCartItem(
            existingItem.cartItemId, 
            existingItem.quantity + 1
          );
        } else {
          // If no cartItemId, add as new item to backend
          await salesApi.addToCart(itemData.productId, 1);
          await syncCartWithBackend(); // Refresh to get cartItemId
        }
      } else {
        // Add new item locally
        const newItem: CartItem = { ...itemData, quantity: 1 };
        setItems(prev => [...prev, newItem]);
        
        // Add to backend
        await salesApi.addToCart(itemData.productId, 1);
        await syncCartWithBackend(); // Refresh to get cartItemId
      }
      
      toast.success(`${itemData.name} added to cart!`);
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Find the item to remove
      const itemToRemove = items.find(item => item.id === id);
      if (!itemToRemove) return;

      // Remove from backend if we have cartItemId
      if (itemToRemove.cartItemId) {
        await salesApi.removeCartItem(itemToRemove.cartItemId);
      } else {
        // If no cartItemId, sync entire cart
        await syncCartWithBackend();
      }
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== id));
      
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      toast.error(error.message || 'Failed to remove item from cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      setIsLoading(true);
      
      // Find the item to update
      const itemToUpdate = items.find(item => item.id === id);
      if (!itemToUpdate) return;

      // Update local state
      setItems(prev => {
        return prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      });

      // Update backend if we have cartItemId
      if (itemToUpdate.cartItemId) {
        await salesApi.updateCartItem(itemToUpdate.cartItemId, quantity);
      } else {
        // If no cartItemId, sync entire cart
        await syncCartWithBackend();
      }
      
      toast.success('Cart updated');
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      toast.error(error.message || 'Failed to update quantity');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setIsLoading(true);
      
      // Clear backend cart
      await salesApi.clearCart();
      
      // Clear local state
      setItems([]);
      
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      toast.error(error.message || 'Failed to clear cart');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const cartCount = items.reduce(
    (sum, item) => sum + item.quantity,
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
        cartCount,
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