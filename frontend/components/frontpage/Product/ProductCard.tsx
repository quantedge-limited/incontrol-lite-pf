// components/frontpage/Product/ProductCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { apiService } from '@/services/api';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image: string;
  quantity: number;
  productId?: number; // Add productId for backend
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  description,
  inStock,
  image,
  quantity,
  productId,
}) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentQuantity(quantity);
  }, [quantity]);

  const handleAddToCart = async () => {
    if (currentQuantity <= 0 || isLoading) return;

    setIsLoading(true);
    try {
      // Add to cart in backend and frontend
      await addToCart({
        id,
        name,
        price,
        image,
        productId: productId || parseInt(id),
      });

      // Update local quantity
      setCurrentQuantity(prev => prev - 1);
      setIsAdded(true);

      // Update inventory in backend
      await apiService.updateInventoryItem(id, {
        quantity: currentQuantity - 1
      });

      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const isInStock = currentQuantity > 0;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow md:hover:shadow-2xl md:hover:y-[-10px]"
    >
      {/* Image Container */}
      <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {image && (image.startsWith('data:') || image.startsWith('http')) ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)' }}>
              <span className="text-white font-bold text-lg">{name.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </motion.div>

        {/* Stock Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4"
        >
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              isInStock ? 'bg-green-500' : 'bg-gray-400'
            }`}
          >
            {isInStock ? `${currentQuantity} in Stock` : 'Out of Stock'}
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{name}</h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Price */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-900"
          >
            KES {Number(price).toFixed(0)}
          </motion.div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={isInStock && !isLoading ? { scale: 1.05 } : {}}
          whileTap={isInStock && !isLoading ? { scale: 0.95 } : {}}
          onClick={handleAddToCart}
          disabled={!isInStock || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            isAdded
              ? 'bg-green-500 text-white'
              : isInStock && !isLoading
              ? 'text-white hover:opacity-90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          style={isInStock && !isAdded && !isLoading ? { backgroundColor: '#0091AD' } : undefined}
        >
          {isLoading ? (
            'Adding...'
          ) : isAdded ? (
            <>
              <Check size={20} />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};