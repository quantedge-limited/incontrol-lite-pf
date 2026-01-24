'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { imageConfig } from '@/lib/imageConfig';
import Image from 'next/image';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image_path: string | null;
  quantity: number;
  brand?: string;
  supplier?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  description,
  inStock,
  image_path,
  quantity,
  brand,
  supplier,
}) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => setCurrentQuantity(quantity), [quantity]);

  const imageUrl = image_path
    ? imageConfig.getProductImageUrl(image_path)
    : '/images/products/default.jpg';

  const handleAddToCart = async () => {
    if (currentQuantity <= 0 || isLoading) return;

    setIsLoading(true);
    try {
      await addToCart({
        id,
        name,
        price,
        image_path,
        quantity: 1,
      });

      setCurrentQuantity(prev => prev - 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="w-full h-full relative">
          {!imageError ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 p-4">
              <Package className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-gray-600 font-medium text-center">{name}</span>
            </div>
          )}
        </motion.div>

        {/* Stock Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${inStock ? 'bg-green-500' : 'bg-red-500'}`}>
            {inStock ? `${currentQuantity} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
            <span className="font-bold text-lg text-emerald-700">KES {price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{name}</h3>

        {(brand || supplier) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {brand && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{brand}</span>}
            {supplier && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{supplier}</span>}
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{description || 'No description available'}</p>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>Available:</span>
            <span className={`font-medium ${currentQuantity < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{currentQuantity} units</span>
          </div>
          {currentQuantity < 10 && currentQuantity > 0 && (
            <div className="text-xs text-amber-600 font-medium">⚠️ Low stock - order soon!</div>
          )}
        </div>

        <motion.button
          whileHover={inStock && !isLoading ? { scale: 1.02 } : {}}
          whileTap={inStock && !isLoading ? { scale: 0.98 } : {}}
          onClick={handleAddToCart}
          disabled={!inStock || isLoading}
          className={`w-full py-3.5 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden ${isAdded ? 'bg-green-600 text-white' : inStock && !isLoading ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} shadow-md hover:shadow-lg`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Adding...
            </>
          ) : isAdded ? (
            <>
              <Check size={20} />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
