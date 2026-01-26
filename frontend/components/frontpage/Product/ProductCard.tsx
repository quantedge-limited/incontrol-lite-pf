// components/frontpage/Product/ProductCard.tsx - VERIFY EXPORT
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
  image_path: string | null;
  quantity: number;
  brand: string;
  supplier?: string;
  onAddToCart?: (product: any) => void;
}

// Make sure this is exported correctly
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
  onAddToCart,
}) => {
  const handleAddToCart = () => {
    const product = {
      id,
      name,
      price,
      description,
      inStock,
      image_path,
      quantity,
      brand,
      supplier,
    };
    
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="border rounded-xl overflow-hidden shadow-sm bg-white"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {image_path ? (
          <Image
            src={image_path}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
            KES {price.toLocaleString()}
          </span>
          {brand && (
            <span className="text-sm bg-[#e6f7fb] text-[#0091AD] px-2 py-1 rounded">
              {brand}
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
          disabled={!inStock}
          className={`w-full py-2 rounded-lg font-medium ${
            inStock
              ? 'bg-[#0091AD] text-white hover:bg-[#007a91]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
};