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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-b-2" style={{ borderColor: '#b3e5f5' }}>
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

            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ backgroundColor: '#f0fbfd' }}
            >
              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <ShoppingBag size={48} color="#d1d5db" className="mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Start shopping to add items to your cart.
                  </p>
                </motion.div>
              ) : (
                <>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CartItemComponent item={item} />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-t border-gray-200 p-6 space-y-4"
              >
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Buttons */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCheckout}
                  className="w-full py-3 text-white font-bold rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0091AD' }}
                >
                  Proceed to Checkout
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCart}
                  className="w-full py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Clear Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
