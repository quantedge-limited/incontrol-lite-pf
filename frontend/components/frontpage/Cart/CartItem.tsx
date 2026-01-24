// components/frontpage/Cart/CartItem.tsx - FIXED
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Use the CartItem interface from your CartContext
interface CartItem {
  id: string;
  name: string;
  price: number;
  image_path: string | null; // FIX: Changed from image to image_path
  quantity: number;
}

interface CartItemComponentProps {
  item: CartItem;
}

export const CartItemComponent: React.FC<CartItemComponentProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDecrease = () => { // Remove async
    if (isUpdating || item.quantity <= 1) return;
    
    setIsUpdating(true);
    try {
      updateQuantity(item.id, item.quantity - 1); // Remove await
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = () => { // Remove async
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      updateQuantity(item.id, item.quantity + 1); // Remove await
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => { // Remove async
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      removeFromCart(item.id); // Remove await
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
        {/* FIX: Use image_path instead of image */}
        {item.image_path ? (
          <img 
            src={item.image_path.startsWith('http') ? item.image_path : `/images/products/${item.image_path}`} 
            alt={item.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/products/default-product.jpg';
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}
          >
            <span className="text-white font-bold text-sm text-center">
              {item.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
        <p className="text-gray-600 text-sm mt-1">KES {item.price.toFixed(0)} each</p>
        
        <p className="text-gray-900 font-bold text-sm mt-2">
          Total: KES {(item.price * item.quantity).toFixed(0)}
        </p>

        {/* Quantity Control */}
        <div className="flex items-center gap-2 mt-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDecrease}
            disabled={isUpdating || item.quantity <= 1}
            className={`p-1 rounded transition-colors ${
              isUpdating || item.quantity <= 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-200'
            }`}
          >
            <Minus size={16} className="text-gray-600" />
          </motion.button>

          <motion.span
            key={item.quantity}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-8 text-center font-bold text-gray-900 ${
              isUpdating ? 'opacity-50' : ''
            }`}
          >
            {item.quantity}
          </motion.span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleIncrease}
            disabled={isUpdating}
            className={`p-1 rounded transition-colors ${
              isUpdating
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-200'
            }`}
          >
            <Plus size={16} className="text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Remove Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRemove}
        disabled={isUpdating}
        className={`p-2 rounded-lg transition-colors self-start ${
          isUpdating
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-red-100'
        }`}
      >
        <Trash2 size={18} className="text-red-500" />
      </motion.button>
    </motion.div>
  );
};