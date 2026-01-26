// components/frontpage/Product/ProductCard.tsx - UPDATED
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  name: string;  // Changed back to match ProductsList
  price: number;  // Changed back to match ProductsList
  description?: string;
  quantity: number;  // Changed back to match ProductsList
  inStock: boolean;
  image?: string;
  category?: string;  // Changed from object to string
  is_active: boolean;
  onAddToCart?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  description,
  quantity,
  inStock,
  image,
  category,
  is_active,
  onAddToCart,
}) => {
  const handleAddToCart = () => {
    const product = {
      id,
      name,
      price,
      description,
      quantity,
      inStock,
      image_path: image,
      brand: name,
      category,
    };
    
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Build image URL if it's a relative path
  const imageUrl = image 
    ? image.startsWith('http') 
      ? image 
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${image}`
    : null;

  // Add safety check for price
  const displayPrice = price || 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="border rounded-xl overflow-hidden shadow-sm bg-white"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-[#0091AD] text-xl">
            KES {displayPrice.toLocaleString()}
          </span>
          {category && (
            <span className="text-sm bg-[#e6f7fb] text-[#0091AD] px-2 py-1 rounded">
              {category}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-sm text-gray-500 mb-4">
          {inStock ? (
            <span className="text-green-600">{quantity} in stock</span>
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || !is_active}
          className={`w-full py-2 rounded-lg font-medium ${
            inStock && is_active
              ? 'bg-[#0091AD] text-white hover:bg-[#007a91]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!is_active ? 'Inactive' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
};