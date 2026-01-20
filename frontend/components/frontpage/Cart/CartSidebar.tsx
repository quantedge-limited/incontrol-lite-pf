'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartItemComponent } from './CartItem';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cartItems, clearCart, totalPrice } = useCart();
  
  // Constant shipping fee
  const shippingFee = 100;
  const grandTotal = totalPrice + shippingFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Fully transparent, no blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-transparent z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#b3e5f5' }}>
              <div className="flex items-center gap-2">
                <ShoppingBag size={24} color="#0091AD" />
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Cart Items Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ backgroundColor: '#f0fbfd' }}
            >
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} color="#d1d5db" className="mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Start shopping to add items to your cart.
                  </p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CartItemComponent item={item} />
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-t border-gray-200 p-6 space-y-4 bg-white"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-emerald-500 font-bold">KES {totalPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-500 font-bold">KES {shippingFee}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-xl font-extrabold text-gray-900">Total</span>
                    <span className="text-xl font-extrabold text-emerald-500">
                      KES {grandTotal.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Proceed to Checkout - Emerald Color */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCheckout}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-700 transition-all"
                  >
                    Proceed to Checkout
                  </motion.button>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Clear Cart */}
                    <button
                      onClick={clearCart}
                      className="py-2 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={16} />
                      Clear
                    </button>

                    {/* Continue Shopping - Blue Theme Color (#0091AD) */}
                    <button
                      onClick={onClose}
                      className="py-2 text-white font-bold rounded-lg transition-colors text-sm"
                      style={{ backgroundColor: '#0091AD' }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
