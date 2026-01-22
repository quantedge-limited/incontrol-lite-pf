// components/frontpage/Cart/CartSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Add useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartItemComponent } from './CartItem';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();
  
  // Local state to handle loading/initialization
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Don't render anything on server-side or before mount
  if (!isMounted) {
    return null;
  }
  
  // Safe cart items with default empty array
  const cartItems = items || [];
  
  // Calculate total safely
  const safeTotalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * (item.quantity || 1)), 
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div 
              className="flex-1 overflow-y-auto p-6"
              style={{ backgroundColor: '#f0fbfd' }}
            >
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} color="#d1d5db" className="mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                          {item.image && (item.image.startsWith('data:') || item.image.startsWith('http')) ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-lg font-bold text-gray-600">
                              {item.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold" style={{ color: '#0091AD' }}>
                              KES {Number(item.price).toFixed(0)}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                              <button
                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-700">Total:</span>
                  <span className="text-3xl font-bold" style={{ color: '#0091AD' }}>
                    KES {Number(safeTotalPrice).toFixed(0)}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    onCheckout();
                    onClose();
                  }}
                  className="w-full py-4 text-white font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0091AD' }}
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-3 mt-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};