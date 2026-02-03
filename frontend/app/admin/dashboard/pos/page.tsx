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
import { inventoryApi, Product } from '@/lib/api/inventoryApi';
import { salesApi } from '@/lib/api/salesApi';
import { POSCartItem } from '@/types/pos';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load products and categories
  useEffect(() => {
    loadData();
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== 'all' && selectedCategory !== '0') {
      filtered = filtered.filter(product => 
        product.category?.toString() === selectedCategory.toString() || 
        product.category_id?.toString() === selectedCategory.toString()
      );
    }
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          (product.brand_name && product.brand_name.toLowerCase().includes(searchLower)) ||
          (product.product_name && product.product_name.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Only show active products with stock
    filtered = filtered.filter(product => 
      product.is_active !== false && (product.stock_qty || 0) > 0
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await inventoryApi.getProducts();
      const productsData = Array.isArray(productsResponse) 
        ? productsResponse 
        : productsResponse.results || [];
      setProducts(productsData);
      
      // Try to fetch categories, but handle if endpoint doesn't exist
      try {
        const categoriesData = await inventoryApi.getCategories?.();
        if (categoriesData) {
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }
      } catch (error) {
        console.log('Categories endpoint not available or failed');
        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(productsData.map(p => p.category_name).filter(Boolean))
        ).map((name, index) => ({ id: index + 1, name }));
        setCategories(uniqueCategories);
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product.id || !product.product_name || !product.selling_price) {
      toast.error('Invalid product data');
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(cartItem => cartItem.product_id === product.id);
      
      if (existingIndex >= 0) {
        const existingItem = prev[existingIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock
        if (newQuantity > (product.stock_qty || 0)) {
          toast.error(`Only ${product.stock_qty} units available`);
          return prev;
        }
        
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        return updatedCart;
      }
      
      // Check stock for new item
      if ((product.stock_qty || 0) <= 0) {
        toast.error('Out of stock');
        return prev;
      }
      
      if (quantity > (product.stock_qty || 0)) {
        toast.error(`Only ${product.stock_qty} units available`);
        return prev;
      }
      
      const newCartItem: POSCartItem = {
        id: `cart_${product.id}_${Date.now()}`,
        product_id: product.id,
        name: `${product.brand_name || ''} ${product.product_name}`.trim(),
        price: Number(product.selling_price),
        quantity: quantity,
        stock_qty: product.stock_qty || 0,
        image: product.image,
        category_name: product.category_name
      };
      
      return [...prev, newCartItem];
    });
  };

  const updateCartItem = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const cartItem = cart.find(item => item.id === id);
    if (!cartItem) return;
    
    const product = products.find(p => p.id === cartItem.product_id);
    if (product && quantity > (product.stock_qty || 0)) {
      toast.error(`Only ${product.stock_qty} units available`);
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

  const handleCheckout = async (customerData: any) => {
    try {
      setCheckoutLoading(true);
      
      // Prepare items for POS sale
      const posItems = cart.map(item => ({
        product: item.product_id,
        quantity: item.quantity,
        unit_price: item.price
      }));
      
      // Create POS sale data
      const posSaleData = {
        client: customerData.client_id || null, // Optional client ID
        payment_method: customerData.payment_method || 'cash',
        served_by: 'Admin User', // TODO: Get from auth context
        items: posItems
      };
      
      // Call the API to create POS sale
      const createdSale = await salesApi.createPOSSale(posSaleData);
      
      toast.success(`Sale #${createdSale.id} completed successfully!`);
      
      // Clear cart and close modals
      clearCart();
      setShowCheckout(false);
      setIsCartOpen(false);
      
      // Refresh inventory data
      await loadData();
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to complete sale');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const posCategories = [
    { id: 'all', name: 'All Products' },
    ...categories.map(cat => ({ id: cat.id || cat.name, name: cat.name }))
  ];

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
        onRefresh={loadData}
        filteredProducts={filteredProducts}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={posCategories}
      >
        <InventoryGrid
          products={filteredProducts}
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
        onCheckout={() => {
          setIsCartOpen(false);
          setShowCheckout(true);
        }}
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
            servedBy="Admin User" // TODO: Get from auth context
          />
        )}
      </AnimatePresence>
    </>
  );
}