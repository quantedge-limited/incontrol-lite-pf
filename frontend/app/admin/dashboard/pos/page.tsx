"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import POSLayout from '@/components/admin/pos/POSLayout';
import CartSidebar from '@/components/admin/pos/CartSidebar';
import InventoryGrid from '@/components/admin/pos/InventoryGrid';
import CheckoutModal from '@/components/admin/pos/CheckoutModal';
import { inventoryApi as ApiInventoryItem } from '@/lib/api/inventoryApi';
import type { InventoryItem } from '@/types/inventory';
import { salesApi, CreateSaleDto } from '@/lib/api/salesApi';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  image_url?: string;
  stock: number;
  inventory_id: number;
}

interface InventoryItem {
  id: string;
  name: string;
  price_per_unit: number;
  quantity: number;
  image_path?: string;
  image_url?: string;
  sku?: string;
  category?: string;
  brand_name?: string;
  is_active: boolean;
}

export default function POSPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load inventory
  useEffect(() => {
    loadInventory();
  }, []);

  // Filter inventory based on search and category
  useEffect(() => {
    let filtered = inventory;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredInventory(filtered);
  }, [searchTerm, selectedCategory, inventory]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.list();
      // Filter only active items for POS
      const activeItems = data.filter(item => item.is_active && item.quantity > 0);
      setInventory(activeItems);
      setFilteredInventory(activeItems);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(inventory.map(item => item.category).filter(Boolean))];

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      
      if (existing) {
        // Check stock
        if (existing.quantity >= item.quantity) {
          toast.error('Insufficient stock');
          return prev;
        }
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      // Check stock for new item
      if (item.quantity <= 0) {
        toast.error('Out of stock');
        return prev;
      }
      
      return [...prev, {
        id: item.id,
        inventory_id: parseInt(item.id),
        name: item.name,
        price: item.price_per_unit,
        quantity: 1,
        image: item.image_path,
        image_url: item.image_url,
        stock: item.quantity
      }];
    });
  };

  const updateCartItem = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const item = cart.find(item => item.id === id);
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock} units available`);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16; // 16% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async (customerData: {
    name: string;
    phone: string;
    email?: string;
    paymentMethod: string;
    address?: string;
  }) => {
    try {
      setCheckoutLoading(true);
      
      // Prepare sale data according to your CreateSaleDto interface
      const saleData: CreateSaleDto = {
        buyer_name: customerData.name,
        buyer_phone: customerData.phone,
        buyer_email: customerData.email,
        buyer_address: customerData.address,
        sale_type: 'walkin' as const,
        total_amount: calculateTotal(),
        notes: `Payment method: ${customerData.paymentMethod}. Walk-in sale.`,
        items: cart.map(item => ({
          inventory: item.id,
          quantity: item.quantity,
          price_per_unit: item.price,
        })),
      };

      await salesApi.create(saleData);
      
      toast.success('Sale completed successfully!');
      clearCart();
      setShowCheckout(false);
      
      // Reload inventory to update stock
      await loadInventory();
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete sale');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <POSLayout
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onCheckout={() => setShowCheckout(true)}
        checkoutDisabled={cart.length === 0}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onRefresh={loadInventory}
        filteredProducts={filteredInventory}
      >
        <InventoryGrid
          inventory={filteredInventory}
          loading={loading}
          onAddToCart={addToCart}
        />
      </POSLayout>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartItem}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        subtotal={calculateSubtotal()}
        tax={calculateTax()}
        total={calculateTotal()}
      />

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onCheckout={handleCheckout}
            loading={checkoutLoading}
            cart={cart}
            subtotal={calculateSubtotal()}
            tax={calculateTax()}
            total={calculateTotal()}
          />
        )}
      </AnimatePresence>
    </>
  );
}