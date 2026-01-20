'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';

interface CartItemComponentProps {
  item: CartItem;
}

export const CartItemComponent: React.FC<CartItemComponentProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: 20 }}
      className="rounded-lg p-4 flex gap-4 transition-colors"
      style={{ backgroundColor: '#e6f7fb' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9f0f7'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e6f7fb'}
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}>
        <span className="text-white font-bold text-sm text-center">{item.name.slice(0, 2).toUpperCase()}</span>
      </div>

      {/* Details */}
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
        <p className="text-gray-600 text-sm mt-1">KES {item.price.toFixed(2)}</p>

        {/* Quantity Control */}
        <div className="flex items-center gap-2 mt-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Minus size={16} className="text-gray-600" />
          </motion.button>

          <motion.span
            key={item.quantity}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-8 text-center font-bold text-gray-900"
          >
            {item.quantity}
          </motion.span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Plus size={16} className="text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Remove Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => removeFromCart(item.id)}
        className="p-2 hover:bg-red-100 rounded-lg transition-colors self-start"
      >
        <Trash2 size={18} className="text-red-500" />
      </motion.button>
    </motion.div>
  );
};
