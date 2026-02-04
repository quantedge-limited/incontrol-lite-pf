// app/admin/dashboard/pos/page.tsx - UPDATED VERSION
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
import { POSCartItem, CustomerData } from '@/types/pos'; // Import CustomerData here

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
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.brand_name.toLowerCase().includes(searchLower) ||
          product.product_name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
        );
      });
    }
    
    filtered = filtered.filter(product => 
      product.is_active && product.stock_qty > 0
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const productsData = await inventoryApi.getProducts();
      setProducts(productsData);
      
      const categoriesData = await inventoryApi.getCategories();
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (product: Product): string | undefined => {
    if (product.image) {
      if (product.image.startsWith('http')) {
        return product.image;
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com';
      return `${baseUrl}${product.image}`;
    }

  const addToCart = (product: Product) => {
    setCart(prev => {
      // Check if product is already in cart using product_id
      const existing = prev.find(cartItem => cartItem.product_id === product.id);
      
      if (existing) {
        // Check if we can add more
        if (existing.quantity >= product.stock_qty) {
          toast.error(`Only ${product.stock_qty} units available`);
          return prev;
        }
        
        return prev.map(cartItem =>
          cartItem.product_id === product.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      // Check stock
      if (product.stock_qty <= 0) {
        toast.error('Out of stock');
        return prev;
      }
      
      const imageUrl = getItemImage(product);
      
      const newCartItem: POSCartItem = {
        id: `cart_${product.id}_${Date.now()}`,
        product_id: product.id,
        name: `${product.brand_name} - ${product.product_name}`,
        price: Number(product.selling_price),
        quantity: 1,
        stock_qty: product.stock_qty,
        image: imageUrl,
        image_url: imageUrl,
        inventory_id: product.id,
        stock: product.stock_qty,
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
    if (product && quantity > product.stock_qty) {
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
      
      console.log('Checkout data:', {
        customerData,
        cart,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal()
      });
      
      // Call the API to create POS sale - DIRECT API CALL
      const createdSale = await createPOSSale(posSaleData);
      
      toast.success(`Sale #${createdSale.id} completed successfully!`);
      
      // Clear cart and close modals
      clearCart();
      setShowCheckout(false);
      setIsCartOpen(false);
      
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
    ...categories.map(cat => ({ id: cat.id, name: cat.name }))
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
            servedBy="Admin User"
          />
        )}
      </AnimatePresence>
    </>
  );
}