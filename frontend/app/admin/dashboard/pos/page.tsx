// app/admin/dashboard/pos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import POSLayout from '@/components/admin/pos/POSLayout';
import CartSidebar from '@/components/admin/pos/CartSidebar';
import InventoryGrid from '@/components/admin/pos/InventoryGrid';
import CheckoutModal from '@/components/admin/pos/CheckoutModal';
import { inventoryApi, InventoryItem } from '@/lib/api/inventoryApi';
import { salesApi } from '@/lib/api/salesApi';
import { POSCartItem, CustomerData } from '@/types/pos';

export default function POSPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load inventory
  useEffect(() => {
    loadInventory();
  }, []);

  // Filter inventory based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInventory(inventory);
      return;
    }
    
    const filtered = inventory.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.brand_name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.list();
      const activeItems = data.filter(item => 
        item.is_active && item.quantity_in_stock > 0
      );
      setInventory(activeItems);
      setFilteredInventory(activeItems);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (item: InventoryItem): string | undefined => {
    if (item.image) {
      return item.image.startsWith('http') 
        ? item.image 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${item.image}`;
    }
    return undefined;
  };

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      // Convert item.id to string for comparison
      const itemIdString = item.id.toString();
      const existing = prev.find(cartItem => cartItem.inventory_id === itemIdString);
      
      if (existing) {
        if (existing.quantity >= item.quantity_in_stock) {
          toast.error('Insufficient stock');
          return prev;
        }
        return prev.map(cartItem =>
          cartItem.inventory_id === itemIdString
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      if (item.quantity_in_stock <= 0) {
        toast.error('Out of stock');
        return prev;
      }
      
      const itemImage = getItemImage(item);
      
      const newCartItem: POSCartItem = {
        id: itemIdString,
        inventory_id: itemIdString,
        name: item.brand_name,
        price: item.selling_price,
        quantity: 1,
        image: itemImage,
        image_url: itemImage,
        stock: item.quantity_in_stock
      };
      
      return [...prev, newCartItem];
    });
  };

  const updateCartItem = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const item = cart.find(item => item.id === id);
    if (item && item.stock && quantity > item.stock) {
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
    return calculateSubtotal() * 0.16;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async (customerData: CustomerData) => {
    try {
      setCheckoutLoading(true);
      
      const orderData = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_email: customerData.email,
        items: cart.map(item => ({
          inventory_id: item.inventory_id,
          quantity: item.quantity,
        })),
      };

      const order = await salesApi.createOrder(orderData);
      
      toast.success('Sale completed successfully!');
      clearCart();
      setShowCheckout(false);
      
      await loadInventory();
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to complete sale');
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
        onRefresh={loadInventory}
        filteredProducts={filteredInventory}
        selectedCategory="all"
        onCategoryChange={() => {}}
        categories={[]}
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